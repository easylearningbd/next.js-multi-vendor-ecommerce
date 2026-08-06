"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

/** Order-list search (order number or customer). Preserves ?status, resets page. */
export function AdminOrderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("search") ?? "");

  function apply(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set("search", next);
    else sp.delete("search");
    sp.delete("page");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(value.trim());
      }}
      className="flex h-11 min-w-[260px] items-center overflow-hidden rounded-[11px] border border-line bg-field focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by Order ID or customer"
        className="h-full min-w-0 flex-1 bg-transparent px-3.5 font-sans text-[13px] text-ink outline-none placeholder:text-muted-soft"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            apply("");
          }}
          className="px-2 text-muted-soft hover:text-ink"
        >
          <Icon name="x" size={15} strokeWidth={2.2} />
        </button>
      )}
      <button
        type="submit"
        aria-label="Search"
        className="flex h-full w-11 items-center justify-center text-muted transition-colors hover:text-iris-500"
      >
        <Icon name="search" size={17} strokeWidth={2} />
      </button>
    </form>
  );
}
