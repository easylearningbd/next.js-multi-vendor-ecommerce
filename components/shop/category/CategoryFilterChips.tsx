"use client";

import { Icon } from "@/components/dashboard/Icon";
import type { StoreFacet } from "@/lib/shop/queries";
import { useCategoryUrl } from "@/components/shop/category/useCategoryUrl";

/** Active-filter chips with individual removal + clear all. URL-driven. */
export function CategoryFilterChips({ brands }: { brands: StoreFacet[] }) {
  const { searchParams, setParams } = useCategoryUrl();

  const search = searchParams.get("search");
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const brand = searchParams.get("brand");

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (search) {
    chips.push({ key: "search", label: `Search: “${search}”`, clear: () => setParams({ search: null }) });
  }
  if (min || max) {
    const label =
      min && max ? `$${min} – $${max}` : min ? `From $${min}` : `Up to $${max}`;
    chips.push({ key: "price", label: `Price: ${label}`, clear: () => setParams({ min: null, max: null }) });
  }
  if (brand) {
    const name = brands.find((b) => b.slug === brand)?.name ?? brand;
    chips.push({ key: "brand", label: `Brand: ${name}`, clear: () => setParams({ brand: null }) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <span
          key={c.key}
          className="flex items-center gap-1.5 rounded-full border border-iris-100 bg-iris-50 py-1.5 pl-3 pr-2 font-sans text-[12.5px] font-medium text-iris-700"
        >
          {c.label}
          <button
            type="button"
            onClick={c.clear}
            aria-label={`Remove ${c.label}`}
            className="flex size-4 items-center justify-center rounded-full text-iris-500 transition-colors hover:bg-iris-200 hover:text-iris-800"
          >
            <Icon name="x" size={12} strokeWidth={2.4} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => setParams({ search: null, min: null, max: null, brand: null, sort: null })}
        className="ml-1 font-sans text-[12.5px] font-semibold text-iris-500 hover:text-iris-700"
      >
        Clear all
      </button>
    </div>
  );
}
