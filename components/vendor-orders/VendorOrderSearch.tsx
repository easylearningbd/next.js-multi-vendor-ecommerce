"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

/** Search box for the vendor order list — preserves the ?status filter, resets to page 1. */
export function VendorOrderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("search") ?? "");

  function apply(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set("search", next);
    else sp.delete("search");
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(value.trim());
      }}
      className="flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-3 focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]"
    >
      <Icon name="search" size={15} strokeWidth={2} className="flex-none text-muted-soft" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search order # or customer…"
        className="w-[160px] bg-transparent font-sans text-[13px] text-ink outline-none placeholder:text-muted-soft sm:w-[220px]"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            apply("");
          }}
          className="flex-none text-muted-soft hover:text-ink"
        >
          <Icon name="x" size={14} strokeWidth={2.2} />
        </button>
      )}
    </form>
  );
}
