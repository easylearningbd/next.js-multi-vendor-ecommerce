"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A–Z)" },
  { value: "products", label: "Most Products" },
] as const;

/** Sort control for the seller list. Updates ?sort and resets to page 1. */
export function StoreSort({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function change(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    const v = e.target.value;
    if (v && v !== "featured") params.set("sort", v);
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2.5">
      <span className="font-sans text-[13px] font-medium text-muted">Sort by</span>
      <span className="relative">
        <select
          value={value}
          onChange={change}
          className="h-11 appearance-none rounded-[11px] border border-line bg-surface pl-3.5 pr-9 font-sans text-[13.5px] font-medium text-ink outline-none focus:border-iris-500"
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
  );
}
