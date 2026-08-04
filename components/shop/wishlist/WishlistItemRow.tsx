"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Icon } from "@/components/dashboard/Icon";
import { useCart, toCartItem } from "@/components/shop/cart/CartProvider";
import { useWishlist } from "@/components/shop/wishlist/WishlistProvider";
import { removeFromWishlist } from "@/app/(shop)/dashboard/wishlist/actions";
import type { WishlistEntry } from "@/lib/shop/wishlist";

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={n <= filled ? "text-star" : "text-line"}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function WishlistItemRow({ item }: { item: WishlistEntry }) {
  const { product, available } = item;
  const { addItem } = useCart();
  const { markRemoved } = useWishlist();
  const [removed, setRemoved] = useState(false);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  if (removed) return null;

  const canBuy = available && product.inStock;

  function handleAdd() {
    addItem(toCartItem(product));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  async function handleRemove() {
    setPending(true);
    const res = await removeFromWishlist(product.id);
    if (res.ok) {
      markRemoved(product.id); // reflect on the heart icon elsewhere
      setRemoved(true);
      toast.success("Removed from wishlist");
    } else {
      setPending(false);
      toast.error(res.error);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line-soft bg-surface p-4 transition-shadow hover:shadow-[0_12px_30px_-16px_rgba(20,18,31,0.20)] sm:flex-nowrap sm:gap-[18px] sm:px-5">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex size-[84px] flex-none items-center justify-center overflow-hidden rounded-[14px] bg-field"
      >
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Icon name="image" size={22} strokeWidth={1.6} className="text-muted-soft" />
        )}
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 font-sans text-[15px] font-semibold leading-[1.3] text-ink hover:text-iris-500"
        >
          {product.name}
        </Link>
        <div className="mt-2 font-sans text-[12.5px] text-muted">
          Sold by{" "}
          <Link href={`/sellers/${product.seller.slug}`} className="font-semibold text-iris-500 hover:underline">
            {product.seller.storeName}
          </Link>
          {product.brand && (
            <>
              {" · "}Brand <span className="font-semibold text-ink-soft">{product.brand.name}</span>
            </>
          )}
        </div>
        {available ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            <Stars rating={product.rating ?? 0} />
            <span className="font-sans text-[12px] text-muted-soft">
              {product.reviewCount > 0 ? `(${product.reviewCount})` : "No reviews yet"}
            </span>
          </div>
        ) : (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-warning">
            <Icon name="alert" size={12} strokeWidth={2.2} />
            No longer available
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex-none text-right">
        <div className="font-display text-lg font-extrabold text-ink">{product.price}</div>
        {product.compareAt && (
          <div className="mt-1.5 font-sans text-[12.5px] text-muted-soft line-through">
            {product.compareAt}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-none items-center gap-2.5">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canBuy}
          className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-[11px] px-5 font-sans text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            added
              ? "bg-success-bg text-success"
              : "bg-iris-500 text-white hover:bg-iris-600 disabled:bg-field disabled:text-muted"
          }`}
        >
          <Icon name={added ? "check" : "cart"} size={16} strokeWidth={2} />
          {!available
            ? "Unavailable"
            : !product.inStock
              ? "Out of stock"
              : added
                ? "Added"
                : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          aria-label="Remove from wishlist"
          className="flex size-11 flex-none items-center justify-center rounded-[11px] border border-iris-100 bg-iris-50 text-error transition-colors hover:bg-iris-100 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
