import { StorefrontHeader } from "@/components/shop/StorefrontHeader";
import { StorefrontFooter } from "@/components/shop/StorefrontFooter";
import { getStorefrontCategoryTree } from "@/lib/shop/queries";

/**
 * Shared storefront shell — wraps every storefront page (home, listing,
 * product, search, …) with the header (utility bar, search, mega-menu, cart)
 * and footer. Server Component; the interactive pieces (search, mega-menu,
 * cart) are client islands inside the header.
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getStorefrontCategoryTree();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <StorefrontHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
