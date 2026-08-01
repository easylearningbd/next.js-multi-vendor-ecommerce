import { getLatestProducts } from "@/lib/shop/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { EmptyState } from "@/components/shop/EmptyState";

export async function LatestProductsSection() {
  const products = await getLatestProducts(10);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <SectionHeader
        title="Latest Products"
        subtitle="The newest listings from across the marketplace."
        viewAllHref="/latest"
      />
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState message="No products yet." />
      )}
    </section>
  );
}
