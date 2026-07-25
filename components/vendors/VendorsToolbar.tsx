"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

export function VendorsToolbar({
  showStatusFilter = false,
  placeholder = "Search store, owner or email",
}: {
  showStatusFilter?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("search") ?? "");
  const first = useRef(true);

  function setParam(updates: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (resetPage) next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => setParam({ search: search.trim() || null }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const status = params.get("status") ?? "ALL";
  const pageSize = params.get("pageSize") ?? "10";
  const selectClass =
    "h-[46px] rounded-md border border-line bg-surface px-3.5 font-sans text-[13px] font-medium text-ink-soft outline-none transition focus:border-iris-500 focus:shadow-[0_0_0_3px_var(--color-iris-100)] cursor-pointer";

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3.5">
      <div className="flex h-[46px] min-w-[220px] flex-1 items-center overflow-hidden rounded-md border border-line bg-field transition focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]">
        <span className="pl-3.5 pr-1 text-muted-soft">
          <Icon name="search" size={18} strokeWidth={2} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
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

      {showStatusFilter && (
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setParam({ status: e.target.value === "ALL" ? null : e.target.value })}
          className={selectClass}
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      )}

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
