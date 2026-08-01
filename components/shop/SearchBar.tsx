"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

/**
 * Full-width storefront search. Submitting navigates to /search?q=… (the search
 * results page is built later — link only for now). The "All Categories" label
 * on the left is a visual scope affordance matching the design; the primary
 * category navigation is the mega-menu in the nav bar below.
 */
export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-12 flex-1 items-center rounded-xl border border-line bg-field transition-[border-color,box-shadow] focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]"
    >
      <div className="flex h-full cursor-default items-center gap-1.5 whitespace-nowrap border-r border-line px-4 font-sans text-[13px] font-medium text-ink-soft">
        All Categories
        <Icon name="chevronDown" size={15} strokeWidth={2} className="text-muted" />
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands and sellers…"
        aria-label="Search products, brands and sellers"
        className="min-w-0 flex-1 bg-transparent px-4 font-sans text-sm text-ink outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-full items-center justify-center rounded-r-[11px] bg-iris-500 px-5 text-white transition-colors hover:bg-iris-600"
      >
        <Icon name="search" size={19} strokeWidth={2} />
      </button>
    </form>
  );
}
