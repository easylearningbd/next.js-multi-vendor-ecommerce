"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/dashboard/Icon";
import { useCategoryUrl } from "@/components/shop/category/useCategoryUrl";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
] as const;

/** Category header: title + debounced in-category search + sort. URL-driven. */
export function CategoryToolbar({
  name,
  search,
  sort,
}: {
  name: string;
  search: string;
  sort: string;
}) {
  const { setParams } = useCategoryUrl();
  const [q, setQ] = useState(search);
  const [lastSearch, setLastSearch] = useState(search);
  const timer = useRef<number | undefined>(undefined);

  // Sync the input when the URL's search changes elsewhere (chips "clear", etc.)
  // via render-time adjustment — not an effect.
  if (search !== lastSearch) {
    setLastSearch(search);
    setQ(search);
  }

  // Clear any pending debounce on unmount.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function onSearchChange(value: string) {
    setQ(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setParams({ search: value.trim() || null });
    }, 400);
  }

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-[18px] border border-line-soft bg-surface px-6 py-5 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <h1 className="m-0 flex-none whitespace-nowrap font-display text-[24px] font-bold leading-[1.1] tracking-[-0.01em] text-ink">
        {name}
      </h1>

      <div className="flex h-[46px] min-w-[220px] flex-1 items-center overflow-hidden rounded-xl border border-line bg-field transition-[border-color,box-shadow] focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]">
        <input
          type="search"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search within ${name}…`}
          aria-label={`Search within ${name}`}
          className="min-w-0 flex-1 bg-transparent px-4 font-sans text-[13.5px] text-ink outline-none placeholder:text-muted"
        />
        <span className="flex h-full items-center bg-iris-500 px-[18px] text-white">
          <Icon name="search" size={17} strokeWidth={2} />
        </span>
      </div>

      <label className="flex flex-none items-center gap-2.5">
        <span className="whitespace-nowrap font-sans text-[13px] text-muted">Sort by</span>
        <span className="relative">
          <select
            value={SORTS.some((s) => s.value === sort) ? sort : "newest"}
            onChange={(e) => setParams({ sort: e.target.value === "newest" ? null : e.target.value })}
            className="h-[46px] appearance-none rounded-xl border border-line bg-surface pl-3.5 pr-9 font-sans text-[13.5px] font-medium text-ink outline-none focus:border-iris-500"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevronDown"
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </span>
      </label>
    </div>
  );
}
