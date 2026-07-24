"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSubCategoriesByCategory } from "@/app/(admin)/admin/categories/actions";
import type { CategoryOption, SubCategoryOption } from "@/lib/category-types";
import { Icon } from "@/components/dashboard/Icon";

export function SubSubCategoriesToolbar({
  categoryOptions,
}: {
  categoryOptions: CategoryOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const categoryId = params.get("categoryId") ?? "";
  const subCategoryId = params.get("subCategoryId") ?? "";

  const [search, setSearch] = useState(params.get("search") ?? "");
  const first = useRef(true);
  const [subOptions, setSubOptions] = useState<SubCategoryOption[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const reqId = useRef(0);

  function setParam(updates: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (resetPage) next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  // Debounced search
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => setParam({ search: search.trim() || null }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Dependent sub-category filter — load subs for the chosen category (also on mount
  // if a category filter is already in the URL).
  useEffect(() => {
    if (!categoryId) {
      setSubOptions([]);
      return;
    }
    const id = ++reqId.current;
    setSubLoading(true);
    getSubCategoriesByCategory(categoryId).then((res) => {
      if (id !== reqId.current) return;
      setSubOptions(res.success ? res.data ?? [] : []);
      setSubLoading(false);
    });
  }, [categoryId]);

  const pageSize = params.get("pageSize") ?? "10";
  const selectClass =
    "h-[46px] rounded-md border border-line bg-surface px-3.5 font-sans text-[13px] font-medium text-ink-soft outline-none transition focus:border-iris-500 focus:shadow-[0_0_0_3px_var(--color-iris-100)] cursor-pointer disabled:cursor-not-allowed disabled:bg-field disabled:text-muted-soft";

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3.5">
      <div className="flex h-[46px] min-w-[200px] flex-1 items-center overflow-hidden rounded-md border border-line bg-field transition focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]">
        <span className="pl-3.5 pr-1 text-muted-soft">
          <Icon name="search" size={18} strokeWidth={2} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="min-w-0 flex-1 border-none bg-transparent px-2 font-sans text-[13.5px] text-ink outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="px-3 text-muted-soft hover:text-ink"
          >
            <Icon name="x" size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <select
        aria-label="Filter by category"
        value={categoryId}
        onChange={(e) => setParam({ categoryId: e.target.value || null, subCategoryId: null })}
        className={`${selectClass} max-w-[200px]`}
      >
        <option value="">All categories</option>
        {categoryOptions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Dependent sub-category filter */}
      <select
        aria-label="Filter by sub-category"
        value={subCategoryId}
        onChange={(e) => setParam({ subCategoryId: e.target.value || null })}
        disabled={!categoryId || subLoading}
        className={`${selectClass} max-w-[200px]`}
      >
        <option value="">
          {!categoryId ? "Pick a category first" : subLoading ? "Loading…" : "All sub-categories"}
        </option>
        {subOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Rows per page"
        value={pageSize}
        onChange={(e) => setParam({ pageSize: e.target.value === "10" ? null : e.target.value })}
        className={selectClass}
      >
        <option value="10">10 / page</option>
        <option value="20">20 / page</option>
        <option value="50">50 / page</option>
      </select>
    </div>
  );
}
