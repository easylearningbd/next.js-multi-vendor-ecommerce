"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { StorefrontProduct } from "@/lib/shop/queries";

/**
 * Canonical storefront product card (from ProductCard.dc.html). Always shows the
 * seller (marketplace rule). Client component: hover reveals the quick-view eye,
 * the wishlist heart toggles locally, and Add-to-cart gives transient feedback.
 *
 * Seams for later parts:
 *  - onQuickView (Part 6): when provided, the eye opens the quick-view modal;
 *    otherwise it links to the product page. Title/image always link there.
 *  - Add to cart (Part 7): currently a transient visual — the TODO(part7-cart)
 *    seam is where the client cart store's addItem() gets called.
 */
export function ProductCard({
  product,
  onQuickView,
}: {
  product: StorefrontProduct;
  onQuickView?: (product: StorefrontProduct) => void;
}) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const href = `/products/${product.slug}`;
  const filledStars = Math.round(product.rating ?? 0);

  function handleAddToCart() {
    // TODO(part7-cart): call the client cart store's addItem(product) here.
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-[0_1px_2px_rgba(20,18,31,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-14px_rgba(20,18,31,0.20)]">
      {/* Image */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-field">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-4 text-center font-sans text-[11px] text-muted-soft">
              {product.name}
            </span>
          )}
        </Link>

        {/* Quick view — modal (Part 6) when a handler is provided, else product page */}
        {onQuickView ? (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            aria-label="Quick view"
            className="absolute left-1/2 top-1/2 z-[3] flex size-[50px] -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-surface text-iris-500 opacity-0 shadow-[0_10px_24px_-6px_rgba(20,18,31,0.32)] transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100 hover:bg-iris-500 hover:text-white"
          >
            <Icon name="eye" size={22} strokeWidth={2} />
          </button>
        ) : (
          <Link
            href={href}
            aria-label="Quick view"
            className="absolute left-1/2 top-1/2 z-[3] flex size-[50px] -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-surface text-iris-500 opacity-0 shadow-[0_10px_24px_-6px_rgba(20,18,31,0.32)] transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100 hover:bg-iris-500 hover:text-white"
          >
            <Icon name="eye" size={22} strokeWidth={2} />
          </Link>
        )}

        {product.discountPercent != null && (
          <span className="absolute left-3 top-3 rounded-full bg-iris-100 px-2.5 py-1.5 font-sans text-[11px] font-semibold text-iris-700">
            −{product.discountPercent}%
          </span>
        )}

        <button
          type="button"
          onClick={() => setWished((w) => !w)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-2.5 top-2.5 z-[3] flex size-9 items-center justify-center rounded-full border-none bg-white/90 shadow-[0_2px_8px_rgba(20,18,31,0.1)] backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Icon
            name={wished ? "heart" : "heartLine"}
            size={18}
            strokeWidth={2}
            className={wished ? "text-error" : "text-muted"}
          />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-[7px] px-4 pb-[18px] pt-4">
        <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.07em] text-iris-500">
          {product.seller.storeName}
        </span>
        <Link
          href={href}
          className="line-clamp-2 min-h-[39px] font-sans text-sm font-medium leading-[1.4] text-ink transition-colors hover:text-iris-500"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                name="star"
                size={13}
                className={i < filledStars ? "text-star" : "text-line"}
              />
            ))}
          </div>
          <span className="font-sans text-[12px] text-muted">
            {product.reviewCount > 0 ? `(${product.reviewCount})` : "No reviews yet"}
          </span>
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          <span className="font-display text-[17px] font-bold text-ink">
            {product.price}
          </span>
          {product.compareAt && (
            <span className="font-sans text-[13px] text-muted-soft line-through">
              {product.compareAt}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`mt-2 flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border font-sans text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            added
              ? "border-success bg-success-bg text-success"
              : "border-line bg-surface text-ink hover:border-iris-500 hover:bg-iris-500 hover:text-white"
          }`}
        >
          <Icon name={added ? "check" : "cart"} size={16} strokeWidth={2} />
          <span>
            {!product.inStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
          </span>
        </button>
      </div>
    </div>
  );
}
