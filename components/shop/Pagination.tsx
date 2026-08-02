import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

/** Build a URL for `page`, preserving the active filter params (search/sort/…). */
function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `${basePath}?${s}` : basePath;
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

/** Link-based pagination (server) shared by the seller list and store pages. */
export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  const base =
    "flex h-10 min-w-10 items-center justify-center rounded-[10px] px-3 font-sans text-[13.5px] font-semibold transition-colors";
  const enabled = `${base} border border-line bg-surface text-ink-soft hover:border-iris-300`;
  const disabled = `${base} border border-line-soft bg-field text-muted-soft`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link href={buildHref(basePath, params, page - 1)} className={enabled} aria-label="Previous page">
          <Icon name="chevronLeft" size={16} strokeWidth={2} />
        </Link>
      ) : (
        <span className={disabled} aria-disabled>
          <Icon name="chevronLeft" size={16} strokeWidth={2} />
        </span>
      )}

      {pages.map((p) =>
        p === page ? (
          <span key={p} className={`${base} bg-iris-500 text-white`} aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={buildHref(basePath, params, p)} className={enabled}>
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={buildHref(basePath, params, page + 1)} className={enabled} aria-label="Next page">
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </Link>
      ) : (
        <span className={disabled} aria-disabled>
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </span>
      )}
    </nav>
  );
}
