"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { ResolvedCategory, CategoryFilters } from "@/lib/shop/queries";
import { useCategoryUrl } from "@/components/shop/category/useCategoryUrl";

const LABEL = "mb-2.5 font-sans text-[12.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft";

export function CategoryFilterSidebar({
  node,
  filters,
}: {
  node: ResolvedCategory;
  filters: CategoryFilters;
}) {
  const { searchParams, setParams } = useCategoryUrl();

  const urlMin = searchParams.get("min") ?? "";
  const urlMax = searchParams.get("max") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";

  // Local price inputs, synced to the URL via render-time adjustment (no effect).
  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);
  const [priceKey, setPriceKey] = useState(`${urlMin}|${urlMax}`);
  const cur = `${urlMin}|${urlMax}`;
  if (cur !== priceKey) {
    setPriceKey(cur);
    setMin(urlMin);
    setMax(urlMax);
  }

  const [brandQuery, setBrandQuery] = useState("");
  const sliderTimer = useRef<number | undefined>(undefined);

  const hasActive = Boolean(
    searchParams.get("search") ||
      searchParams.get("brand") ||
      urlMin ||
      urlMax ||
      searchParams.get("sort"),
  );

  function commitPrice(nextMin: string, nextMax: string) {
    setParams({ min: nextMin.trim() || null, max: nextMax.trim() || null });
  }

  function onSlider(v: string) {
    setMax(v);
    window.clearTimeout(sliderTimer.current);
    sliderTimer.current = window.setTimeout(() => commitPrice(min, v), 300);
  }

  function selectBrand(slug: string) {
    setParams({ brand: activeBrand === slug ? null : slug });
  }

  const visibleBrands = filters.brands.filter((b) =>
    b.name.toLowerCase().includes(brandQuery.trim().toLowerCase()),
  );
  const sliderMax = Math.max(filters.priceMax, Number(max) || 0, 1);

  return (
    <aside className="rounded-[18px] border border-line-soft bg-surface p-[22px] shadow-[0_1px_2px_rgba(20,18,31,0.05)] lg:sticky lg:top-24">
      <div className="mb-[18px] flex items-center gap-2.5 border-b border-line-soft pb-4">
        <Icon name="sliders" size={18} strokeWidth={2} className="text-iris-500" />
        <h3 className="m-0 font-display text-base font-bold text-ink">Filter By</h3>
        {hasActive && (
          <button
            type="button"
            onClick={() => setParams({ search: null, min: null, max: null, brand: null, sort: null })}
            className="ml-auto font-sans text-[12px] font-medium text-iris-500 hover:text-iris-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price */}
      <div className={LABEL}>Price</div>
      <div className="mb-3.5 flex items-end gap-2.5">
        <label className="flex-1">
          <span className="mb-1.5 block font-sans text-[11px] text-muted-soft">Min</span>
          <input
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && commitPrice(min, max)}
            inputMode="numeric"
            className="h-[42px] w-full rounded-[10px] border border-line px-3 font-sans text-[13px] text-ink outline-none focus:border-iris-500"
          />
        </label>
        <span className="pb-[11px] text-muted-soft">—</span>
        <label className="flex-1">
          <span className="mb-1.5 block font-sans text-[11px] text-muted-soft">Max</span>
          <input
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && commitPrice(min, max)}
            inputMode="numeric"
            className="h-[42px] w-full rounded-[10px] border border-line px-3 font-sans text-[13px] text-ink outline-none focus:border-iris-500"
          />
        </label>
        <button
          type="button"
          onClick={() => commitPrice(min, max)}
          aria-label="Apply price"
          className="flex size-[42px] flex-none items-center justify-center rounded-[10px] bg-iris-500 text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="chevronRight" size={17} strokeWidth={2.2} />
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={sliderMax}
        value={Number(max) || sliderMax}
        onChange={(e) => onSlider(e.target.value)}
        aria-label="Maximum price"
        className="mb-6 w-full accent-iris-500"
      />

      {/* Sub-category nav */}
      {node.children.length > 0 && (
        <>
          <div className={LABEL}>Sub-categories</div>
          <div className="mb-6 flex flex-col gap-0.5">
            {node.children.map((c) => (
              <Link
                key={c.slug}
                href={c.href}
                className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 font-sans text-[13.5px] text-ink-soft transition-colors hover:bg-iris-50"
              >
                <span className="flex size-[30px] flex-none items-center justify-center rounded-[9px] bg-field text-iris-500">
                  <Icon name="tag" size={15} strokeWidth={1.9} />
                </span>
                <span className="flex-1 truncate">{c.name}</span>
                <Icon name="chevronRight" size={14} strokeWidth={2} className="text-muted-soft" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Brands (single-select) */}
      {filters.brands.length > 0 && (
        <>
          <div className={LABEL}>Brands</div>
          {filters.brands.length > 5 && (
            <div className="mb-3 flex h-[42px] items-center overflow-hidden rounded-[10px] border border-line bg-field focus-within:border-iris-500">
              <input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Search by brand"
                aria-label="Filter brands"
                className="min-w-0 flex-1 bg-transparent px-3 font-sans text-[13px] text-ink outline-none placeholder:text-muted-soft"
              />
              <span className="px-3 text-muted-soft">
                <Icon name="search" size={16} strokeWidth={2} />
              </span>
            </div>
          )}
          <div className="flex max-h-[264px] flex-col gap-0.5 overflow-y-auto pr-1">
            {visibleBrands.length === 0 ? (
              <span className="px-2 py-2 font-sans text-[12.5px] text-muted-soft">No matching brands.</span>
            ) : (
              visibleBrands.map((b) => {
                const on = activeBrand === b.slug;
                return (
                  <button
                    key={b.slug}
                    type="button"
                    onClick={() => selectBrand(b.slug)}
                    aria-pressed={on}
                    className="flex items-center gap-2.5 rounded-[9px] px-2 py-2 text-left transition-colors hover:bg-iris-50"
                  >
                    <span
                      className={`flex size-[19px] flex-none items-center justify-center rounded-[6px] border ${
                        on ? "border-iris-500 bg-iris-500 text-white" : "border-line-soft bg-surface text-transparent"
                      }`}
                    >
                      <Icon name="delivered" size={12} strokeWidth={3} />
                    </span>
                    <span className="flex-1 truncate font-sans text-[13.5px] text-ink-soft">{b.name}</span>
                    <span className="flex h-[22px] min-w-[26px] items-center justify-center rounded-full bg-field px-[7px] font-sans text-[11px] font-semibold text-muted">
                      {b.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </aside>
  );
}
