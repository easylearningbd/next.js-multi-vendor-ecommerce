"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import { useCart, lineKey, type CartItem } from "@/components/shop/cart/CartProvider";

/**
 * Header cart trigger + hover popover, driven by the client cart store. Shows a
 * live count + subtotal, groups line items by seller (marketplace rule), and
 * offers per-line increment / decrement / remove.
 */
export function HeaderCart() {
  const [open, setOpen] = useState(false);
  const { count, subtotalCents, groups } = useCart();

  const isEmpty = groups.length === 0;

  return (
    // Padding-bridge wrapper so the pointer reaches the popover without it closing.
    <div
      className="relative ml-1.5 pb-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/cart"
        className="flex items-center gap-3 rounded-xl border border-iris-100 bg-iris-50 py-[9px] pl-3 pr-3.5 transition-colors hover:bg-iris-100"
      >
        <span className="relative text-iris-500">
          <Icon name="cart" size={23} strokeWidth={2} />
          {count > 0 && (
            <span className="absolute -right-2 -top-[7px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-iris-500 px-1 font-sans text-[10px] font-semibold text-white">
              {count}
            </span>
          )}
        </span>
        <span className="text-left">
          <span className="mb-[3px] block font-sans text-[11px] text-muted">
            My cart
          </span>
          <span className="block font-display text-sm font-bold text-ink">
            {formatCents(subtotalCents)}
          </span>
        </span>
      </Link>

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
                {count > 0 && (
                  <span className="font-sans text-[12px] text-muted">
                    ({count})
                  </span>
                )}
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
                <p className="font-sans text-sm text-muted">Your cart is empty.</p>
                <Link
                  href="/"
                  className="font-sans text-[13px] font-semibold text-iris-500 hover:text-iris-600"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="max-h-[340px] overflow-y-auto px-5">
                  {groups.map((group) => (
                    <div key={group.sellerSlug}>
                      <div className="pb-1.5 pt-3.5 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-iris-500">
                        Sold by {group.sellerStoreName}
                      </div>
                      {group.items.map((item) => (
                        <CartRow key={lineKey(item)} item={item} />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="px-5 pb-5 pt-4">
                  <div className="mb-3.5 flex items-baseline justify-between">
                    <span className="font-sans text-sm text-muted">Subtotal</span>
                    <span className="font-display text-[22px] font-extrabold text-ink">
                      {formatCents(subtotalCents)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-iris-500 font-display text-sm font-bold text-white transition-colors hover:bg-iris-600"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem } = useCart();
  const key = lineKey(item);

  return (
    <div className="flex gap-3.5 border-b border-line-soft py-3 last:border-b-0">
      <div className="relative size-[62px] flex-none overflow-hidden rounded-xl bg-field">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="line-clamp-2 font-sans text-[13px] font-medium leading-[1.35] text-ink">
          {item.name}
        </div>
        {item.variantLabel && (
          <div className="mt-0.5 font-sans text-[11px] text-muted">
            {item.variantLabel}
          </div>
        )}
        <div className="mt-1 font-display text-[13px] font-bold text-ink">
          {formatCents(item.priceCents * item.qty)}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center overflow-hidden rounded-lg border border-line">
            <button
              type="button"
              onClick={() => decrement(key)}
              aria-label="Decrease quantity"
              className="flex size-7 items-center justify-center text-muted transition-colors hover:bg-field"
            >
              <Icon name="chevronDown" size={13} strokeWidth={2.4} className="rotate-90" />
            </button>
            <span className="min-w-7 border-x border-line-soft text-center font-display text-[12px] font-bold leading-7 text-ink">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => increment(key)}
              aria-label="Increase quantity"
              className="flex size-7 items-center justify-center text-iris-500 transition-colors hover:bg-iris-50"
            >
              <Icon name="plus" size={13} strokeWidth={2.4} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(key)}
            aria-label="Remove item"
            className="flex items-center gap-1 font-sans text-[12px] font-medium text-muted transition-colors hover:text-error"
          >
            <Icon name="trash" size={14} strokeWidth={2} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
