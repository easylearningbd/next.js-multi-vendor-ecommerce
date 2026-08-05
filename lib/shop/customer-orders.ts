import type { OrderStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
    ...(opts.status ? { status: opts.status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q } },
            { subOrders: { some: { items: { some: { productName: { contains: q } } } } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
      select: {
        orderNumber: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        grandTotal: true,
        subOrders: {
          select: {
            vendor: { select: { storeName: true } },
            items: { select: { qty: true } },
          },
        },
      },
    }),
  ]);

  const orders: CustomerOrderSummary[] = rows.map((o) => ({
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    grandTotal: o.grandTotal.toString(),
    itemCount: o.subOrders.reduce(
      (sum, s) => sum + s.items.reduce((n, i) => n + i.qty, 0),
      0,
    ),
    sellerNames: [...new Set(o.subOrders.map((s) => s.vendor.storeName))],
    cancellable: isCancellable(o.status),
  }));

  return {
    orders,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
  };
}
