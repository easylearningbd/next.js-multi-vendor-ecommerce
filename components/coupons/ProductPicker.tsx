"use client";

import { useMemo, useState } from "react";
import type { CouponPickerProduct } from "@/lib/coupon-types";
import { Icon } from "@/components/dashboard/Icon";

// Multi-select over ONLY this vendor's products (list is server-provided, session-scoped).
export function ProductPicker({
  products,
  selected,
  onChange,
  error,
}: {
  products: CouponPickerProduct[];
  selected: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const sel = useMemo(() => new Set(selected), [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, query]);

  function toggle(id: string) {
    onChange(sel.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="font-sans text-[12.5px] font-semibold text-ink-soft">
          Applies to products <span className="text-error">*</span>
        </label>
        <span className="font-sans text-[12px] text-muted">{selected.length} selected</span>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-bg-subtle p-6 text-center font-sans text-[13px] text-muted">
          You have no products yet. Add a product first to attach a coupon to it.
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-xl border ${error ? "border-error" : "border-line"} bg-surface`}
        >
          <div className="flex h-11 items-center gap-2 border-b border-line-soft bg-bg-subtle px-3">
            <Icon name="search" size={16} strokeWidth={2} className="text-muted-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your products"
              className="min-w-0 flex-1 border-none bg-transparent font-sans text-[13px] text-ink outline-none"
            />
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-5 text-center font-sans text-[12.5px] text-muted">No products match.</div>
            ) : (
              filtered.map((p) => {
                const on = sel.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={`flex w-full items-center gap-3 border-t border-line-soft p-2.5 text-left transition-colors first:border-t-0 hover:bg-bg-subtle ${
                      on ? "bg-iris-50/60" : ""
                    }`}
                  >
                    <span
                      className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-md border ${
                        on ? "border-iris-500 bg-iris-500 text-white" : "border-line bg-surface"
                      }`}
                    >
                      {on && <Icon name="check" size={12} strokeWidth={3} />}
                    </span>
                    <span className="h-9 w-9 flex-none overflow-hidden rounded-md border border-line-soft bg-field">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-muted-soft">
                          <Icon name="box" size={15} strokeWidth={1.8} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-sans text-[13px] font-medium text-ink">{p.name}</span>
                    <span className="flex-none font-display text-[12.5px] font-bold text-ink-soft">{p.price}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-2 font-sans text-[12px] text-error">{error}</p>}
    </div>
  );
}
