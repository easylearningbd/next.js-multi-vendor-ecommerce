import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { formatMoney } from "@/lib/shop/pricing";
import { Icon } from "@/components/dashboard/Icon";
import {
  getAdminCustomers,
  ADMIN_CUSTOMERS_PAGE_SIZE,
  type AdminCustomerRow,
} from "@/lib/admin/customers";
import { AdminOrderSearch } from "@/components/admin-orders/AdminOrderSearch";
import { ReportExportButton } from "@/components/vendor-reports/ReportExportButton";

export const metadata: Metadata = { title: "Customer List — Covet Admin" };
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const ROW = "grid grid-cols-[44px_1.5fr_1.6fr_110px_84px_120px_92px_72px] items-center gap-3";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("ADMIN", "/admin/login");

  const sp = await searchParams;
  const search = one(sp.search)?.trim() || undefined;
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const { rows, total, totalPages } = await getAdminCustomers({ search, page });

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/customers?${qs}` : "/admin/customers";
  };

  const exportRows = rows.map((r, i) => [
    (page - 1) * ADMIN_CUSTOMERS_PAGE_SIZE + i + 1,
    r.name,
    r.email,
    r.phone ?? "",
    DATE_FMT.format(r.createdAt),
    r.orderCount,
    r.totalSpent,
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-[22px] flex flex-wrap items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
          <Icon name="users" size={19} strokeWidth={1.9} />
        </span>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Customer List</h1>
        <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
          {total}
        </span>
      </div>

      {/* List */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
          <span className="font-display text-[17px] font-bold text-ink">Customer List</span>
          <div className="flex flex-wrap items-center gap-3">
            <AdminOrderSearch placeholder="Search by name or email" />
            <ReportExportButton
              filename="customers.csv"
              headers={["SL", "Name", "Email", "Phone", "Joined", "Orders", "Total Spent"]}
              rows={exportRows}
            />
          </div>
        </div>

        {rows.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-[14px] border border-line-soft">
              <div className="min-w-[1000px]">
                <div
                  className={`${ROW} bg-field px-[18px] py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
                >
                  <span>SL</span>
                  <span>Customer Name</span>
                  <span>Contact Info</span>
                  <span>Joined</span>
                  <span>Orders</span>
                  <span>Total Spent</span>
                  <span>Status</span>
                  <span className="text-right">Action</span>
                </div>
                {rows.map((r, i) => (
                  <CustomerRow key={r.id} row={r} sl={(page - 1) * ADMIN_CUSTOMERS_PAGE_SIZE + i + 1} />
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
              <Icon name="users" size={34} strokeWidth={1.6} />
            </span>
            <div className="font-display text-[20px] font-bold text-ink">
              {search ? "No customers match your search" : "No customers yet"}
            </div>
            <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
              {search
                ? "Try a different name or email, or clear the search."
                : "Customers will appear here once they register on the marketplace."}
            </p>
            {search && (
              <Link
                href="/admin/customers"
                className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
              >
                View all customers
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerRow({ row, sl }: { row: AdminCustomerRow; sl: number }) {
  return (
    <div className={`${ROW} border-t border-line-soft px-[18px] py-3.5 transition-colors hover:bg-bg-subtle`}>
      <span className="font-sans text-[13px] text-muted-soft">{sl}</span>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 flex-none items-center justify-center rounded-full bg-iris-50 font-display text-[15px] font-bold text-iris-500">
          {row.name.charAt(0).toUpperCase()}
        </span>
        <Link
          href={`/admin/customers/${row.id}`}
          className="truncate font-sans text-[13.5px] font-semibold text-ink hover:text-iris-500"
        >
          {row.name}
        </Link>
      </div>
      <div className="min-w-0 font-sans text-[12.5px] text-muted">
        <div className="truncate text-ink-soft">{row.email}</div>
        <div className="mt-0.5 truncate">{row.phone ?? "—"}</div>
      </div>
      <span className="font-sans text-[12.5px] text-muted">{DATE_FMT.format(row.createdAt)}</span>
      <span className="inline-flex h-6 min-w-8 items-center justify-center justify-self-start rounded-lg bg-iris-50 px-2 font-display text-[12px] font-bold text-iris-500">
        {row.orderCount}
      </span>
      <span className="font-display text-[13.5px] font-bold text-ink">{formatMoney(row.totalSpent)}</span>
      <span className="inline-flex items-center rounded-full bg-success-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-success">
        Active
      </span>
      <div className="flex justify-end">
        <Link
          href={`/admin/customers/${row.id}`}
          aria-label="View details"
          className="flex size-8 items-center justify-center rounded-lg border border-iris-100 bg-iris-50 text-iris-500 transition-colors hover:bg-iris-100"
        >
          <Icon name="eye" size={15} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
