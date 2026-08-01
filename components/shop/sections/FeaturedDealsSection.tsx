import Link from "next/link";
import { getFeaturedDeals } from "@/lib/shop/queries";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { EmptyState } from "@/components/shop/EmptyState";

export async function FeaturedDealsSection() {
  const deals = await getFeaturedDeals(8);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <SectionHeader
        title="Featured Deals"
        subtitle="Save more on our most-loved products."
        viewAllHref="/offers"
      />
      {deals.length > 0 ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {deals.map((d) => (
            <Link
              key={d.id}
              href={`/products/${d.slug}`}
              className="flex items-center gap-3.5 rounded-2xl border border-line-soft bg-surface p-3.5 shadow-[0_1px_2px_rgba(20,18,31,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-[0_14px_32px_-14px_rgba(20,18,31,0.18)]"
            >
              <div className="relative flex size-[82px] flex-none items-center justify-center overflow-hidden rounded-xl bg-field">
                {d.thumbnail ? (
                  <img
                    src={d.thumbnail}
                    alt={d.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                {d.discountPercent != null && (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-iris-100 px-1.5 py-1 font-sans text-[9.5px] font-semibold text-iris-700">
                    −{d.discountPercent}%
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="mb-2 line-clamp-2 font-sans text-sm font-medium leading-[1.35] text-ink">
                  {d.name}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-base font-bold text-iris-500">
                    {d.price}
                  </span>
                  {d.compareAt && (
                    <span className="font-sans text-[12.5px] text-muted-soft line-through">
                      {d.compareAt}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon="tag" message="No featured deals yet." />
      )}
    </section>
  );
}
