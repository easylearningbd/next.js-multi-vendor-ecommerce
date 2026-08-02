import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import {
  getCategoryProducts,
  type ResolvedCategory,
  type CategorySort,
} from "@/lib/shop/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";

export function CategoryProductsSkeleton() {
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

export type CategoryQuery = {
  search: string;
  min?: number;
  max?: number;
  brand: string;
  sort: CategorySort;
  page: number;
};

/** Async results: product count + grid + pagination, or an empty state. */
export async function CategoryResults({
  node,
  query,
}: {
  node: ResolvedCategory;
  query: CategoryQuery;
}) {
  const { items, total, page, totalPages } = await getCategoryProducts(node, {
    search: query.search || undefined,
    min: query.min,
    max: query.max,
    brand: query.brand || undefined,
    sort: query.sort,
    page: query.page,
  });

  const filtered = Boolean(
    query.search || query.brand || query.min != null || query.max != null,
  );
  const basePath = `/category/${node.path.join("/")}`;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[18px] border border-dashed border-line bg-surface px-8 py-[72px] text-center">
        <span className="mb-[22px] flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
          <Icon name="box" size={36} strokeWidth={1.6} />
        </span>
        <div className="font-display text-[20px] font-bold text-ink">
          {filtered ? "No products match your filters" : "No products in this category yet"}
        </div>
        <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
          {filtered
            ? "Nothing here matches your current filters. Try clearing them."
            : "There are no products in this category right now. Check back soon."}
        </p>
        {filtered && (
          <Link
            href={basePath}
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
        <span className="font-semibold text-iris-500">{total}</span>{" "}
        {total === 1 ? "item" : "items"} found
      </div>

      <ProductGrid products={items} />

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={basePath}
        params={{
          search: query.search || undefined,
          min: query.min != null ? String(query.min) : undefined,
          max: query.max != null ? String(query.max) : undefined,
          brand: query.brand || undefined,
          sort: query.sort !== "newest" ? query.sort : undefined,
        }}
      />
    </div>
  );
}
