import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const VENDOR_ORDERS_PAGE_SIZE = 10;

/** URL slug ↔ OrderStatus (the sidebar links use these slugs). */
const STATUS_BY_SLUG: Record<string, OrderStatus> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  packaging: "PACKAGING",
  "out-for-delivery": "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  returned: "RETURNED",
  "failed-to-deliver": "FAILED_TO_DELIVER",
  canceled: "CANCELED",
};
export function statusFromSlug(slug?: string): OrderStatus | undefined {
  return slug ? STATUS_BY_SLUG[slug] : undefined;
}

/**
 * Allowed forward transitions for a vendor updating a sub-order. Prevents going
 * backwards (e.g. DELIVERED → PENDING) and models the terminal states:
 * CANCELED / RETURNED accept no further change. Shared by the update action AND
 * the status <select> so they can never disagree.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["PACKAGING", "CANCELED"],
  PACKAGING: ["OUT_FOR_DELIVERY", "CANCELED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_TO_DELIVER"],
  DELIVERED: ["RETURNED"],
  FAILED_TO_DELIVER: ["OUT_FOR_DELIVERY", "CANCELED"],
  CANCELED: [],
  RETURNED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** The signed-in vendor's id, or null (not a vendor / no store). */
export async function getSessionVendorId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") return null;
  if (session.user.vendorId) return session.user.vendorId;
  const v = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return v?.id ?? null;
}

export type VendorSubOrderRow = {
  id: string; // sub-order id → details / invoice
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  amount: string; // THIS vendor's sub-order total (never the grand total)
  paymentStatus: PaymentStatus;
  status: OrderStatus;
};

export type VendorSubOrdersResult = {
  rows: VendorSubOrderRow[];
  total: number;
  page: number;
  totalPages: number;
};

/**
 * This vendor's SUB-ORDERS (never whole orders), newest first, scoped by
 * vendorId. Filter by status, search by order number or shipping name. The
 * `amount` is the vendor's own sub-order total, not the parent order's grand total.
 */
export async function getVendorSubOrders(
  vendorId: string,
  opts: { status?: OrderStatus; search?: string; page?: number } = {},
): Promise<VendorSubOrdersResult> {
  const page = Math.max(1, opts.page ?? 1);
  const q = opts.search?.trim();

  const where: Prisma.SubOrderWhereInput = {
    vendorId,
    ...(opts.status ? { status: opts.status } : {}),
    ...(q
      ? {
          OR: [
            { order: { orderNumber: { contains: q } } },
            { order: { shipName: { contains: q } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.subOrder.count({ where }),
    prisma.subOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * VENDOR_ORDERS_PAGE_SIZE,
      take: VENDOR_ORDERS_PAGE_SIZE,
      select: {
        id: true,
        status: true,
        total: true,
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            shipName: true,
            shipPhone: true,
            paymentStatus: true,
          },
        },
        items: { select: { qty: true } },
      },
    }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      orderNumber: r.order.orderNumber,
      createdAt: r.order.createdAt,
      customerName: r.order.shipName,
      customerPhone: r.order.shipPhone,
      itemCount: r.items.reduce((n, i) => n + i.qty, 0),
      amount: r.total.toString(),
      paymentStatus: r.order.paymentStatus,
      status: r.status,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / VENDOR_ORDERS_PAGE_SIZE)),
  };
}

/** Per-status counts for this vendor's sub-orders (summary cards + Pending badge). */
export async function getVendorOrderCounts(
  vendorId: string,
): Promise<{ total: number; byStatus: Record<OrderStatus, number> }> {
  const grouped = await prisma.subOrder.groupBy({
    by: ["status"],
    where: { vendorId },
    _count: true,
  });
  const byStatus = {
    PENDING: 0,
    CONFIRMED: 0,
    PACKAGING: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    CANCELED: 0,
    RETURNED: 0,
    FAILED_TO_DELIVER: 0,
  } as Record<OrderStatus, number>;
  let total = 0;
  for (const g of grouped) {
    byStatus[g.status] = g._count;
    total += g._count;
  }
  return { total, byStatus };
}

/**
 * ONE of this vendor's sub-orders, scoped by (id, vendorId) — null when it isn't
 * this vendor's (or doesn't exist), so a vendor can never open another vendor's
 * slice. Carries the customer/shipping info, THIS vendor's items + totals, and
 * any coupon applied to this sub-order. Used by the details page + the invoice.
 */
export async function getVendorSubOrder(id: string, vendorId: string) {
  return prisma.subOrder.findFirst({
    where: { id, vendorId },
    select: {
      id: true,
      status: true,
      subtotal: true,
      discount: true,
      total: true,
      createdAt: true,
      coupon: { select: { code: true } },
      vendor: { select: { storeName: true, slug: true, logo: true } },
      order: {
        select: {
          orderNumber: true,
          createdAt: true,
          paymentMethod: true,
          paymentStatus: true,
          note: true,
          shipName: true,
          shipEmail: true,
          shipPhone: true,
          shipCountry: true,
          shipCity: true,
          shipZip: true,
          shipAddress: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productName: true,
          variantLabel: true,
          unitPrice: true,
          qty: true,
          lineTotal: true,
          product: { select: { slug: true, thumbnail: true } },
        },
      },
    },
  });
}

export type VendorSubOrderDetail = NonNullable<Awaited<ReturnType<typeof getVendorSubOrder>>>;
