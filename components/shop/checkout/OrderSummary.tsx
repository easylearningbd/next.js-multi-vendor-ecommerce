"use client";

import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import { computeTotals } from "@/lib/checkout/totals";

/**
 * Order summary sidebar — subtotal, discount, shipping, tax, grand total, and
 * the step's primary action. `coupon` is a slot the coupon form drops into
 * (Part 3). All money is integer cents.
 */
export function OrderSummary({
  subtotalCents,
  discountCents = 0,
  shippingCents = 0,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  coupon,
}: {
  subtotalCents: number;
  discountCents?: number;
  shippingCents?: number;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  coupon?: React.ReactNode;
}) {
  const t = computeTotals(subtotalCents, { shippingCents, discountCents });

  return (
    <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <h2 className="m-0 mb-5 font-display text-[18px] font-bold text-ink">Order Summary</h2>

      <div className="flex flex-col gap-3 border-b border-line-soft pb-4 font-sans text-sm text-ink-soft">
        <div className="flex justify-between">
          <span>Sub total</span>
          <span className="font-semibold text-ink">{formatCents(t.subtotalCents)}</span>
        </div>
        {t.discountCents > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="font-semibold text-success">
              −{formatCents(t.discountCents)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="font-semibold text-ink">
            {t.shippingCents === 0 ? "Free" : formatCents(t.shippingCents)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax (15%)</span>
          <span className="font-semibold text-ink">{formatCents(t.taxCents)}</span>
        </div>
      </div>

      {coupon}

      <div className="flex items-baseline justify-between py-[18px]">
        <span className="font-display text-base font-semibold text-ink">Total</span>
        <span className="font-display text-[24px] font-extrabold text-iris-500">
          {formatCents(t.grandTotalCents)}
        </span>
      </div>

      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-iris-500 font-display text-sm font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {primaryLabel}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 font-sans text-[12px] text-muted">
        <Icon name="lock" size={14} strokeWidth={2} className="text-iris-500" />
        Safe &amp; secure checkout
      </div>
    </div>
  );
}
