import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_REPORT_PRESET,
  isReportPreset,
  REPORT_PRESETS,
  type ReportPreset,
} from "./report-presets";

// Re-export so pages can pull range constants/types from one place.
export { REPORT_PRESETS } from "./report-presets";
export type { ReportPreset } from "./report-presets";

/**
 * Vendor reporting layer — READ-ONLY analytics COMPUTED from existing data
 * (SubOrder / OrderItem / Order / Product / Coupon). No new tables, no stored
 * aggregates, no mutations. Every function is scoped to a single vendorId and a
 * URL-driven date range, so reports are shareable and refresh-safe.
 *
 * Money is Decimal end-to-end: sums accumulate as Prisma.Decimal (never float)
 * and are returned as fixed-2 strings for display. The only Number() conversions
 * are for Chart.js series (display-only, non-authoritative).
 */

/**
 * Platform commission assumption. The PRD lists the payout schedule / commission
 * rate as an OPEN question (PRD §"Open questions"), so no rate is defined yet.
 * We surface commission + net earnings using this single documented constant —
 * change it in ONE place once finance confirms the real rate. This is a business
 * rule applied to REAL order totals, not fabricated data.
 * TODO(payout): replace with the configured per-vendor/category commission once
 * the Stripe payout + wallet flow exists.
 */
export const PLATFORM_COMMISSION_RATE = new Prisma.Decimal("0.10"); // 10%

/** Below this on-hand quantity a product is flagged low-stock in the report. */
export const LOW_STOCK_THRESHOLD = 10;

// ---------------------------------------------------------------------------
// Date range — read from the URL (?range=this-year|this-month|this-week|today)
// ---------------------------------------------------------------------------

export type ReportRange = {
  preset: ReportPreset;
  label: string;
  /** Inclusive lower bound (start of the calendar period). */
  from: Date;
  /** Exclusive upper bound (start of the NEXT period — may be in the future so
   *  the chart axis shows the whole period, e.g. Jan–Dec, with 0 for empty buckets). */
  to: Date;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday-based start of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const s = startOfDay(d);
  const dow = (s.getDay() + 6) % 7; // 0 = Monday
  s.setDate(s.getDate() - dow);
  return s;
}

/**
 * Resolve the URL `range` param to a concrete date window. Unknown/missing →
 * the default (This Year). Ranges are computed in server-local time.
 */
export function parseReportRange(params: { range?: string } = {}): ReportRange {
  const preset = isReportPreset(params.range) ? params.range : DEFAULT_REPORT_PRESET;
  const now = new Date();
  const label = REPORT_PRESETS.find((p) => p.value === preset)!.label;

  switch (preset) {
    case "today": {
      const from = startOfDay(now);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      return { preset, label, from, to };
    }
    case "this-week": {
      const from = startOfWeek(now);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      return { preset, label, from, to };
    }
    case "this-month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { preset, label, from, to };
    }
    case "this-year":
    default: {
      const from = new Date(now.getFullYear(), 0, 1);
      const to = new Date(now.getFullYear() + 1, 0, 1);
      return { preset, label, from, to };
    }
  }
}

// ---------------------------------------------------------------------------
// Time-bucketing for the chart series
// ---------------------------------------------------------------------------

type BucketUnit = "hour" | "day" | "month";

function unitFor(preset: ReportPreset): BucketUnit {
  if (preset === "today") return "hour";
  if (preset === "this-year") return "month";
  return "day"; // this-week / this-month
}

const MONTH_FMT = new Intl.DateTimeFormat("en-US", { month: "short" });
const WEEKDAY_FMT = new Intl.DateTimeFormat("en-US", { weekday: "short" });

