import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { statusFromSlug } from "@/lib/vendor/orders";
import { deriveOrderStatus } from "@/lib/shop/tracking";

/**
 * Admin (platform-wide) order data layer — NO vendor/customer scoping. Admin is
 * the oversight role and sees every order across all vendors and customers, the
 * complete parent order, and the grand total. Read-only.
 *
 * STATUS-FILTER RULE: an order matches `?status=X` when ANY of its sub-orders is
 * in status X. Sub-order status is the live fulfillment truth (vendors drive it);
 * the parent Order.status is stale after checkout. A divergent multi-vendor order
 * can therefore appear under more than one status — intentional and consistent
 * with the sidebar Pending badge.
 */

export const ADMIN_ORDERS_PAGE_SIZE = 12;

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKAGING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNED",
  "FAILED_TO_DELIVER",
  "CANCELED",
];

export type AdminOrderRow = {
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  storeNames: string[]; // every vendor in the order (a multi-vendor order lists several)
  itemCount: number;
  grandTotal: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus; // derived from the sub-orders (least-advanced seller)
};

export type AdminOrdersResult = {
  rows: AdminOrderRow[];
  total: number; // orders matching the current status filter + search (for pagination)
  page: number;
  totalPages: number;
  status?: OrderStatus; // resolved filter, if any
  /** Platform-wide overview counts (independent of the current filter/search). */
  summary: { total: number; byStatus: Record<OrderStatus, number> };
};

/**
 * Platform-wide orders, newest first, filtered by status (any-sub-order rule) and
 * an optional search over order number or customer name. Paginated. Also returns
 * a stable platform overview (total + per-status counts).
 */
export async function getAdminOrders(
  opts: { statusSlug?: string; search?: string; page?: number } = {},
): Promise<AdminOrdersResult> {
  const page = Math.max(1, opts.page ?? 1);
  const status = statusFromSlug(opts.statusSlug);
  const q = opts.search?.trim();

  const where: Prisma.OrderWhereInput = {
    ...(status ? { subOrders: { some: { status } } } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q } },
            { shipName: { contains: q } },
            { customer: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  const [total, rows, allTotal, statusCounts] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_ORDERS_PAGE_SIZE,
      take: ADMIN_ORDERS_PAGE_SIZE,
      select: {
        orderNumber: true,
        createdAt: true,
        grandTotal: true,
        paymentStatus: true,
        shipName: true,
        shipPhone: true,
        customer: { select: { name: true } },
        subOrders: {
          select: {
            status: true,
            vendor: { select: { storeName: true } },
            items: { select: { qty: true } },
          },
        },
      },
    }),
    prisma.order.count(),
    Promise.all(
      ALL_STATUSES.map((st) =>
        prisma.order.count({ where: { subOrders: { some: { status: st } } } }),
      ),
    ),
  ]);

  const byStatus = Object.fromEntries(
    ALL_STATUSES.map((st, i) => [st, statusCounts[i]]),
  ) as Record<OrderStatus, number>;

  return {
    rows: rows.map((o) => ({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      customerName: o.customer?.name ?? o.shipName,
      customerPhone: o.shipPhone,
      storeNames: [...new Set(o.subOrders.map((s) => s.vendor.storeName))],
      itemCount: o.subOrders.reduce((n, s) => n + s.items.reduce((m, i) => m + i.qty, 0), 0),
      grandTotal: o.grandTotal.toString(),
      paymentStatus: o.paymentStatus,
      status: deriveOrderStatus(o.subOrders.map((s) => s.status)),
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE)),
    status,
    summary: { total: allTotal, byStatus },
  };
}

/**
 * The COMPLETE order by number — unscoped (admin oversight): every vendor's
 * sub-order, all items, full customer + address, grand total. Powers the admin
 * details page and the full-order invoice. Returns null → caller 404s.
 */
export async function getAdminOrder(orderNumber: string) {
  return prisma.order.findFirst({
    where: { orderNumber },
    include: {
      customer: { select: { name: true, email: true } },
      subOrders: {
        orderBy: { createdAt: "asc" },
        include: {
          vendor: { select: { storeName: true, slug: true, logo: true } },
          coupon: { select: { code: true } },
          items: {
            orderBy: { createdAt: "asc" },
            include: {
              product: { select: { slug: true, thumbnail: true } },
            },
          },
        },
      },
    },
  });
}

export type AdminOrder = NonNullable<Awaited<ReturnType<typeof getAdminOrder>>>;
