"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import type { AppliedCoupon } from "@/app/(shop)/checkout/actions";

/**
 * Coupon form in the order summary. Applies a code to its matching vendor's
 * items (per-vendor coupons: multiple vendors can each have one) and lists
 * applied coupons with individual removal.
 */
export function CouponForm({
  applied,
  onApply,
  onRemove,
  pending,
}: {
  applied: AppliedCoupon[];
  onApply: (code: string) => void;
  onRemove: (vendorId: string) => void;
  pending: boolean;
}) {
  const [code, setCode] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim();
    if (!c || pending) return;
    onApply(c);
    setCode("");
  }

  return (
    <div className="border-t border-line-soft py-4">
      {applied.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {applied.map((c) => (
            <div
              key={c.vendorId}
              className="flex items-center gap-2 rounded-[10px] border border-success/30 bg-success-bg px-3 py-2"
            >
              <Icon name="ticket" size={15} strokeWidth={2} className="flex-none text-success" />
              <div className="min-w-0 flex-1">
                <div className="font-sans text-[12.5px] font-semibold text-ink">
                  {c.code}
                  <span className="ml-1.5 font-normal text-muted">· {c.vendorName}</span>
                </div>
                <div className="font-sans text-[11px] text-success">
                  {c.freeShipping && c.discountCents === 0
                    ? "Free shipping applied"
                    : `−${formatCents(c.discountCents)} off ${c.vendorName}'s items`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(c.vendorId)}
                aria-label={`Remove coupon ${c.code}`}
                className="flex size-6 flex-none items-center justify-center rounded-full text-muted transition-colors hover:bg-error/10 hover:text-error"
              >
                <Icon name="x" size={13} strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          aria-label="Coupon code"
          className="h-11 min-w-0 flex-1 rounded-[10px] border border-line bg-field px-3.5 font-sans text-[13px] uppercase text-ink outline-none placeholder:normal-case placeholder:text-muted focus:border-iris-500"
        />
        <button
          type="submit"
          disabled={pending || code.trim().length === 0}
          className="flex h-11 flex-none items-center rounded-[10px] bg-ink px-5 font-sans text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Applying…" : "Apply"}
        </button>
      </form>
    </div>
  );
}