/** Bucket labels spanning the FULL period [from, to). */
function bucketLabels(range: ReportRange): string[] {
  const unit = unitFor(range.preset);
  const labels: string[] = [];
  if (unit === "hour") {
    for (let h = 0; h < 24; h++) {
      const hr = h % 12 === 0 ? 12 : h % 12;
      labels.push(`${hr}${h < 12 ? "am" : "pm"}`);
    }
    return labels;
  }
  if (unit === "month") {
    for (let m = 0; m < 12; m++) labels.push(MONTH_FMT.format(new Date(range.from.getFullYear(), m, 1)));
    return labels;
  }
  // day buckets
  const cursor = new Date(range.from);
  while (cursor < range.to) {
    labels.push(
      range.preset === "this-week"
        ? WEEKDAY_FMT.format(cursor)
        : String(cursor.getDate()),
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return labels;
}

/** Which bucket a timestamp falls into, or -1 if outside the period. */
function bucketIndex(range: ReportRange, at: Date, bucketCount: number): number {
  const unit = unitFor(range.preset);
  let idx: number;
  if (unit === "hour") {
    idx = Math.floor((at.getTime() - range.from.getTime()) / 3_600_000);
  } else if (unit === "month") {
    idx = (at.getFullYear() - range.from.getFullYear()) * 12 + (at.getMonth() - range.from.getMonth());
  } else {
    idx = Math.floor((startOfDay(at).getTime() - range.from.getTime()) / 86_400_000);
  }
  return idx >= 0 && idx < bucketCount ? idx : -1;
}

// ---------------------------------------------------------------------------
// Decimal helpers (no floating-point money math)
// ---------------------------------------------------------------------------

const ZERO = new Prisma.Decimal(0);
const D = (v: Prisma.Decimal | string | number | null | undefined) =>
  v == null ? ZERO : new Prisma.Decimal(v);
const money = (d: Prisma.Decimal) => d.toFixed(2);
const toNum = (d: Prisma.Decimal) => Number(d.toFixed(2));

// Status groupings for the "Canceled / Ongoing / Completed" summary split.
const COMPLETED_STATUSES: OrderStatus[] = ["DELIVERED"];
const CANCELED_STATUSES: OrderStatus[] = ["CANCELED", "RETURNED", "FAILED_TO_DELIVER"];

function emptyStatusRecord(): Record<OrderStatus, number> {
  return {
    PENDING: 0,
    CONFIRMED: 0,
    PACKAGING: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    CANCELED: 0,
    RETURNED: 0,
    FAILED_TO_DELIVER: 0,
  };
}

type ChartSeries = { labels: string[]; data: number[]; label: string; money: boolean };

// ===========================================================================
// ORDER REPORT
// ===========================================================================

export type OrderReportRow = {
  sl: number;
  subOrderId: string;
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** This vendor's sub-order figures (never the parent order's grand total). */
  totalAmount: string; // sub.total
  subtotal: string; // sub.subtotal (pre-coupon)
  couponDiscount: string; // sub.discount (real; product/referral/shipping/VAT not tracked per-vendor)
  commission: string; // total * PLATFORM_COMMISSION_RATE
  netEarning: string; // total - commission
};

export type OrderReport = {
  range: ReportRange;
  summary: {
    totalOrders: number;
    completed: number;
    ongoing: number;
    canceled: number;
    byStatus: Record<OrderStatus, number>;
    totalSales: string; // Σ sub.total in range
    avgOrderValue: string;
    completedPayments: string; // Σ sub.total where paymentStatus = PAID
  };
  chart: ChartSeries; // orders per time-bucket
  rows: OrderReportRow[];
};

/**
 * Orders/sub-orders for THIS vendor over the range: status split, sales totals,
 * an orders-over-time series, and per-sub-order table rows. One scoped query;
 * counts/sums derived in-memory as Decimal.
 */
export async function getOrderReport(vendorId: string, range: ReportRange): Promise<OrderReport> {
  const subs = await prisma.subOrder.findMany({
    where: { vendorId, order: { createdAt: { gte: range.from, lt: range.to } } },
    orderBy: { order: { createdAt: "desc" } },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      discount: true,
      total: true,
      order: { select: { orderNumber: true, createdAt: true } },
    },
  });

  const byStatus = emptyStatusRecord();
  let totalSales = ZERO;
  let completedPayments = ZERO;

  const labels = bucketLabels(range);
  const series = new Array(labels.length).fill(0);

  const rows: OrderReportRow[] = subs.map((s, i) => {
    byStatus[s.status] += 1;
    const total = D(s.total);
    totalSales = totalSales.add(total);
    if (s.paymentStatus === "PAID") completedPayments = completedPayments.add(total);

    const bi = bucketIndex(range, s.order.createdAt, labels.length);
    if (bi >= 0) series[bi] += 1;

    const commission = total.mul(PLATFORM_COMMISSION_RATE);
    return {
      sl: i + 1,
      subOrderId: s.id,
      orderNumber: s.order.orderNumber,
      createdAt: s.order.createdAt,
      status: s.status,
      paymentStatus: s.paymentStatus,
      totalAmount: money(total),
      subtotal: money(D(s.subtotal)),
      couponDiscount: money(D(s.discount)),
      commission: money(commission),
      netEarning: money(total.sub(commission)),
    };
  });

  const totalOrders = subs.length;
  const completed = COMPLETED_STATUSES.reduce((n, st) => n + byStatus[st], 0);
  const canceled = CANCELED_STATUSES.reduce((n, st) => n + byStatus[st], 0);
  const ongoing = totalOrders - completed - canceled;
  const avg = totalOrders > 0 ? totalSales.div(totalOrders) : ZERO;

  return {
    range,
    summary: {
      totalOrders,
      completed,
      ongoing,
      canceled,
      byStatus,
      totalSales: money(totalSales),
      avgOrderValue: money(avg),
      completedPayments: money(completedPayments),
    },
    chart: { labels, data: series, label: "Orders", money: false },
    rows,
  };
}

