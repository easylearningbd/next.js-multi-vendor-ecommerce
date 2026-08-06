import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { formatMoney } from "@/lib/shop/pricing";
import { Icon, type IconName } from "@/components/dashboard/Icon";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/orders/OrderStatusBadge";
import {
  getAdminOrders,
  ADMIN_ORDERS_PAGE_SIZE,
  type AdminOrderRow,
} from "@/lib/admin/orders";
import { AdminOrderSearch } from "./AdminOrderSearch";
import { ReportExportButton } from "@/components/vendor-reports/ReportExportButton";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const TONE: Record<"success" | "warning" | "error" | "info", string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
  info: "bg-info-bg text-info",
};

// Summary tiles + status labels (order matches the design's 4×2 grid).
const STATUS_META: Record<
  OrderStatus,
  { label: string; tone: keyof typeof TONE; icon: IconName }
> = {
  PENDING: { label: "Pending", tone: "warning", icon: "pending" },
  CONFIRMED: { label: "Confirmed", tone: "info", icon: "confirmed" },
  PACKAGING: { label: "Packaging", tone: "warning", icon: "packaging" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", tone: "warning", icon: "outfor" },
  DELIVERED: { label: "Delivered", tone: "success", icon: "delivered" },
  CANCELED: { label: "Canceled", tone: "error", icon: "canceled" },
  RETURNED: { label: "Returned", tone: "info", icon: "returned" },
  FAILED_TO_DELIVER: { label: "Failed to Deliver", tone: "error", icon: "failed" },
};
const SUMMARY_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKAGING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
  "FAILED_TO_DELIVER",
];

const ROW =
  "grid grid-cols-[46px_110px_160px_1fr_1fr_140px_130px_92px] items-center gap-3.5";

