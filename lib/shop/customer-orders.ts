import type { OrderStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deriveOrderStatus } from "@/lib/shop/tracking";

export const ORDERS_PAGE_SIZE = 8;

/** A customer may cancel only before the order is being fulfilled. */
export const CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED"];
export function isCancellable(status: OrderStatus): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}

/** Status values offered in the list filter (all real OrderStatus values). */
export const ORDER_STATUS_FILTERS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKAGING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
  "FAILED_TO_DELIVER",
];

export type CustomerOrderSummary = {
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  paymentMethod: "COD" | "STRIPE";
  grandTotal: string; // Decimal → string (money is never a float)
  itemCount: number; // total units across all sellers
  sellerNames: string[]; // distinct vendor store names
  cancellable: boolean;
};

export type CustomerOrdersResult = {
  orders: CustomerOrderSummary[];
  total: number;
  page: number;
  totalPages: number;
};

/**
 * The signed-in customer's own orders, newest first. Scoped by customerId AND
 * `hiddenAt: null` (soft-hidden orders never appear in the customer's list, but
 * the records stay intact). Supports search (order number or a purchased
 * product's snapshot name), status filter, and pagination.
 */
export async function getCustomerOrders(
  customerId: string,
  opts: { q?: string; status?: OrderStatus; page?: number } = {},
): Promise<CustomerOrdersResult> {
  const page = Math.max(1, opts.page ?? 1);
  const q = opts.q?.trim();

  const where: Prisma.OrderWhereInput = {
    customerId,
    hiddenAt: null,
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q } },
            { subOrders: { some: { items: { some: { productName: { contains: q } } } } } },
          ],
        }
      : {}),
  };

  // The parent Order.status is stale after placement — vendors only update their
  // own SubOrder.status. So we derive the customer-facing status from the
  // sub-orders (least-advanced = the order is only as far as its slowest seller).
  // Because the display status is computed, the status filter and pagination must
  // run in JS, not SQL. Customer order sets are small, so this is cheap.
  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      createdAt: true,
      paymentStatus: true,
      paymentMethod: true,
      grandTotal: true,
      subOrders: {
        select: {
          status: true,
          vendor: { select: { storeName: true } },
          items: { select: { qty: true } },
        },
      },
    },
  });

  const all: CustomerOrderSummary[] = rows.map((o) => {
    const status = deriveOrderStatus(o.subOrders.map((s) => s.status));
    return {
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      grandTotal: o.grandTotal.toString(),
      itemCount: o.subOrders.reduce(
        (sum, s) => sum + s.items.reduce((n, i) => n + i.qty, 0),
        0,
      ),
      sellerNames: [...new Set(o.subOrders.map((s) => s.vendor.storeName))],
      cancellable: isCancellable(status),
    };
  });

  const filtered = opts.status ? all.filter((o) => o.status === opts.status) : all;
  const total = filtered.length;
  const orders = filtered.slice((page - 1) * ORDERS_PAGE_SIZE, page * ORDERS_PAGE_SIZE);

  return {
    orders,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
  };
}
