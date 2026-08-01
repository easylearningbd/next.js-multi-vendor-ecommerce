"use server";

import { getQuickViewProduct, type QuickViewProduct } from "@/lib/shop/queries";

/**
 * Server action backing the quick-view modal. Returns the full (visibility-
 * filtered) product detail, or null if the product isn't currently on sale.
 */
export async function fetchQuickView(
  id: string,
): Promise<QuickViewProduct | null> {
  return getQuickViewProduct(id);
}
