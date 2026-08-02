import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

/** Builds a /sellers URL for a page, preserving the active search + sort. */
function pageHref(page: number, search: string, sort: string): string {
  const q = new URLSearchParams();
  if (search) q.set("search", search);
  if (sort && sort !== "featured") q.set("sort", sort);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/sellers?${s}` : "/sellers";
}

/** Windowed page numbers around the current page. */
function pageWindow(page: number, total: number): number[] {
  const span = 2;
  const start = Math.max(1, Math.min(page - span, total - span * 2));
  const end = Math.min(total, Math.max(page + span, span * 2 + 1));
  const out: number[] = [];
  for (let p = start; p <= end; p++) out.push(p);
  return out;
}

export function SellerPagination({
  page,
  totalPages,
  search,
  sort,
}: {
  page: number;
  totalPages: number;
  search: string;
  sort: string;
}) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  const numBtn =
    "flex h-10 min-w-10 items-center justify-center rounded-[10px] px-3 font-sans text-[13.5px] font-semibold transition-colors";

  return (
    <nav
      aria-label="Seller list pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={pageHref(page - 1, search, sort)}
          className={`${numBtn} border border-line bg-surface text-ink-soft hover:border-iris-300`}
          aria-label="Previous page"
        >
          <Icon name="chevronLeft" size={16} strokeWidth={2} />
        </Link>
      ) : (
        <span className={`${numBtn} border border-line-soft bg-field text-muted-soft`} aria-disabled>
          <Icon name="chevronLeft" size={16} strokeWidth={2} />
        </span>
      )}

      {pages.map((p) =>
        p === page ? (
          <span key={p} className={`${numBtn} bg-iris-500 text-white`} aria-current="page">
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p, search, sort)}
            className={`${numBtn} border border-line bg-surface text-ink-soft hover:border-iris-300`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={pageHref(page + 1, search, sort)}
          className={`${numBtn} border border-line bg-surface text-ink-soft hover:border-iris-300`}
          aria-label="Next page"
        >
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </Link>
      ) : (
        <span className={`${numBtn} border border-line-soft bg-field text-muted-soft`} aria-disabled>
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </span>
      )}
    </nav>
  );
}
