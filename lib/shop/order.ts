import { prisma } from "@/lib/prisma";

/**
 * Confirmation / invoice data layer.
 *
 * Reads a placed order for the customer who owns it. Scoped by customerId so a
 * shopper can only ever load their OWN order (the confirmation + invoice routes
 * are reachable by URL, so the ownership check is the access control — never
 * trust the URL alone). Returns `null` when the order does not exist or belongs
 * to someone else; callers turn that into a 404.
 *
 * The order is split by seller: the parent Order carries the totals + addresses,
 * each SubOrder is one vendor's slice (its items, subtotal, discount, coupon).
 * OrderItem fields are snapshots taken at placement, so they render correctly
 * even if the product was later edited or deactivated; we join the live product
 * only for a thumbnail + a link, both optional.
 */
export async function getConfirmationOrder(orderNumber: string, customerId: string) {
  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId },
    include: {
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

  return order;
}

export type ConfirmationOrder = NonNullable<
  Awaited<ReturnType<typeof getConfirmationOrder>>
>;
export type ConfirmationSubOrder = ConfirmationOrder["subOrders"][number];
