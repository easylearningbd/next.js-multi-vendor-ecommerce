import type { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ReviewableItem = {
  orderItemId: string;
  productId: string;
  productName: string;
  variantLabel: string | null;
  slug: string | null;
  thumbnail: string | null;
  sellerName: string;
  /** True once THIS item's sub-order (its seller) is delivered — reviews are per-seller. */
  delivered: boolean;
  review: { status: ReviewStatus; rating: number } | null;
};

/**
 * Everything the order-details Reviews tab needs, scoped to the signed-in
 * customer: each purchased line, whether its SELLER's sub-order is delivered
 * (reviews unlock per seller, not for the whole order), and any existing review.
 * Returns null when the order isn't this customer's / doesn't exist.
 */
export async function getReviewableItems(
  orderNumber: string,
  customerId: string,
): Promise<ReviewableItem[] | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId },
    select: {
      subOrders: {
        orderBy: { createdAt: "asc" },
        select: {
          status: true,
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

  return order.subOrders.flatMap((s) =>
    s.items.map((it) => ({
      orderItemId: it.id,
      productId: it.productId,
      productName: it.productName,
      variantLabel: it.variantLabel,
      slug: it.product?.slug ?? null,
      thumbnail: it.product?.thumbnail ?? null,
      sellerName: s.vendor.storeName,
      delivered: s.status === "DELIVERED",
      review: it.reviews[0] ?? null,
    })),
  );
}
