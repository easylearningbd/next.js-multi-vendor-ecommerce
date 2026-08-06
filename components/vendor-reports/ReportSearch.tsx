"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

/**
 * Table search for the report pages — writes ?q=… (preserving ?range=…) so the
 * filtered view is shareable. The page filters its already-loaded rows by this term.
 */
export function ReportSearch({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  function apply(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set("q", next);
    else sp.delete("q");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(value.trim());
      }}
      className="flex h-11 min-w-[240px] items-center overflow-hidden rounded-[11px] border border-line bg-field focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]"
    >
      <span className="px-3 text-muted-soft">
        <Icon name="search" size={16} strokeWidth={2} />
      </span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent font-sans text-[13px] text-ink outline-none placeholder:text-muted-soft"
      />
      <button
        type="submit"
        className="h-full bg-iris-500 px-4 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-iris-600"
      >
        Search
      </button>
    </form>
  );
}
