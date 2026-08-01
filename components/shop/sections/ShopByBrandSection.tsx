import Link from "next/link";
import { getBrands } from "@/lib/shop/queries";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { EmptyState } from "@/components/shop/EmptyState";

export async function ShopByBrandSection() {
  const brands = await getBrands(12);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <SectionHeader
        title="Shop by Brand"
        viewAllHref="/brands"
        viewAllLabel="All brands"
      />
      {brands.length > 0 ? (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              title={`${b.name} — ${b.productCount} ${b.productCount === 1 ? "product" : "products"}`}
              className="flex h-[76px] items-center justify-center overflow-hidden rounded-[14px] border border-line-soft bg-surface px-4 text-center font-display text-lg font-semibold text-muted shadow-[0_1px_2px_rgba(20,18,31,0.05)] transition-[color,box-shadow] duration-200 hover:text-ink hover:shadow-[0_12px_26px_-12px_rgba(20,18,31,0.18)]"
            >
              {b.image ? (
                <img
                  src={b.image}
                  alt={b.name}
                  className="max-h-[44px] max-w-full object-contain"
                />
              ) : (
                b.name
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon="award" message="No brands yet." />
      )}
    </section>
  );
}
