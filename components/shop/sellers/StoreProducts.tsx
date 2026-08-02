import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { getVendorProducts, type ProductSort } from "@/lib/shop/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";

export function StoreProductsSkeleton() {
  return (
    <div>
      <div className="mb-5 h-4 w-28 animate-pulse rounded bg-line-soft" />
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
            <div className="aspect-square animate-pulse bg-line-soft" />
            <div className="flex flex-col gap-2.5 p-4">
              <div className="h-2.5 w-16 animate-pulse rounded bg-line-soft" />
              <div className="h-3 w-full animate-pulse rounded bg-line-soft" />
              <div className="mt-1 h-4 w-20 animate-pulse rounded bg-line-soft" />
              <div className="mt-1 h-10 w-full animate-pulse rounded-[10px] bg-line-soft" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A store's product grid (visibility-filtered), with count, empty state, and pagination. */
export async function StoreProducts({
  vendorId,
  slug,
  search,
  sort,
  category,
  brand,
  page,
}: {
  vendorId: string;
  slug: string;
  search: string;
  sort: ProductSort;
  category: string;
  brand: string;
  page: number;
}) {
  const { items, total, page: current, totalPages } = await getVendorProducts(vendorId, {
    search,
    sort,
    category,
    brand,
    page,
  });

  const filtered = Boolean(search || category || brand);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[18px] border border-dashed border-line bg-surface px-8 py-[72px] text-center">
        <span className="mb-[22px] flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
          <Icon name="box" size={36} strokeWidth={1.6} />
        </span>
        <div className="font-display text-[20px] font-bold text-ink">
          {filtered ? "No products match your filters" : "No products in this store"}
        </div>
        <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
          {filtered
            ? "This store has no items matching your current filters. Try clearing them."
            : "This seller hasn’t listed any products yet. Check back soon."}
        </p>
        {filtered && (
          <Link
            href={`/sellers/${slug}`}
            className="mt-6 flex h-[46px] items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            Clear filters
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 font-sans text-[13px] text-muted">
        <span className="font-semibold text-ink">{total}</span>{" "}
        {total === 1 ? "product" : "products"}
      </div>

      <ProductGrid products={items} />

      <Pagination
        page={current}
        totalPages={totalPages}
        basePath={`/sellers/${slug}`}
        params={{
          search: search || undefined,
          sort: sort !== "newest" ? sort : undefined,
          category: category || undefined,
          brand: brand || undefined,
        }}
      />
    </div>
  );
}