function storeLabel(names: string[]): string {
  if (names.length === 0) return "—";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

/**
 * ONE reusable admin order-list view, driven by the `?status` filter — the same
 * component renders All and every status. Platform-wide (no scoping): shows a
 * cross-marketplace overview, then the filtered, searchable, paginated list.
 */
export async function AdminOrderList({
  statusSlug,
  search,
  page,
}: {
  statusSlug?: string;
  search?: string;
  page: number;
}) {
  const { rows, total, totalPages, status, summary } = await getAdminOrders({
    statusSlug,
    search,
    page,
  });

  const title = status ? `${STATUS_META[status].label} Orders` : "All Orders";
  const hasFilters = Boolean(status || search);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (statusSlug) params.set("status", statusSlug);
    if (search) params.set("search", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const exportRows = rows.map((r, i) => [
    (page - 1) * ADMIN_ORDERS_PAGE_SIZE + i + 1,
    r.orderNumber,
    DATE_FMT.format(r.createdAt),
    r.customerName,
    r.customerPhone,
    r.storeNames.join(" | "),
    r.itemCount,
    r.grandTotal,
    r.paymentStatus,
    r.status,
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-[22px] flex flex-wrap items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
          <Icon name="order" size={19} strokeWidth={1.9} />
        </span>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">{title}</h1>
        <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
          {total}
        </span>
      </div>

      {/* Platform overview */}
      <div className="mb-[22px] rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
        <div className="mb-[18px] font-display text-[17px] font-bold text-ink">Current Order Summary</div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {SUMMARY_ORDER.map((st) => {
            const m = STATUS_META[st];
            return (
              <Link
                key={st}
                href={`/admin/orders?status=${st.toLowerCase().replace(/_/g, "-")}`}
                className="flex items-center gap-3 rounded-[14px] border border-line-soft bg-bg-subtle p-4 transition-shadow hover:shadow-[0_10px_24px_-14px_rgba(20,18,31,0.2)]"
              >
                <span className={`flex size-10 flex-none items-center justify-center rounded-[11px] ${TONE[m.tone]}`}>
                  <Icon name={m.icon} size={18} strokeWidth={1.9} />
                </span>
                <span className="flex-1 font-sans text-[12.5px] font-semibold text-ink-soft">{m.label}</span>
                <span className="font-display text-[20px] font-extrabold text-ink">{summary.byStatus[st]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Order list */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-[17px] font-bold text-ink">Order List</span>
            <span className="flex h-6 min-w-[26px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[12px] font-bold text-ink-soft">
              {total}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminOrderSearch />
            <ReportExportButton
              filename={`admin-orders${status ? `-${statusSlug}` : ""}.csv`}
              headers={["SL", "Order ID", "Order Date", "Customer", "Phone", "Stores", "Items", "Grand Total", "Payment", "Status"]}
              rows={exportRows}
            />
          </div>
        </div>

        {rows.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-[14px] border border-line-soft">
              <div className="min-w-[980px]">
                <div
                  className={`${ROW} bg-field px-[18px] py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
                >
                  <span>SL</span>
                  <span>Order ID</span>
                  <span>Order Date</span>
                  <span>Customer Info</span>
                  <span>Store</span>
                  <span>Total Amount</span>
                  <span>Order Status</span>
                  <span className="text-right">Action</span>
                </div>
                {rows.map((r, i) => (
                  <OrderRow key={r.orderNumber} row={r} sl={(page - 1) * ADMIN_ORDERS_PAGE_SIZE + i + 1} />
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
                      p === page
                        ? "bg-iris-500 text-white"
                        : "bg-field text-ink-soft hover:text-iris-500"
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
              <Icon name="order" size={34} strokeWidth={1.6} />
            </span>
            <div className="font-display text-[20px] font-bold text-ink">
              {hasFilters
                ? status
                  ? `No ${STATUS_META[status].label} orders`
                  : "No matching orders"
                : "No orders yet"}
            </div>
            <p className="mx-auto mt-3 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
              {hasFilters
                ? "No orders match this filter. Try a different status or clear the search."
                : "Orders placed across the marketplace will appear here."}
            </p>
            {hasFilters && (
              <Link
                href="/admin/orders"
                className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
              >
                View all orders
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ row, sl }: { row: AdminOrderRow; sl: number }) {
  return (
    <div className={`${ROW} border-t border-line-soft px-[18px] py-4 transition-colors hover:bg-bg-subtle`}>
      <span className="font-sans text-[13px] text-muted-soft">{sl}</span>
      <Link
        href={`/admin/orders/${row.orderNumber}`}
        className="font-display text-[13px] font-bold text-iris-500 hover:text-iris-600"
      >
        {row.orderNumber}
      </Link>
      <span className="font-sans text-[12.5px] text-ink-soft">{DATE_FMT.format(row.createdAt)}</span>
      <div className="min-w-0">
        <div className="truncate font-sans text-[13px] font-semibold text-ink">{row.customerName}</div>
        <div className="mt-1 font-sans text-[11.5px] text-muted-soft">{row.customerPhone}</div>
      </div>
      <div className="min-w-0">
        <div className="truncate font-sans text-[13px] text-iris-500">{storeLabel(row.storeNames)}</div>
        <div className="mt-1 font-sans text-[11.5px] text-muted-soft">
          {row.itemCount} {row.itemCount === 1 ? "item" : "items"}
        </div>
      </div>
      <div>
        <div className="font-display text-[13.5px] font-bold text-ink">{formatMoney(row.grandTotal)}</div>
        <div className="mt-1">
          <PaymentStatusBadge status={row.paymentStatus} />
        </div>
      </div>
      <span>
        <OrderStatusBadge status={row.status} />
      </span>
      <div className="flex justify-end gap-2">
        <Link
          href={`/admin/orders/${row.orderNumber}`}
          aria-label="View details"
          className="flex size-8 items-center justify-center rounded-lg border border-success-bg bg-success-bg text-success transition-colors hover:brightness-95"
        >
          <Icon name="eye" size={15} strokeWidth={2} />
        </Link>
        <a
          href={`/admin-invoice/${row.orderNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download invoice"
          className="flex size-8 items-center justify-center rounded-lg border border-iris-100 bg-iris-50 text-iris-500 transition-colors hover:bg-iris-100"
        >
          <Icon name="download" size={15} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
