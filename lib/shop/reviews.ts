import type { OrderStatus, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ReviewableItem = {
  orderItemId: string;
  productId: string;
  productName: string;
  variantLabel: string | null;
  slug: string | null;
  thumbnail: string | null;
  sellerName: string;
  review: { status: ReviewStatus; rating: number } | null;
};

/**
 * Everything the order-details Reviews tab needs, scoped to the signed-in
 * customer: the order status (gates whether reviews are allowed) and each
 * purchased line with its existing review (if the customer already left one).
 * Returns null when the order isn't this customer's / doesn't exist.
 */
export async function getReviewableItems(
  orderNumber: string,
  customerId: string,
): Promise<{ status: OrderStatus; items: ReviewableItem[] } | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId },
    select: {
      status: true,
      subOrders: {
        orderBy: { createdAt: "asc" },
        select: {
          vendor: { select: { storeName: true } },
          items: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              productId: true,
              productName: true,
              variantLabel: true,
              product: { select: { slug: true, thumbnail: true } },
              // The customer's own review for this line, if any (≤1 by unique constraint).
              reviews: {
                where: { customerId },
                select: { status: true, rating: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  const items: ReviewableItem[] = order.subOrders.flatMap((s) =>
    s.items.map((it) => ({
      orderItemId: it.id,
      productId: it.productId,
      productName: it.productName,
      variantLabel: it.variantLabel,
      slug: it.product?.slug ?? null,
      thumbnail: it.product?.thumbnail ?? null,
      sellerName: s.vendor.storeName,
      review: it.reviews[0] ?? null,
    })),
  );

  return { status: order.status, items };
}
