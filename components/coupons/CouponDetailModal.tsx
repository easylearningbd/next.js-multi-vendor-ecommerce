"use client";

import { useEffect } from "react";
import type { CouponListItem } from "@/lib/coupon-types";
import { Icon } from "@/components/dashboard/Icon";
import { CouponStatusBadge } from "./CouponStatusBadge";

// Ticket-style detail modal (the design's "View" action).
export function CouponDetailModal({ coupon, onClose }: { coupon: CouponListItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!coupon) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [coupon, onClose]);

  if (!coupon) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,18,31,0.55)] p-6 backdrop-blur-[3px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-[660px] grid-cols-1 overflow-hidden rounded-[20px] bg-surface shadow-[0_40px_90px_-20px_rgba(20,18,31,.5)] sm:grid-cols-[1fr_240px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface/90 text-muted transition-colors hover:bg-iris-100 hover:text-iris-700"
        >
          <Icon name="x" size={17} strokeWidth={2} />
        </button>

        <div className="p-[30px_32px]">
          <div className="mb-3 flex items-center gap-2">
            <CouponStatusBadge status={coupon.status} />
            <span className="font-sans text-[11.5px] text-muted">{coupon.scopeLabel}</span>
          </div>
          <div className="font-display text-[19px] font-bold leading-[1.3] text-ink">{coupon.title}</div>
          <div className="mt-3 font-sans text-[13px] font-semibold text-ink">
            Code : <span className="font-mono text-iris-500">{coupon.code}</span>
          </div>
          <div className="mt-2 font-sans text-[13px] text-muted">{coupon.typeLabel}</div>

          <div className="mt-6 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2.5 font-sans text-[13px]">
            <span className="text-muted">Discount</span>
            <span className="font-semibold text-ink">: {coupon.valueLabel}</span>
            <span className="text-muted">Minimum Purchase</span>
            <span className="font-semibold text-ink">: {coupon.minSpendLabel}</span>
            <span className="text-muted">Maximum Discount</span>
            <span className="font-semibold text-ink">: {coupon.maxDiscountLabel}</span>
            <span className="text-muted">Start Date</span>
            <span className="font-semibold text-ink">: {coupon.startLabel}</span>
            <span className="text-muted">Expire Date</span>
            <span className="font-semibold text-ink">: {coupon.expiryLabel}</span>
            <span className="text-muted">Usage</span>
            <span className="font-semibold text-ink">
              : {coupon.usageLabel}
              {coupon.usageLimitPerUser != null && `  ·  ${coupon.usageLimitPerUser}/customer`}
            </span>
          </div>
        </div>

        <div className="relative hidden items-center justify-center bg-[linear-gradient(135deg,var(--color-iris-600),var(--color-iris-900))] sm:flex">
          <div className="absolute bottom-0 left-[-1px] top-0 w-[14px] bg-iris-400" />
          <div className="flex h-[160px] w-[160px] flex-col items-center justify-center rounded-full bg-surface">
            <div className="font-display text-[36px] font-extrabold leading-none text-ink">{coupon.bigLabel}</div>
            <div className="mt-2 font-display text-[14px] font-semibold text-iris-500">
              {coupon.type === "FREE_SHIPPING" ? "Shipping" : "Off"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
