import { prisma } from "@/lib/prisma";

/**
 * The set of product ids the customer has wishlisted. One query for the whole
 * storefront (the client provider hydrates from it, then every product card
 * reads its heart state from the shared set — never a query per card).
 */
export async function getWishlistProductIds(customerId: string): Promise<string[]> {
  const rows = await prisma.wishlist.findMany({
    where: { customerId },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}
