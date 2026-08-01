import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { getFlashDeals } from "@/lib/shop/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FlashCountdown } from "@/components/shop/FlashCountdown";
import { EmptyState } from "@/components/shop/EmptyState";

export async function FlashDealSection() {
  const deals = await getFlashDeals(10);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-16">
      <div className="rounded-[22px] border border-iris-100 bg-[linear-gradient(120deg,var(--color-iris-50)_0%,var(--color-bg-subtle)_100%)] px-7 pb-[30px] pt-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-[14px] bg-iris-500 text-white shadow-[0_8px_20px_-6px_rgba(101,68,224,0.6)]">
              <Icon name="zap" size={24} />
            </span>
            <div>
              <h2 className="m-0 font-display text-[26px] font-bold leading-none tracking-[-0.01em] text-ink">
                Flash Deal
              </h2>
              <p className="mt-2 font-sans text-[13.5px] text-muted">
                Limited stock — prices climb back when the timer ends.
              </p>
            </div>
          </div>

          <FlashCountdown />

          <Link
            href="/offers"
            className="flex items-center gap-1.5 whitespace-nowrap font-sans text-[13.5px] font-semibold text-iris-500 hover:text-iris-600"
          >
            View all
            <Icon name="chevronRight" size={16} strokeWidth={2} />
          </Link>
        </div>

        {deals.length > 0 ? (
          <ProductGrid products={deals} />
        ) : (
          <EmptyState icon="zap" message="No flash deals running right now. Check back soon." />
        )}
      </div>
    </section>
  );
}
