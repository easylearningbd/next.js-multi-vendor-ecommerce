import { StorefrontHeader } from "@/components/shop/StorefrontHeader";
import { StorefrontFooter } from "@/components/shop/StorefrontFooter";
import { CartProvider } from "@/components/shop/cart/CartProvider";
import { QuickViewProvider } from "@/components/shop/quick-view/QuickViewProvider";
import { WishlistProvider } from "@/components/shop/wishlist/WishlistProvider";
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
    <CartProvider>
      <WishlistProvider>
        <QuickViewProvider>
          <div className="flex min-h-screen flex-col bg-bg">
            <StorefrontHeader categories={categories} />
            <main className="flex-1">{children}</main>
            <StorefrontFooter />
          </div>
        </QuickViewProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
