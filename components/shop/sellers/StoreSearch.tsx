"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

/** Store-name search for the seller list. Updates ?search and resets to page 1. */
export function StoreSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const v = q.trim();
    if (v) params.set("search", v);
    else params.delete("search");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-[52px] w-full max-w-[420px] items-center overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,box-shadow] focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search store"
        aria-label="Search stores by name"
        className="min-w-0 flex-1 bg-transparent px-[18px] font-sans text-sm text-ink outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        aria-label="Search store"
        className="flex h-full items-center bg-iris-500 px-[22px] text-white transition-colors hover:bg-iris-600"
      >
        <Icon name="search" size={19} strokeWidth={2} />
      </button>
    </form>
  );
}
