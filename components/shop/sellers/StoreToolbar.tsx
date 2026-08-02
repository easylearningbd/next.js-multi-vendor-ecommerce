"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

const SORTS = [
  { value: "newest", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name (A–Z)" },
] as const;

/** In-store toolbar: search + sort. Both update the URL, preserving active
 *  category/brand filters and resetting to page 1. */
export function StoreToolbar({ search, sort }: { search: string; sort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(search);

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-[18px] border border-line-soft bg-surface px-6 py-[18px] shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <div className="flex-none">
        <div className="font-display text-[18px] font-bold text-ink">All Products</div>
        <div className="mt-2 h-[3px] w-10 rounded-sm bg-iris-500" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: q.trim() || null });
        }}
        className="flex h-[46px] min-w-[220px] flex-1 items-center overflow-hidden rounded-xl border border-line bg-field transition-[border-color,box-shadow] focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for items in this store…"
          aria-label="Search items in this store"
          className="min-w-0 flex-1 bg-transparent px-4 font-sans text-[13.5px] text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-full items-center bg-iris-500 px-[18px] text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="search" size={17} strokeWidth={2} />
        </button>
      </form>

      <label className="flex flex-none items-center gap-2.5">
        <span className="whitespace-nowrap font-sans text-[13px] text-muted">Sort by</span>
        <span className="relative">
          <select
            value={SORTS.some((s) => s.value === sort) ? sort : "newest"}
            onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
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
