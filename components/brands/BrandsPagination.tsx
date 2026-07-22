"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";

export function BrandsPagination({
  page,
  totalPages,
  total,
  pageSize,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function goTo(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    router.push(`${pathname}?${next.toString()}`);
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  // Compact page window around the current page.
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i);

  const btn =
    "flex h-9 min-w-9 items-center justify-center rounded-md border border-line bg-surface px-2 font-sans text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <span className="font-sans text-[12.5px] text-muted">
        Showing <span className="font-semibold text-ink-soft">{from}</span>–
        <span className="font-semibold text-ink-soft">{to}</span> of{" "}
        <span className="font-semibold text-ink-soft">{total}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <button className={`${btn} text-ink-soft hover:bg-field`} onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <Icon name="chevronLeft" size={16} strokeWidth={2} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
            className={
              p === page
                ? "flex h-9 min-w-9 items-center justify-center rounded-md bg-iris-500 px-2 font-sans text-[13px] font-semibold text-white"
                : `${btn} text-ink-soft hover:bg-field`
            }
          >
            {p}
          </button>
        ))}
        <button className={`${btn} text-ink-soft hover:bg-field`} onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
