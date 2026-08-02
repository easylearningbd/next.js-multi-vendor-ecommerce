import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { getApprovedVendors, type VendorSort } from "@/lib/shop/queries";
import { SellerCard } from "@/components/shop/sellers/SellerCard";
import { SellerPagination } from "@/components/shop/sellers/SellerPagination";

/**
 * Async results for the seller list: fetches approved vendors and renders the
 * count + grid, or an empty state. Wrapped in Suspense (keyed by params) so it
 * shows the skeleton on every search / sort / page change.
 */
export async function SellerResults({
  search,
  sort,
  page,
}: {
  search: string;
  sort: VendorSort;
  page: number;
}) {
  const { items, total, page: current, totalPages } = await getApprovedVendors({
    search,
    sort,
    page,
  });

  if (items.length === 0) {
    const filtered = search.length > 0;
    return (
      <div className="flex flex-col items-center rounded-[18px] border border-dashed border-line bg-surface px-8 py-[72px] text-center">
        <span className="mb-[22px] flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
          <Icon name="store" size={36} strokeWidth={1.6} />
        </span>
        <div className="font-display text-[20px] font-bold text-ink">
          {filtered ? "No stores found" : "No sellers yet"}
        </div>
        <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
          {filtered
            ? `No stores match “${search}”. Try a different name.`
            : "There are no approved sellers to show right now. Check back soon."}
        </p>
        {filtered && (
          <Link
            href="/sellers"
            className="mt-6 flex h-[46px] items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            Clear search
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 font-sans text-[13px] text-muted">
        <span className="font-semibold text-ink">{total}</span>{" "}
        {total === 1 ? "store" : "stores"}
        {search ? (
          <>
            {" "}
            for “<span className="font-semibold text-ink">{search}</span>”
          </>
        ) : null}
      </div>

      <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {items.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>

      <SellerPagination
        page={current}
        totalPages={totalPages}
        search={search}
        sort={sort}
      />
    </div>
  );
}
