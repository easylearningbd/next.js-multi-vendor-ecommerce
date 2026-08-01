import { getFeaturedProducts } from "@/lib/shop/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { EmptyState } from "@/components/shop/EmptyState";

export async function FeaturedProductsSection() {
  const products = await getFeaturedProducts(10);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <SectionHeader
        title="Featured Products"
        subtitle="Hand-picked by our merchandising team this week."
        viewAllHref="/featured"
      />
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState message="No featured products yet." />
      )}
    </section>
  );
}
