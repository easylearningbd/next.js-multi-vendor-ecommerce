import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/shop/pricing";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/dashboard/Icon";
import { AreaChart, CHART } from "@/components/dashboard/Charts";
import { getSessionVendorId } from "@/lib/vendor/orders";
import { getProductReport, parseReportRange } from "@/lib/vendor/reports";
import { ReportRangeFilter } from "@/components/vendor-reports/ReportRangeFilter";
import { ReportSearch } from "@/components/vendor-reports/ReportSearch";
import { ReportExportButton } from "@/components/vendor-reports/ReportExportButton";

export const metadata: Metadata = { title: "Product Report — Covet Seller" };
export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const ROW = "grid grid-cols-[50px_1.6fr_1fr_1fr_1fr_1.1fr_1.1fr] items-center gap-3";

export default async function VendorProductReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const vendorId = await getSessionVendorId();
  if (!vendorId) redirect("/vendor/login?next=/vendor/reports/products");

  const sp = await searchParams;
  const range = parseReportRange({ range: one(sp.range) });
  const view = one(sp.view) === "stock" ? "stock" : "all";

  const [report, vendor] = await Promise.all([
    getProductReport(vendorId, range),
    prisma.vendor.findUnique({ where: { id: vendorId }, select: { storeName: true } }),
  ]);
  const { summary, chart } = report;
  const storeName = vendor?.storeName ?? "your store";

  const q = one(sp.q)?.trim().toLowerCase() ?? "";
  const filtered = q
    ? report.rows.filter((r) => r.name.toLowerCase().includes(q))
    : report.rows;
  // "Products Stock" tab surfaces the lowest stock first; "All" keeps best-selling order.
  const rows = view === "stock" ? [...filtered].sort((a, b) => a.stock - b.stock) : filtered;

  const exportRows = rows.map((r, i) => [
    i + 1,
    r.name,
    r.unitPrice,
    r.revenue,
    r.unitsSold,
    r.avgValue,
    r.stock,
    r.rating ?? "",
  ]);

  const productSplit = [
    { label: "Rejected", value: summary.rejected, cls: "text-error" },
    { label: "Pending", value: summary.pending, cls: "text-warning" },
    { label: "Active", value: summary.active, cls: "text-success" },
  ];

  const tabs: { key: "all" | "stock"; label: string }[] = [
    { key: "all", label: "All Products" },
    { key: "stock", label: "Products Stock" },
  ];
  const tabHref = (key: "all" | "stock") => {
    const params = new URLSearchParams();
    if (range.preset !== "this-year") params.set("range", range.preset);
    if (q) params.set("q", q);
    if (key === "stock") params.set("view", "stock");
    const qs = params.toString();
    return qs ? `/vendor/reports/products?${qs}` : "/vendor/reports/products";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
          <Icon name="box" size={19} strokeWidth={1.9} />
        </span>
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Product Report</h1>
          <p className="mt-1 font-sans text-[13px] text-muted">
            {range.label} · sales, stock &amp; ratings per product
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

      {/* Stats card */}
      <div className="mb-[22px] rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Total products + status split */}
          <div className="rounded-[14px] border border-line-soft p-[18px]">
            <div className="mb-4 flex items-center gap-3.5">
              <span className="flex size-[46px] items-center justify-center rounded-xl bg-iris-50 text-iris-500">
                <Icon name="box" size={22} strokeWidth={1.8} />
              </span>
              <div>
                <div className="font-display text-[24px] font-extrabold leading-none text-ink">
                  {summary.totalProducts}
                </div>
                <div className="mt-1.5 font-sans text-[12px] font-medium text-muted">Total Product</div>
              </div>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-3.5 text-center">
              {productSplit.map((s) => (
                <div key={s.label}>
                  <div className={`font-display text-base font-extrabold ${s.cls}`}>{s.value}</div>
                  <div className="mt-1.5 font-sans text-[11px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Units sold + discount given */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3.5 rounded-[14px] border border-success-bg bg-success-bg/40 p-[18px]">
              <span className="flex size-[46px] items-center justify-center rounded-xl bg-surface text-success">
                <Icon name="coins" size={22} strokeWidth={1.8} />
              </span>
              <div>
                <div className="font-display text-[22px] font-extrabold leading-none text-success">
                  {summary.totalUnitsSold.toLocaleString("en-US")}
                </div>
                <div className="mt-1.5 font-sans text-[12px] font-medium text-muted">Total Product Sale</div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 rounded-[14px] border border-warning-bg bg-warning-bg/40 p-[18px]">
              <span className="flex size-[46px] items-center justify-center rounded-xl bg-surface text-warning">
                <Icon name="wallet" size={22} strokeWidth={1.8} />
              </span>
              <div>
                <div className="font-display text-[22px] font-extrabold leading-none text-ink">
                  {formatMoney(summary.totalCouponDiscount)}
                </div>
                <div className="mt-1.5 font-sans text-[12px] font-medium text-muted">Total Discount Given</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3.5 font-display text-base font-bold text-ink">Product Statistics</div>
        <AreaChart
          labels={chart.labels}
          series={[{ label: chart.label, color: CHART.iris, data: chart.data }]}
          height={300}
          yPrefix=""
        />
      </div>

      {/* Table */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-[17px] font-bold text-ink">
              {view === "stock" ? "Products by Stock" : "All Products"}
            </span>
            <span className="flex h-6 min-w-[26px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[12px] font-bold text-ink-soft">
              {rows.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ReportSearch placeholder="Search product name" />
            <ReportExportButton
              filename={`product-report-${range.preset}.csv`}
              headers={["SL", "Product Name", "Unit Price", "Total Sold", "Qty Sold", "Avg Value", "Current Stock", "Rating"]}
              rows={exportRows}
            />
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-[14px] border border-line-soft">
            <div className="min-w-[980px]">
              <div
                className={`${ROW} bg-field px-[18px] py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
              >
                <span>SL</span>
                <span>Product Name</span>
                <span>Unit Price</span>
                <span>Total Sold</span>
                <span>Qty Sold</span>
                <span>Avg Value</span>
                <span>Current Stock</span>
              </div>
              {rows.map((r, i) => (
                <div
                  key={r.productId}
                  className={`${ROW} border-t border-line-soft px-[18px] py-3.5 font-sans text-[13px] text-ink-soft transition-colors hover:bg-bg-subtle`}
                >
                  <span className="text-muted-soft">{i + 1}</span>
                  <div className="min-w-0">
                    <Link
                      href={`/products/${r.slug}`}
                      className="line-clamp-1 font-sans text-[13px] font-semibold text-ink hover:text-iris-500"
                    >
                      {r.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 font-sans text-[10.5px] text-iris-500">
                      <span>Sold by {storeName}</span>
                      {r.rating != null && (
                        <span className="flex items-center gap-0.5">
                          <Icon name="star" size={11} className="text-star" />
                          <span className="text-muted">{r.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span>{formatMoney(r.unitPrice)}</span>
                  <span className="font-semibold text-ink">{formatMoney(r.revenue)}</span>
                  <span>{r.unitsSold}</span>
                  <span>{formatMoney(r.avgValue)}</span>
                  <span>
                    {r.lowStock ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 font-sans text-[11.5px] font-semibold text-warning">
                        {r.stock} · Low
                      </span>
                    ) : (
                      <span className="font-medium text-ink">{r.stock}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-[14px] border border-dashed border-line px-8 py-16 text-center">
            <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
              <Icon name="box" size={34} strokeWidth={1.6} />
            </span>
            <div className="font-display text-[19px] font-bold text-ink">
              {q ? "No products match your search" : "No products to report"}
            </div>
            <p className="mx-auto mt-2.5 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
              {q
                ? "Try a different product name, or clear the search."
                : "Once you add products and they start selling, their performance shows here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
