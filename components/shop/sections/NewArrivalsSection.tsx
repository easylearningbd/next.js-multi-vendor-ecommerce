import { getNewArrivals } from "@/lib/shop/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { EmptyState } from "@/components/shop/EmptyState";

export async function NewArrivalsSection() {
  const products = await getNewArrivals(10);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <SectionHeader
        title="New Arrivals"
        subtitle="Fresh drops from across the marketplace."
        viewAllHref="/new-arrivals"
      />
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState message="No new arrivals yet." />
      )}
    </section>
  );
}
