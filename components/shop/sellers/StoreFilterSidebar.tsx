import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { StoreFacets } from "@/lib/shop/queries";

type Active = { search: string; sort: string; category: string; brand: string };

/** Build a store URL, preserving other active filters and clearing page. */
function storeHref(slug: string, active: Active, override: Partial<Active>): string {
  const m = { ...active, ...override };
  const q = new URLSearchParams();
  if (m.search) q.set("search", m.search);
  if (m.sort && m.sort !== "newest") q.set("sort", m.sort);
  if (m.category) q.set("category", m.category);
  if (m.brand) q.set("brand", m.brand);
  const s = q.toString();
  return s ? `/sellers/${slug}?${s}` : `/sellers/${slug}`;
}

const rowBase =
  "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 font-sans text-[13.5px] transition-colors";

/**
 * Store filter sidebar — categories + brands derived ONLY from this store's
 * visible products (scoped facets), single-select via URL. Sections with no
 * facets are hidden.
 */
export function StoreFilterSidebar({
  slug,
  facets,
  active,
}: {
  slug: string;
  facets: StoreFacets;
  active: Active;
}) {
  const hasFacets = facets.categories.length > 0 || facets.brands.length > 0;

  return (
    <aside className="rounded-[18px] border border-line-soft bg-surface p-[22px] shadow-[0_1px_2px_rgba(20,18,31,0.05)] lg:sticky lg:top-24">
      <h3 className="mb-5 border-b border-line-soft pb-4 font-display text-[17px] font-bold text-ink">
        Filter By
      </h3>

      {!hasFacets && (
        <p className="font-sans text-[13px] text-muted">
          No filters available for this store yet.
        </p>
      )}

      {facets.categories.length > 0 && (
        <div className="mb-6">
          <div className="mb-2.5 font-sans text-[12.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
            Categories
          </div>
          <div className="flex flex-col gap-0.5">
            <Link
              href={storeHref(slug, active, { category: "" })}
              className={`${rowBase} ${!active.category ? "bg-iris-50 font-semibold text-iris-700" : "text-ink-soft hover:bg-iris-50"}`}
            >
              <span className="flex-1">All Categories</span>
            </Link>
            {facets.categories.map((c) => {
              const on = active.category === c.slug;
              return (
                <Link
                  key={c.slug}
                  href={storeHref(slug, active, { category: on ? "" : c.slug })}
                  className={`${rowBase} ${on ? "bg-iris-50 font-semibold text-iris-700" : "text-ink-soft hover:bg-iris-50"}`}
                >
                  <span className="flex size-[30px] flex-none items-center justify-center rounded-[9px] bg-field text-iris-500">
                    <Icon name="tag" size={15} strokeWidth={1.9} />
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-sans text-[11px] font-semibold text-muted-soft">
                    {c.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {facets.brands.length > 0 && (
        <div>
          <div className="mb-2.5 font-sans text-[12.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
            Brands
          </div>
          <div className="flex max-h-[250px] flex-col gap-0.5 overflow-y-auto pr-1">
            <Link
              href={storeHref(slug, active, { brand: "" })}
              className={`${rowBase} ${!active.brand ? "bg-iris-50 font-semibold text-iris-700" : "text-ink-soft hover:bg-iris-50"}`}
            >
              <span className="flex-1">All Brands</span>
            </Link>
            {facets.brands.map((b) => {
              const on = active.brand === b.slug;
              return (
                <Link
                  key={b.slug}
                  href={storeHref(slug, active, { brand: on ? "" : b.slug })}
                  className={`${rowBase} ${on ? "bg-iris-50 font-semibold text-iris-700" : "text-ink-soft hover:bg-iris-50"}`}
                >
                  <span className="flex-1 truncate">{b.name}</span>
                  <span className="flex h-[22px] min-w-[26px] items-center justify-center rounded-full bg-field px-[7px] font-sans text-[11px] font-semibold text-muted">
                    {b.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
