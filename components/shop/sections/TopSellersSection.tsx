import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { getTopSellers, type TopSeller } from "@/lib/shop/queries";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { EmptyState } from "@/components/shop/EmptyState";

function TopSellerCard({ seller }: { seller: TopSeller }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-[0_1px_2px_rgba(20,18,31,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-[0_16px_34px_-14px_rgba(20,18,31,0.18)]">
      <div className="h-[60px] overflow-hidden bg-[linear-gradient(120deg,var(--color-iris-100),var(--color-iris-50))]">
        {seller.coverImage && (
          <img
            src={seller.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="px-[18px] pb-5">
        <div className="-mt-7 flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-line-soft bg-surface text-iris-500 shadow-[0_4px_12px_-4px_rgba(20,18,31,0.16)]">
          {seller.logo ? (
            <img
              src={seller.logo}
              alt={seller.storeName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon name="store" size={26} strokeWidth={1.8} />
          )}
        </div>
        <div className="mt-3.5 font-display text-base font-bold leading-tight text-ink">
          {seller.storeName}
        </div>
        <div className="mt-3.5 flex items-center gap-1.5 text-muted-soft">
          <Icon name="box" size={15} strokeWidth={1.9} />
          <span className="font-sans text-[12px]">
            {seller.productCount} {seller.productCount === 1 ? "product" : "products"}
          </span>
        </div>
        <Link
          href={`/sellers/${seller.slug}`}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-[10px] border border-line bg-surface font-sans text-[13px] font-semibold text-ink transition-colors hover:border-iris-500 hover:bg-iris-500 hover:text-white"
        >
          Visit store
        </Link>
      </div>
    </div>
  );
}

export async function TopSellersSection() {
  const sellers = await getTopSellers(8);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <SectionHeader
        title="Top Sellers"
        subtitle="Independent stores with the widest selection on Covet."
        viewAllHref="/sellers"
        viewAllLabel="All sellers"
      />
      {sellers.length > 0 ? (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {sellers.map((s) => (
            <TopSellerCard key={s.id} seller={s} />
          ))}
        </div>
      ) : (
        <EmptyState icon="store" message="No sellers to feature yet." />
      )}
    </section>
  );
}
