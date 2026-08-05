import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { formatMoney } from "@/lib/shop/pricing";
import { Icon } from "@/components/dashboard/Icon";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/orders/OrderStatusBadge";
import {
  getSessionVendorId,
  getVendorSubOrders,
  getVendorOrderCounts,
  statusFromSlug,
  VENDOR_ORDERS_PAGE_SIZE,
} from "@/lib/vendor/orders";
import { VendorOrderSearch } from "@/components/vendor-orders/VendorOrderSearch";

export const metadata: Metadata = { title: "Order List — Covet Seller" };
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });
const TIME_FMT = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKAGING: "Packaging",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
  RETURNED: "Returned",
  FAILED_TO_DELIVER: "Failed to deliver",
};

// Eight summary tiles (Total + the common statuses), matching the design grid.
const SUMMARY: { key: OrderStatus | "TOTAL"; label: string }[] = [
  { key: "TOTAL", label: "Total Orders" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELED", label: "Canceled" },
  { key: "RETURNED", label: "Returned" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const ROW = "grid grid-cols-[48px_120px_150px_1fr_150px_150px_96px] items-center gap-4";

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const vendorId = await getSessionVendorId();
  if (!vendorId) redirect("/vendor/login?next=/vendor/orders");

  const sp = await searchParams;
  const statusSlug = one(sp.status);
  const status = statusFromSlug(statusSlug);
  const search = one(sp.search)?.trim() || undefined;
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const hasFilters = Boolean(status || search);

  const [{ rows, total, totalPages }, counts] = await Promise.all([
    getVendorSubOrders(vendorId, { status, search, page }),
    getVendorOrderCounts(vendorId),
  ]);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (statusSlug) params.set("status", statusSlug);
    if (search) params.set("search", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/vendor/orders?${qs}` : "/vendor/orders";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Order List</h1>
          <p className="mt-1.5 font-sans text-[13px] text-muted">
            {status ? `Showing ${STATUS_LABEL[status]} orders` : "Your sub-orders across every status"}
          </p>
        </div>
        <VendorOrderSearch />
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {SUMMARY.map((c) => {
          const value = c.key === "TOTAL" ? counts.total : counts.byStatus[c.key];
          return (
            <div
              key={c.key}
              className="flex items-center gap-3 rounded-[14px] border border-line-soft bg-bg-subtle p-4"
            >
              <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
                <Icon name="order" size={17} strokeWidth={1.9} />
              </span>
              <span className="flex-1 font-sans text-[12.5px] font-medium text-ink-soft">{c.label}</span>
              <span className="font-display text-[20px] font-extrabold text-ink">{value}</span>
            </div>
          );
        })}
      </div>

      {rows.length > 0 ? (
        <div className="rounded-[18px] border border-line-soft bg-surface p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="font-sans text-[13px] text-muted">
              {total} {total === 1 ? "order" : "orders"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Head */}
              <div
                className={`${ROW} rounded-lg bg-field px-[18px] py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
              >
                <span>SL</span>
                <span>Order ID</span>
                <span>Order Date</span>
                <span>Customer</span>
                <span>Amount</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>

              {rows.map((r, i) => (
                <div key={r.id} className={`${ROW} border-b border-line-soft px-[18px] py-4 last:border-b-0`}>
                  <span className="font-sans text-[13px] text-muted-soft">
                    {(page - 1) * VENDOR_ORDERS_PAGE_SIZE + i + 1}
                  </span>
                  <Link
                    href={`/vendor/orders/${r.id}`}
                    className="font-display text-[13px] font-bold text-iris-500 hover:text-iris-600"
                  >
                    {r.orderNumber}
                  </Link>
                  <div>
                    <div className="font-sans text-[13px] text-ink">{DATE_FMT.format(r.createdAt)}</div>
                    <div className="mt-1 font-sans text-[11.5px] text-muted-soft">
                      {TIME_FMT.format(r.createdAt)} · {r.itemCount} {r.itemCount === 1 ? "item" : "items"}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-sans text-[13px] font-semibold text-ink">
                      {r.customerName}
                    </div>
                    <div className="mt-1 font-sans text-[11.5px] text-muted-soft">{r.customerPhone}</div>
                  </div>
                  <div>
                    <div className="font-display text-[13.5px] font-bold text-ink">
                      {formatMoney(r.amount)}
                    </div>
                    <div className="mt-1">
                      <PaymentStatusBadge status={r.paymentStatus} />
                    </div>
                  </div>
                  <span>
                    <OrderStatusBadge status={r.status} />
                  </span>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/vendor/orders/${r.id}`}
                      aria-label="View details"
                      className="flex size-8 items-center justify-center rounded-lg border border-success-bg bg-success-bg text-success transition-colors hover:brightness-95"
                    >
                      <Icon name="eye" size={15} strokeWidth={2} />
                    </Link>
                    <a
                      href={`/vendor-invoice/${r.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download invoice"
                      className="flex size-8 items-center justify-center rounded-lg border border-iris-100 bg-iris-50 text-iris-500 transition-colors hover:bg-iris-100"
                    >
                      <Icon name="download" size={15} strokeWidth={2} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <nav className="mt-5 flex items-center justify-center gap-1.5" aria-label="Pagination">
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
                    p === page
                      ? "bg-iris-500 text-white"
                      : "border border-line text-ink-soft hover:border-iris-500 hover:text-iris-500"
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
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-[18px] border border-dashed border-line bg-surface px-8 py-16 text-center">
          <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
            <Icon name="order" size={34} strokeWidth={1.6} />
          </span>
          <div className="font-display text-[20px] font-bold text-ink">
            {hasFilters
              ? status
                ? `No ${STATUS_LABEL[status]} orders`
                : "No matching orders"
              : "No orders yet"}
          </div>
          <p className="mx-auto mt-3 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
            {hasFilters
              ? "No sub-orders match this filter. Try a different status or clear the search."
              : "When customers place orders for your products, they'll appear here."}
          </p>
          {hasFilters && (
            <Link
              href="/vendor/orders"
              className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
            >
              View all orders
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
