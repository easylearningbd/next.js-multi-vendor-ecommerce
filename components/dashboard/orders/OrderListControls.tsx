"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { Icon } from "@/components/dashboard/Icon";
import { ORDER_STATUS_FILTERS } from "@/lib/shop/customer-orders";

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKAGING: "Packaging",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
  RETURNED: "Returned",
  FAILED_TO_DELIVER: "Failed to deliver",
};

export function OrderListControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const status = params.get("status") ?? "";

  // Update the URL (server refetches). Any filter/search change resets to page 1.
  function apply(next: { q?: string; status?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.status !== undefined) {
      if (next.status) sp.set("status", next.status);
      else sp.delete("status");
    }
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: q.trim() });
        }}
        className="flex h-10 items-center gap-2 rounded-[11px] border border-line bg-surface px-3 focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]"
      >
        <Icon name="search" size={15} strokeWidth={2} className="flex-none text-muted-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search orders…"
          className="w-[150px] bg-transparent font-sans text-[13px] text-ink outline-none placeholder:text-muted-soft sm:w-[180px]"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQ("");
              apply({ q: "" });
            }}
            className="flex-none text-muted-soft hover:text-ink"
          >
            <Icon name="x" size={14} strokeWidth={2.2} />
          </button>
        )}
      </form>

      <div className="relative flex h-10 items-center rounded-[11px] border border-line bg-surface">
        <select
          value={status}
          onChange={(e) => apply({ status: e.target.value })}
          className="h-full cursor-pointer appearance-none rounded-[11px] bg-transparent py-0 pl-3.5 pr-9 font-sans text-[13px] font-medium text-ink-soft outline-none"
        >
          <option value="">All statuses</option>
          {ORDER_STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {LABELS[s]}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          size={15}
          strokeWidth={2}
          className="pointer-events-none absolute right-3 text-muted-soft"
        />
      </div>
    </div>
  );
}
