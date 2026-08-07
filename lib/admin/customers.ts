import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deriveOrderStatus } from "@/lib/shop/tracking";

/**
 * Admin customer-management data layer — platform-wide, read-only. Customers are
 * Users with role=CUSTOMER. Order count + total spent are computed from real
 * orders (never a stored counter); money stays Decimal until display.
 */

export const ADMIN_CUSTOMERS_PAGE_SIZE = 12;

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  orderCount: number;
  totalSpent: string; // Σ grandTotal of their orders
};

export type AdminCustomersResult = {
  rows: AdminCustomerRow[];
  total: number;
  page: number;
  totalPages: number;
};

/**
 * Customers (role=CUSTOMER), newest first, with per-customer order count + total
 * spent from real orders. One users page + one grouped-order aggregate (no N+1).
 */
export async function getAdminCustomers(
  opts: { search?: string; page?: number } = {},
): Promise<AdminCustomersResult> {
  const page = Math.max(1, opts.page ?? 1);
  const q = opts.search?.trim();

  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_CUSTOMERS_PAGE_SIZE,
      take: ADMIN_CUSTOMERS_PAGE_SIZE,
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    }),
  ]);

  const ids = users.map((u) => u.id);
  const spend = ids.length
    ? await prisma.order.groupBy({
        by: ["customerId"],
        where: { customerId: { in: ids } },
        _sum: { grandTotal: true },
        _count: { _all: true },
      })
    : [];
  const byCustomer = new Map(spend.map((s) => [s.customerId, s]));

  return {
    rows: users.map((u) => {
      const agg = byCustomer.get(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt,
        orderCount: agg?._count._all ?? 0,
        totalSpent: (agg?._sum.grandTotal ?? new Prisma.Decimal(0)).toString(),
      };
    }),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_CUSTOMERS_PAGE_SIZE)),
  };
}

/**
 * ONE customer with the full read-only picture: profile, order history summary
 * (count, total spent, recent orders with derived status), latest shipping
 * address, and the reviews they've written. Returns null → caller 404s. Guards
 * role=CUSTOMER so admin/vendor ids don't resolve here.
 */
export async function getAdminCustomer(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true },
  });
  if (!user) return null;

  const [agg, recentOrders, latestAddressed, reviews] = await Promise.all([
    prisma.order.aggregate({
      where: { customerId: id },
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        orderNumber: true,
        createdAt: true,
        grandTotal: true,
        subOrders: { select: { status: true } },
      },
    }),
    prisma.order.findFirst({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
      select: {
        shipName: true,
        shipPhone: true,
        shipAddress: true,
        shipCity: true,
        shipZip: true,
        shipCountry: true,
      },
    }),
    prisma.review.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        product: { select: { name: true, thumbnail: true, slug: true } },
      },
    }),
  ]);

  return {
    ...user,
    orderCount: agg._count._all,
    totalSpent: (agg._sum.grandTotal ?? new Prisma.Decimal(0)).toString(),
    recentOrders: recentOrders.map((o) => ({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      grandTotal: o.grandTotal.toString(),
      status: deriveOrderStatus(o.subOrders.map((s) => s.status)),
    })),
    address: latestAddressed,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      excerpt: r.comment,
      status: r.status,
      createdAt: r.createdAt,
      productName: r.product.name,
      productThumbnail: r.product.thumbnail,
      productSlug: r.product.slug,
    })),
  };
}

export type AdminCustomerDetail = NonNullable<Awaited<ReturnType<typeof getAdminCustomer>>>;
