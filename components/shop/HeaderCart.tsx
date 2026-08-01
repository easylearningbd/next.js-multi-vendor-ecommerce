"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

/**
 * Header cart trigger + hover popover.
 *
 * Part 1 renders the shell only — the count and total are placeholders and the
 * popover shows the empty state. Part 7 wires this to the client cart store
 * (Zustand/Context): the count, total, grouped-by-seller line items, and the
 * increment/decrement/remove controls all read from that store. The seam is
 * marked TODO(part7-cart) below.
 */
export function HeaderCart() {
  const [open, setOpen] = useState(false);

  // TODO(part7-cart): replace with live values from the client cart store.
  const count = 0;
  const totalText = "$0.00";
  const isEmpty = true;

  return (
    // Padding-bridge wrapper so the pointer reaches the popover without it closing.
    <div
      className="relative ml-1.5 pb-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-3 rounded-xl border border-iris-100 bg-iris-50 py-[9px] pl-3 pr-3.5 transition-colors hover:bg-iris-100"
      >
        <span className="relative text-iris-500">
          <Icon name="cart" size={23} strokeWidth={2} />
          <span className="absolute -right-2 -top-[7px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-iris-500 px-1 font-sans text-[10px] font-semibold text-white">
            {count}
          </span>
        </span>
        <span className="text-left">
          <span className="mb-[3px] block font-sans text-[11px] text-muted">
            My cart
          </span>
          <span className="block font-display text-sm font-bold text-ink">
            {totalText}
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 w-[380px]">
          <div className="overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-[0_26px_64px_-16px_rgba(20,18,31,0.30)]">
            <div className="flex items-center justify-between border-b border-iris-100 bg-iris-50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-iris-500 text-white">
                  <Icon name="cart" size={18} strokeWidth={2} />
                </span>
                <span className="font-display text-base font-bold text-ink">
                  Shopping Cart
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 font-sans text-[13px] font-medium text-muted hover:text-ink"
              >
                <Icon name="x" size={16} strokeWidth={2} />
                Close
              </button>
            </div>

            {isEmpty ? (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-field text-muted-soft">
                  <Icon name="cart" size={28} strokeWidth={1.75} />
                </span>
                <p className="font-sans text-sm text-muted">
                  Your cart is empty.
                </p>
                <Link
                  href="/"
                  className="font-sans text-[13px] font-semibold text-iris-500 hover:text-iris-600"
                >
                  Continue shopping
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
