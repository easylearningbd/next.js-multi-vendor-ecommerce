import { prisma } from "@/lib/prisma";
import { CARD_SELECT, toCard, type StorefrontProduct } from "@/lib/shop/queries";

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

export type WishlistEntry = {
  product: StorefrontProduct;
  /** False when the product is no longer storefront-visible (unapproved/hidden). */
  available: boolean;
  wishlistedAt: string;
};

/**
 * The customer's wishlist with full product data for the page, newest first.
 * Scoped by customerId. Products that later became unavailable (unapproved or
 * hidden) are still returned but flagged `available: false` so the page can show
 * them as unavailable instead of crashing; deleted products simply have no row
 * (the FK cascades), so they never appear.
 */
export async function getWishlistItems(customerId: string): Promise<WishlistEntry[]> {
  const rows = await prisma.wishlist.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      product: { select: { ...CARD_SELECT, approvalStatus: true, isActive: true } },
    },
  });

  return rows.map((r) => ({
    product: toCard(r.product),
    available: r.product.approvalStatus === "APPROVED" && r.product.isActive,
    wishlistedAt: r.createdAt.toISOString(),
  }));
}
