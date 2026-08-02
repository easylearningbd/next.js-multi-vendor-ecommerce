"use client";

import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import { useCart, lineKey } from "@/components/shop/cart/CartProvider";

const ROW = "grid grid-cols-[1fr_120px_140px_100px] items-center gap-4";

/** Cart review step: line items grouped by seller with qty controls + removal. */
export function CartStep() {
  const { groups, increment, decrement, removeItem } = useCart();

  return (
    <div className="overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Table header */}
          <div
            className={`${ROW} bg-field px-6 py-[18px] font-sans text-[12px] font-semibold uppercase tracking-[0.05em] text-muted`}
          >
            <span>Product</span>
            <span>Unit Price</span>
            <span>Qty</span>
            <span className="text-right">Total</span>
          </div>

          {groups.map((group) => (
            <div key={group.sellerSlug} className="px-6">
              <div className="pb-1 pt-4 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-iris-500">
                Sold by {group.sellerStoreName}
              </div>

              {group.items.map((item) => {
                const key = lineKey(item);
                return (
                  <div key={key} className={`${ROW} border-b border-line-soft py-5`}>
                    {/* Product */}
                    <div className="flex items-center gap-3.5">
                      <div className="size-16 flex-none overflow-hidden rounded-xl bg-field">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="line-clamp-2 font-sans text-sm font-medium leading-[1.35] text-ink hover:text-iris-500"
                        >
                          {item.name}
                        </Link>
                        {item.variantLabel && (
                          <div className="mt-1 font-sans text-[12px] text-muted">
                            {item.variantLabel}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="font-display text-sm font-bold text-ink">
                      {formatCents(item.priceCents)}
                    </div>

                    {/* Qty + remove */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => removeItem(key)}
                        aria-label="Remove item"
                        className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-error-bg text-error transition-colors hover:bg-error/15"
                      >
                        <Icon name="trash" size={16} strokeWidth={2} />
                      </button>
                      <div className="flex items-center overflow-hidden rounded-[10px] border border-line">
                        <button
                          type="button"
                          onClick={() => decrement(key)}
                          aria-label="Decrease quantity"
                          className="flex h-[38px] w-[34px] items-center justify-center text-muted transition-colors hover:bg-field"
                        >
                          <Icon name="chevronDown" size={14} strokeWidth={2.4} className="rotate-90" />
                        </button>
                        <span className="w-10 border-x border-line-soft text-center font-display text-sm font-bold leading-[38px] text-ink">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(key)}
                          aria-label="Increase quantity"
                          className="flex h-[38px] w-[34px] items-center justify-center text-iris-500 transition-colors hover:bg-iris-50"
                        >
                          <Icon name="plus" size={14} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="text-right font-display text-sm font-bold text-ink">
                      {formatCents(item.priceCents * item.qty)}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 py-3.5 font-sans text-[13px] text-muted">
                <span>Subtotal from {group.sellerStoreName}</span>
                <span className="font-display text-sm font-bold text-ink">
                  {formatCents(group.subtotalCents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
