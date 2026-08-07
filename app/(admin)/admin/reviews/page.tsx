import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { Icon } from "@/components/dashboard/Icon";
import {
  getAdminReviews,
  ADMIN_REVIEWS_PAGE_SIZE,
  type AdminReviewRow,
} from "@/lib/admin/reviews";
import { ReviewStatusBadge } from "@/components/admin-reviews/ReviewStatusBadge";
import { AdminOrderSearch } from "@/components/admin-orders/AdminOrderSearch";
import { ReportExportButton } from "@/components/vendor-reports/ReportExportButton";

export const metadata: Metadata = { title: "Customer Reviews — Covet Admin" };
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const ROW = "grid grid-cols-[44px_90px_1.5fr_1.2fr_104px_1.8fr_96px_104px_72px] items-center gap-3";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={12}
          className={n <= rating ? "text-star" : "text-line"}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("ADMIN", "/admin/login");

  const sp = await searchParams;
  const statusSlug = one(sp.status);
  const search = one(sp.search)?.trim() || undefined;
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const { rows, total, totalPages, status, counts } = await getAdminReviews({
    statusSlug,
    search,
    page,
  });
  const hasFilters = Boolean(status || search);

  const filters: { slug?: string; label: string; count: number }[] = [
    { label: "All", count: counts.all },
    { slug: "pending", label: "Pending", count: counts.pending },
    { slug: "approved", label: "Approved", count: counts.approved },
    { slug: "rejected", label: "Rejected", count: counts.rejected },
  ];
  const filterHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("status", slug);
    if (search) params.set("search", search);
    const qs = params.toString();
    return qs ? `/admin/reviews?${qs}` : "/admin/reviews";
  };
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (statusSlug) params.set("status", statusSlug);
    if (search) params.set("search", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/reviews?${qs}` : "/admin/reviews";
  };

  const exportRows = rows.map((r, i) => [
    (page - 1) * ADMIN_REVIEWS_PAGE_SIZE + i + 1,
    r.id,
    r.productName,
    r.sellerName,
    r.customerName,
    r.rating,
    r.excerpt,
    r.status,
    r.isVisible ? "visible" : "hidden",
    DATE_FMT.format(r.createdAt),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-[22px] flex flex-wrap items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-warning-bg text-warning">
          <Icon name="star" size={19} className="text-warning" />
        </span>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Customer Reviews</h1>
        <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
          {total}
        </span>
      </div>

      {/* Filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (f.slug ?? undefined) === (statusSlug ?? undefined);
          return (
            <Link
              key={f.label}
              href={filterHref(f.slug)}
              className={`flex h-9 items-center gap-2 rounded-full border px-4 font-sans text-[13px] font-semibold transition-colors ${
                active
                  ? "border-iris-500 bg-iris-500 text-white"
                  : "border-line bg-surface text-ink-soft hover:border-iris-300"
              }`}
            >
              {f.label}
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-display text-[11px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-line-soft text-muted"
                }`}
              >
                {f.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* List */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
          <span className="font-display text-[17px] font-bold text-ink">Customer Reviews List</span>
          <div className="flex flex-wrap items-center gap-3">
            <AdminOrderSearch placeholder="Search by review id, product, or customer" />
            <ReportExportButton
              filename={`reviews${status ? `-${statusSlug}` : ""}.csv`}
              headers={["SL", "Review ID", "Product", "Seller", "Customer", "Rating", "Review", "Status", "Visibility", "Date"]}
              rows={exportRows}
            />
          </div>
        </div>

        {rows.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-[14px] border border-line-soft">
              <div className="min-w-[1080px]">
                <div
                  className={`${ROW} bg-field px-[18px] py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
                >
                  <span>SL</span>
                  <span>Review ID</span>
                  <span>Product</span>
                  <span>Customer</span>
                  <span>Rating</span>
                  <span>Review</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span className="text-right">Action</span>
                </div>
                {rows.map((r, i) => (
                  <ReviewRow key={r.id} row={r} sl={(page - 1) * ADMIN_REVIEWS_PAGE_SIZE + i + 1} />
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <nav className="mt-5 flex items-center justify-end gap-1.5" aria-label="Pagination">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="flex h-9 items-center gap-1 rounded-lg border border-line px-3 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
                  >
                    <Icon name="chevronLeft" size={14} strokeWidth={2.2} />
                    Prev
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 font-sans text-[13px] font-semibold transition-colors ${
                      p === page ? "bg-iris-500 text-white" : "bg-field text-ink-soft hover:text-iris-500"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="flex h-9 items-center gap-1 rounded-lg border border-line px-3 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
                  >
                    Next
                    <Icon name="chevronRight" size={14} strokeWidth={2.2} />
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center px-8 py-16 text-center">
            <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
              <Icon name="star" size={34} className="text-iris-400" />
            </span>
            <div className="font-display text-[20px] font-bold text-ink">
              {hasFilters ? "No reviews match this filter" : "No reviews yet"}
            </div>
            <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
              {hasFilters
                ? "Try a different status or clear the search."
                : "Customer reviews across all stores will show up here."}
            </p>
            {hasFilters && (
              <Link
                href="/admin/reviews"
                className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
              >
                View all reviews
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ row, sl }: { row: AdminReviewRow; sl: number }) {
  return (
    <div className={`${ROW} border-t border-line-soft px-[18px] py-3.5 transition-colors hover:bg-bg-subtle`}>
      <span className="font-sans text-[13px] text-muted-soft">{sl}</span>
      <Link
        href={`/admin/reviews/${row.id}`}
        className="truncate font-display text-[12px] font-bold text-iris-500 hover:text-iris-600"
      >
        {row.id.slice(-6).toUpperCase()}
      </Link>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-9 flex-none items-center justify-center overflow-hidden rounded-[9px] bg-field text-muted-soft">
          {row.productThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.productThumbnail} alt={row.productName} className="h-full w-full object-cover" />
          ) : (
            <Icon name="image" size={16} strokeWidth={1.7} />
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate font-sans text-[12.5px] font-medium text-ink">{row.productName}</div>
          <div className="mt-0.5 truncate font-sans text-[10.5px] text-iris-500">Sold by {row.sellerName}</div>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-[30px] flex-none items-center justify-center rounded-full bg-iris-50 font-display text-[12px] font-bold text-iris-500">
          {row.customerName.charAt(0).toUpperCase()}
        </span>
        <span className="truncate font-sans text-[12.5px] text-ink">{row.customerName}</span>
      </div>
      <Stars rating={row.rating} />
      <span className="line-clamp-2 font-sans text-[12px] leading-[1.4] text-ink-soft">{row.excerpt}</span>
      <span>
        <ReviewStatusBadge status={row.status} />
      </span>
      <span className="font-sans text-[12px] text-muted">{DATE_FMT.format(row.createdAt)}</span>
      <div className="flex justify-end">
        <Link
          href={`/admin/reviews/${row.id}`}
          aria-label="View details"
          className="flex size-8 items-center justify-center rounded-lg border border-success-bg bg-success-bg text-success transition-colors hover:brightness-95"
        >
          <Icon name="eye" size={15} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