// ===========================================================================
// PRODUCT REPORT
// ===========================================================================

export type ProductReportRow = {
  sl: number;
  productId: string;
  name: string;
  slug: string;
  unitPrice: string;
  unitsSold: number;
  revenue: string; // Σ lineTotal in range
  avgValue: string; // revenue / unitsSold (0 when no sales)
  stock: number; // on-hand (sum of variation stock, else product.stock)
  lowStock: boolean;
  rating: number | null; // avg APPROVED review rating, 1-dp; null when unrated
};

export type ProductReport = {
  range: ReportRange;
  summary: {
    totalProducts: number;
    active: number;
    pending: number;
    rejected: number;
    inactive: number;
    totalUnitsSold: number;
    totalRevenue: string;
    totalCouponDiscount: string; // Σ sub.discount in range (real discount given)
  };
  chart: ChartSeries; // units sold per time-bucket
  rows: ProductReportRow[]; // all of this vendor's products, best-selling first
};

/**
 * Per-product performance for THIS vendor over the range: units sold + revenue
 * (from OrderItems on this vendor's sub-orders), current stock, low-stock flag,
 * and approved-review rating. Set-based aggregation — groupBy for sales/ratings,
 * one products fetch, one items fetch for the time series. No N+1.
 */
export async function getProductReport(vendorId: string, range: ReportRange): Promise<ProductReport> {
  const [products, sales, ratings, soldItems, discountAgg] = await Promise.all([
    prisma.product.findMany({
      where: { vendorId },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        approvalStatus: true,
        isActive: true,
        variations: { select: { stock: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { subOrder: { vendorId, order: { createdAt: { gte: range.from, lt: range.to } } } },
      _sum: { qty: true, lineTotal: true },
    }),
    prisma.review.groupBy({
      by: ["productId"],
      where: { status: "APPROVED", product: { vendorId } },
      _avg: { rating: true },
    }),
    prisma.orderItem.findMany({
      where: { subOrder: { vendorId, order: { createdAt: { gte: range.from, lt: range.to } } } },
      select: { qty: true, createdAt: true },
    }),
    prisma.subOrder.aggregate({
      where: { vendorId, order: { createdAt: { gte: range.from, lt: range.to } } },
      _sum: { discount: true },
    }),
  ]);

  const salesById = new Map(sales.map((s) => [s.productId, s]));
  const ratingById = new Map(ratings.map((r) => [r.productId, r._avg.rating]));

  let totalUnitsSold = 0;
  let totalRevenue = ZERO;

  const unsorted = products.map((p) => {
    const sale = salesById.get(p.id);
    const unitsSold = sale?._sum.qty ?? 0;
    const revenue = D(sale?._sum.lineTotal);
    totalUnitsSold += unitsSold;
    totalRevenue = totalRevenue.add(revenue);

    const stock =
      p.variations.length > 0
        ? p.variations.reduce((n, v) => n + v.stock, 0)
        : p.stock;
    const avg = unitsSold > 0 ? revenue.div(unitsSold) : ZERO;
    const rawRating = ratingById.get(p.id);

    return {
      productId: p.id,
      name: p.name,
      slug: p.slug,
      unitPrice: money(D(p.price)),
      unitsSold,
      revenue,
      avgValue: money(avg),
      stock,
      lowStock: stock <= LOW_STOCK_THRESHOLD,
      rating: rawRating != null ? Math.round(rawRating * 10) / 10 : null,
      approvalStatus: p.approvalStatus,
      isActive: p.isActive,
    };
  });

  // Best-selling first (revenue desc, then units), then finalize row shape.
  unsorted.sort((a, b) => b.revenue.comparedTo(a.revenue) || b.unitsSold - a.unitsSold);
  const rows: ProductReportRow[] = unsorted.map((r, i) => ({
    sl: i + 1,
    productId: r.productId,
    name: r.name,
    slug: r.slug,
    unitPrice: r.unitPrice,
    unitsSold: r.unitsSold,
    revenue: money(r.revenue),
    avgValue: r.avgValue,
    stock: r.stock,
    lowStock: r.lowStock,
    rating: r.rating,
  }));

  // Product-status counts (derived from the already-fetched list — no extra query).
  let active = 0;
  let pending = 0;
  let rejected = 0;
  let inactive = 0;
  for (const p of products) {
    if (!p.isActive) inactive += 1;
    if (p.approvalStatus === "APPROVED") active += 1;
    else if (p.approvalStatus === "PENDING") pending += 1;
    else if (p.approvalStatus === "REJECTED") rejected += 1;
  }

  // Units-sold-over-time series.
  const labels = bucketLabels(range);
  const series = new Array(labels.length).fill(0);
  for (const it of soldItems) {
    const bi = bucketIndex(range, it.createdAt, labels.length);
    if (bi >= 0) series[bi] += it.qty;
  }

  return {
    range,
    summary: {
      totalProducts: products.length,
      active,
      pending,
      rejected,
      inactive,
      totalUnitsSold,
      totalRevenue: money(totalRevenue),
      totalCouponDiscount: money(D(discountAgg._sum.discount)),
    },
    chart: { labels, data: series, label: "Products Sold", money: false },
    rows,
  };
}

// ===========================================================================
// TRANSACTION REPORT
// ===========================================================================

export type TransactionRow = {
  sl: number;
  subOrderId: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalProductAmount: string; // sub.subtotal (pre-coupon)
  couponDiscount: string; // sub.discount (real)
  discountedAmount: string; // sub.total (what the vendor bills)
  commission: string; // sub.total * rate
  netEarning: string; // sub.total - commission
};

export type TransactionReport = {
  range: ReportRange;
  summary: {
    totalTransactions: number;
    grossSales: string; // Σ sub.total
    totalCommission: string; // Σ commission
    netEarnings: string; // gross - commission
    paidEarnings: string; // Σ sub.total where PAID (realized)
    unpaidEarnings: string; // Σ sub.total where NOT paid
    commissionRatePct: number; // e.g. 10
    // Product context cards shown in the design.
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    pendingProducts: number;
  };
  chart: ChartSeries; // orders per time-bucket
  rows: TransactionRow[];
  /**
   * Real payout transactions (Stripe/wallet) don't exist yet — payment is COD,
   * collected per sub-order on delivery. The page renders a labeled TODO for the
   * payout/withdrawal ledger instead of fabricating rows.
   */
  payout: { available: false; note: string };
};

/**
 * Order-level money for THIS vendor over the range: gross sales, commission
 * deducted, net + realized (paid) earnings, and per-sub-order rows. Payout/
 * withdrawal figures are intentionally absent (no Stripe/wallet yet) — see `payout`.
 */
export async function getTransactionReport(
  vendorId: string,
  range: ReportRange,
): Promise<TransactionReport> {
  const [subs, productCounts] = await Promise.all([
    prisma.subOrder.findMany({
      where: { vendorId, order: { createdAt: { gte: range.from, lt: range.to } } },
      orderBy: { order: { createdAt: "desc" } },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        subtotal: true,
        discount: true,
        total: true,
        order: { select: { orderNumber: true, createdAt: true, shipName: true } },
      },
    }),
    prisma.product.groupBy({
      by: ["approvalStatus", "isActive"],
      where: { vendorId },
      _count: { _all: true },
    }),
  ]);

  let grossSales = ZERO;
  let totalCommission = ZERO;
  let paidEarnings = ZERO;

  const labels = bucketLabels(range);
  const series = new Array(labels.length).fill(0);

  const rows: TransactionRow[] = subs.map((s, i) => {
    const total = D(s.total);
    const commission = total.mul(PLATFORM_COMMISSION_RATE);
    grossSales = grossSales.add(total);
    totalCommission = totalCommission.add(commission);
    if (s.paymentStatus === "PAID") paidEarnings = paidEarnings.add(total);

    const bi = bucketIndex(range, s.order.createdAt, labels.length);
    if (bi >= 0) series[bi] += 1;

    return {
      sl: i + 1,
      subOrderId: s.id,
      orderNumber: s.order.orderNumber,
      customerName: s.order.shipName,
      status: s.status,
      paymentStatus: s.paymentStatus,
      totalProductAmount: money(D(s.subtotal)),
      couponDiscount: money(D(s.discount)),
      discountedAmount: money(total),
      commission: money(commission),
      netEarning: money(total.sub(commission)),
    };
  });

  const netEarnings = grossSales.sub(totalCommission);
  const unpaidEarnings = grossSales.sub(paidEarnings);

  // Fold the product groupBy into the four context counts.
  let totalProducts = 0;
  let activeProducts = 0;
  let inactiveProducts = 0;
  let pendingProducts = 0;
  for (const g of productCounts) {
    const c = g._count._all;
    totalProducts += c;
    if (g.isActive) activeProducts += c;
    else inactiveProducts += c;
    if (g.approvalStatus === "PENDING") pendingProducts += c;
  }

  return {
    range,
    summary: {
      totalTransactions: subs.length,
      grossSales: money(grossSales),
      totalCommission: money(totalCommission),
      netEarnings: money(netEarnings),
      paidEarnings: money(paidEarnings),
      unpaidEarnings: money(unpaidEarnings),
      commissionRatePct: toNum(PLATFORM_COMMISSION_RATE.mul(100)),
      totalProducts,
      activeProducts,
      inactiveProducts,
      pendingProducts,
    },
    chart: { labels, data: series, label: "Orders", money: false },
    rows,
    payout: {
      available: false,
      note: "Payout & wallet withdrawals are not available yet. Payment is Cash on Delivery, collected per sub-order on delivery; real payout transactions appear here once the Stripe payout/wallet flow is built.",
    },
  };
}
