"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import { useCart, toCartItem } from "@/components/shop/cart/CartProvider";
import { useWishlist } from "@/components/shop/wishlist/WishlistProvider";
import type { QuickViewProduct } from "@/lib/shop/queries";

export type QuickViewStatus = "loading" | "loaded" | "error";

export function QuickViewModal({
  open,
  status,
  product,
  onClose,
}: {
  open: boolean;
  status: QuickViewStatus;
  product: QuickViewProduct | null;
  onClose: () => void;
}) {
  // Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-[3px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Product quick view"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-[940px] overflow-y-auto rounded-[22px] bg-surface shadow-[0_40px_90px_-20px_rgba(20,18,31,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-[5] flex size-[38px] items-center justify-center rounded-full bg-field text-muted transition-colors hover:bg-iris-100 hover:text-iris-700"
        >
          <Icon name="x" size={18} strokeWidth={2} />
        </button>

        {status === "loading" && <QuickViewSkeleton />}
        {status === "error" && <QuickViewError onClose={onClose} />}
        {status === "loaded" && product && (
          // key remounts the body per product, resetting qty / active image / added.
          <QuickViewBody key={product.id} product={product} />
        )}
      </div>
    </div>
  );
}

function QuickViewBody({ product }: { product: QuickViewProduct }) {
  const images = [...new Set([product.thumbnail, ...product.gallery].filter(
    (x): x is string => !!x,
  ))];
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const href = `/products/${product.slug}`;
  const mainImage = images[active];
  const totalText = formatCents(product.priceCents * qty);

  function handleAddToCart() {
    addItem(toCartItem(product), qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {/* Image side */}
      <div className="p-[30px] md:border-r md:border-line-soft">
        <Link
          href={href}
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-line-soft bg-field"
        >
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-6 text-center font-sans text-[12px] text-muted-soft">
              {product.name}
            </span>
          )}
          {product.discountPercent != null && (
            <span className="absolute left-3.5 top-3.5 rounded-full bg-iris-100 px-2.5 py-1.5 font-sans text-[12px] font-semibold text-iris-700">
              −{product.discountPercent}%
            </span>
          )}
        </Link>

        {images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`size-16 flex-none overflow-hidden rounded-xl border bg-field ${
                  i === active ? "border-iris-500" : "border-line-soft"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details side */}
      <div className="p-[34px]">
        <div className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-iris-500">
          {product.seller.storeName}
        </div>
        <Link
          href={href}
          className="mb-4 block font-display text-[26px] font-bold leading-[1.25] tracking-[-0.01em] text-ink transition-colors hover:text-iris-500"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-4 border-b border-line-soft pb-[18px] font-sans text-[13.5px] text-muted">
          <span>
            <span className="font-semibold text-ink">{product.reviewCount}</span>{" "}
            Reviews
          </span>
          <span className="h-3.5 w-px bg-line" />
          <span>{product.categoryName}</span>
          {!product.inStock && (
            <>
              <span className="h-3.5 w-px bg-line" />
              <span className="font-semibold text-error">Out of stock</span>
            </>
          )}
        </div>

        <div className="my-5 flex items-baseline gap-3">
          <span className="font-display text-[34px] font-extrabold leading-none text-iris-500">
            {product.price}
          </span>
          {product.compareAt && (
            <span className="font-sans text-[17px] text-muted-soft line-through">
              {product.compareAt}
            </span>
          )}
        </div>

        {product.shortDescription && (
          <p className="mb-5 line-clamp-3 font-sans text-[13.5px] leading-[1.6] text-muted">
            {product.shortDescription}
          </p>
        )}

        {/* Quantity */}
        <div className="mb-5 flex items-center gap-4">
          <span className="font-sans text-sm text-ink-soft">Qty</span>
          <div className="flex items-center overflow-hidden rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              disabled={qty <= 1}
              className="flex h-[46px] w-11 items-center justify-center text-muted transition-colors hover:bg-field disabled:opacity-40"
            >
              <Icon name="chevronDown" size={16} strokeWidth={2.2} className="rotate-90" />
            </button>
            <span className="w-14 border-x border-line-soft text-center font-display text-[15px] font-bold leading-[46px] text-ink">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="flex h-[46px] w-11 items-center justify-center text-iris-500 transition-colors hover:bg-iris-50"
            >
              <Icon name="plus" size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <div className="mb-6 font-sans text-[15px] text-ink-soft">
          Total Price :
          <span className="ml-1.5 font-display text-[20px] font-extrabold text-iris-500">
            {totalText}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl font-display text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              added ? "bg-success" : "bg-iris-500 hover:bg-iris-600"
            }`}
          >
            <Icon name={added ? "check" : "cart"} size={17} strokeWidth={2} />
            {!product.inStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
          </button>
          <Link
            href={href}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={() => toggle(product.id)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="flex size-[52px] flex-none items-center justify-center rounded-xl border border-line transition-colors hover:border-iris-500"
          >
            <Icon
              name={wished ? "heart" : "heartLine"}
              size={20}
              strokeWidth={2}
              className={wished ? "text-error" : "text-muted"}
            />
          </button>
        </div>

      </div>
    </div>
  );
}

function QuickViewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="p-[30px] md:border-r md:border-line-soft">
        <div className="aspect-square animate-pulse rounded-2xl bg-line-soft" />
        <div className="mt-4 flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="size-16 animate-pulse rounded-xl bg-line-soft" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-[34px]">
        <div className="h-2.5 w-24 animate-pulse rounded bg-line-soft" />
        <div className="h-7 w-4/5 animate-pulse rounded bg-line-soft" />
        <div className="h-3 w-40 animate-pulse rounded bg-line-soft" />
        <div className="h-9 w-32 animate-pulse rounded bg-line-soft" />
        <div className="mt-4 h-[52px] w-full animate-pulse rounded-xl bg-line-soft" />
      </div>
    </div>
  );
}

function QuickViewError({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-error-bg text-error">
        <Icon name="alert" size={26} strokeWidth={1.9} />
      </span>
      <p className="font-display text-[17px] font-bold text-ink">
        This product isn&apos;t available.
      </p>
      <p className="max-w-[320px] font-sans text-sm text-muted">
        It may be out of stock or no longer listed. Please try another product.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-1 flex h-10 items-center rounded-xl border border-line bg-surface px-5 font-sans text-sm font-semibold text-ink-soft hover:bg-field"
      >
        Close
      </button>
    </div>
  );
}
