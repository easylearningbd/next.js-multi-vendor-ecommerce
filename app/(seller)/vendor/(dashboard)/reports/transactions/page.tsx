import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/shop/pricing";
import { Icon } from "@/components/dashboard/Icon";
import { AreaChart, CHART } from "@/components/dashboard/Charts";
import { getSessionVendorId } from "@/lib/vendor/orders";
import { getTransactionReport, parseReportRange } from "@/lib/vendor/reports";
import { ReportRangeFilter } from "@/components/vendor-reports/ReportRangeFilter";
import { ReportSearch } from "@/components/vendor-reports/ReportSearch";
import { ReportExportButton } from "@/components/vendor-reports/ReportExportButton";

export const metadata: Metadata = { title: "Transaction Report — Covet Seller" };
export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const ROW = "grid grid-cols-[50px_120px_1.3fr_1fr_1fr_1fr_1fr_110px] items-center gap-3";

export default async function VendorTransactionReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const vendorId = await getSessionVendorId();
  if (!vendorId) redirect("/vendor/login?next=/vendor/reports/transactions");

  const sp = await searchParams;
  const range = parseReportRange({ range: one(sp.range) });
  const view = one(sp.view) === "expense" ? "expense" : "orders";
  const report = await getTransactionReport(vendorId, range);
  const { summary, chart } = report;

  const q = one(sp.q)?.trim().toLowerCase() ?? "";
  const rows = q
    ? report.rows.filter(
        (r) => r.orderNumber.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q),
      )
    : report.rows;

  const exportRows = rows.map((r) => [
    r.sl,
    r.orderNumber,
    r.customerName,
    r.totalProductAmount,
    r.couponDiscount,
    r.discountedAmount,
    r.commission,
    r.netEarning,
    r.status,
  ]);

  const tabs: { key: "orders" | "expense"; label: string }[] = [
    { key: "orders", label: "Order Transactions" },
    { key: "expense", label: "Expense Transactions" },
  ];
  const tabHref = (key: "orders" | "expense") => {
    const params = new URLSearchParams();
    if (range.preset !== "this-year") params.set("range", range.preset);
    if (key === "expense") params.set("view", "expense");
    const qs = params.toString();
    return qs ? `/vendor/reports/transactions?${qs}` : "/vendor/reports/transactions";
  };

  const earnings = [
    { label: "Gross Sales", value: summary.grossSales, color: CHART.iris, icon: "coins" as const },
    { label: `Commission (${summary.commissionRatePct}%)`, value: summary.totalCommission, color: CHART.amber, icon: "wallet" as const },
    { label: "Net Earnings", value: summary.netEarnings, color: CHART.green, icon: "trendUp" as const },
    { label: "Paid (realized)", value: summary.paidEarnings, color: CHART.ink, icon: "dollar" as const },
  ];
  const productCards = [
    { label: "Total Products", value: summary.totalProducts, cls: "bg-iris-50 text-iris-500", icon: "box" as const },
    { label: "Active Products", value: summary.activeProducts, cls: "bg-success-bg text-success", icon: "box" as const },
  ];
  const payLegend = [
    { label: "Paid", amount: summary.paidEarnings, color: CHART.green },
    { label: "Unpaid", amount: summary.unpaidEarnings, color: CHART.amber },
    { label: `Commission (${summary.commissionRatePct}%)`, amount: summary.totalCommission, color: CHART.iris },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
          <Icon name="chart" size={19} strokeWidth={1.9} />
        </span>
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Transaction Report</h1>
          <p className="mt-1 font-sans text-[13px] text-muted">
            {range.label} · order-level amounts, commission &amp; net earnings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-[22px] flex gap-3">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`flex h-11 items-center rounded-full px-6 font-sans text-sm transition-colors ${
              view === t.key
                ? "bg-iris-500 font-semibold text-white"
                : "font-medium text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <ReportRangeFilter />

      {view === "expense" ? (
        /* Payout / wallet ledger — does not exist yet (payment is COD). Labeled TODO, no fake rows. */
        <div className="rounded-[18px] border border-dashed border-line bg-surface px-8 py-16 text-center">
          <span className="mx-auto mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
            <Icon name="wallet" size={34} strokeWidth={1.6} />
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="rounded-full bg-warning-bg px-2.5 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.05em] text-warning">
              Coming soon
            </span>
          </div>
          <div className="mt-3 font-display text-[19px] font-bold text-ink">
            Payout &amp; expense transactions aren&apos;t available yet
          </div>
          <p className="mx-auto mt-2.5 max-w-[440px] font-sans text-sm leading-[1.55] text-muted">
            {report.payout.note}
          </p>
          <Link
            href={tabHref("orders")}
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            View order transactions
          </Link>
        </div>
      ) : (
        <>
          {/* Earnings summary */}
          <div className="mb-[22px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {earnings.map((e) => (
              <div key={e.label} className="rounded-[16px] border border-line-soft bg-surface p-[18px] shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex size-8 items-center justify-center rounded-[9px]"
                    style={{ background: `${e.color}1A`, color: e.color }}
                  >
                    <Icon name={e.icon} size={16} strokeWidth={1.9} />
                  </span>
                  <span className="font-sans text-[12px] font-medium text-muted">{e.label}</span>
                </div>
                <div className="mt-3 font-display text-[22px] font-extrabold text-ink">{formatMoney(e.value)}</div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mb-[22px] grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[300px_1fr_300px]">
            {/* Left: product context */}
            <div className="flex flex-col gap-[22px]">
              {productCards.map((c) => (
                <div key={c.label} className="flex items-center gap-3.5 rounded-[18px] border border-line-soft bg-surface p-[22px] shadow-xs">
                  <span className={`flex size-[46px] items-center justify-center rounded-xl ${c.cls}`}>
                    <Icon name={c.icon} size={22} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="font-display text-[24px] font-extrabold leading-none text-ink">{c.value}</div>
                    <div className="mt-1.5 font-sans text-[12px] font-medium text-muted">{c.label}</div>
                  </div>
                </div>
              ))}
              <div className="rounded-[18px] border border-line-soft bg-surface p-[22px] shadow-xs">
                <div className="flex items-center gap-3.5 border-b border-line-soft pb-4">
                  <span className="flex size-[46px] items-center justify-center rounded-xl bg-error-bg text-error">
                    <Icon name="box" size={22} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="font-display text-[22px] font-extrabold leading-none text-ink">
                      {summary.inactiveProducts}
                    </div>
                    <div className="mt-1.5 font-sans text-[12px] font-medium text-muted">Inactive Products</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 pt-4">
                  <span className="flex size-[46px] items-center justify-center rounded-xl bg-warning-bg text-warning">
                    <Icon name="box" size={22} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="font-display text-[22px] font-extrabold leading-none text-ink">
                      {summary.pendingProducts}
                    </div>
                    <div className="mt-1.5 font-sans text-[12px] font-medium text-muted">Pending Products</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: chart */}
            <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
              <div className="mb-4 font-display text-[17px] font-bold text-ink">Order Statistics</div>
              <AreaChart
                labels={chart.labels}
                series={[{ label: chart.label, color: CHART.iris, data: chart.data }]}
                height={340}
                yPrefix=""
              />
            </div>

            {/* Right: payment stats */}
            <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
              <div className="mb-5 text-center font-display text-base font-bold text-ink">Payment Statistics</div>
              <div className="mb-6 text-center">
                <div className="font-display text-[26px] font-extrabold text-ink">
                  {formatMoney(summary.paidEarnings)}
                </div>
                <div className="mt-2 font-sans text-[12px] text-muted">Completed payments</div>
              </div>
              <div className="flex flex-col gap-3.5">
                {payLegend.map((p) => (
                  <div key={p.label} className="flex items-center gap-2.5 font-sans text-[13px] text-ink-soft">
                    <span className="size-2.5 flex-none rounded-full" style={{ background: p.color }} />
                    <span className="flex-1">{p.label}</span>
                    <span className="font-semibold text-ink">{formatMoney(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
              <div className="flex items-center gap-2.5">
                <span className="font-display text-[17px] font-bold text-ink">Total Transactions</span>
                <span className="flex h-6 min-w-[26px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[12px] font-bold text-ink-soft">
                  {rows.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ReportSearch placeholder="Search by order id or customer" />
                <ReportExportButton
                  filename={`transaction-report-${range.preset}.csv`}
                  headers={["SL", "Order Id", "Customer", "Total Product Amount", "Coupon Discount", "Discounted Amount", "Commission", "Net Earning", "Status"]}
                  rows={exportRows}
                />
              </div>
            </div>

            {rows.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-[14px] border border-line-soft">
                  <div className="min-w-[1040px]">
                    <div
                      className={`${ROW} bg-field px-[18px] py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
                    >
                      <span>SL</span>
                      <span>Order Id</span>
                      <span>Customer</span>
                      <span>Total Amount</span>
                      <span>Coupon Discount</span>
                      <span>Discounted</span>
                      <span>Commission</span>
                      <span>Net</span>
                    </div>
                    {rows.map((r) => (
                      <div
                        key={r.subOrderId}
                        className={`${ROW} border-t border-line-soft px-[18px] py-3.5 font-sans text-[13px] text-ink-soft transition-colors hover:bg-bg-subtle`}
                      >
                        <span className="text-muted-soft">{r.sl}</span>
                        <Link
                          href={`/vendor/orders/${r.subOrderId}`}
                          className="font-display text-[13px] font-bold text-iris-500 hover:text-iris-600"
                        >
                          {r.orderNumber}
                        </Link>
                        <span className="truncate font-semibold text-ink">{r.customerName}</span>
                        <span>{formatMoney(r.totalProductAmount)}</span>
                        <span>{formatMoney(r.couponDiscount)}</span>
                        <span className="font-semibold text-ink">{formatMoney(r.discountedAmount)}</span>
                        <span className="text-error">−{formatMoney(r.commission)}</span>
                        <span className="font-semibold text-success">{formatMoney(r.netEarning)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-4 font-sans text-[11.5px] leading-[1.5] text-muted-soft">
                  Net = Discounted Amount − Commission ({summary.commissionRatePct}% platform fee). Per-order product
                  &amp; referral discounts aren&apos;t tracked per sub-order yet. Payouts are settled per sub-order on
                  delivery (COD) — see the Expense Transactions tab.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center rounded-[14px] border border-dashed border-line px-8 py-16 text-center">
                <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
                  <Icon name="chart" size={34} strokeWidth={1.6} />
                </span>
                <div className="font-display text-[19px] font-bold text-ink">
                  {q ? "No transactions match your search" : "No transactions in this range"}
                </div>
                <p className="mx-auto mt-2.5 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
                  {q
                    ? "Try a different order id or customer, or clear the search."
                    : `No orders were placed for your store during ${range.label.toLowerCase()}. Try a wider date range.`}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
