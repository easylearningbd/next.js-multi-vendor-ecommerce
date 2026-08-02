"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import { useCart, toCartItem } from "@/components/shop/cart/CartProvider";
import type { ProductDetail, DetailVariation } from "@/lib/shop/queries";
import { ProductDetailGallery } from "@/components/shop/product/ProductDetailGallery";

type OptionGroup = { key: string; values: string[] };

/** Distinct attribute keys → their ordered unique values (Color, Size, …). */
function buildOptionGroups(variations: DetailVariation[]): OptionGroup[] {
  const groups = new Map<string, string[]>();
  for (const v of variations) {
    for (const [key, val] of Object.entries(v.attributes)) {
      const list = groups.get(key) ?? [];
      if (!list.includes(val)) list.push(val);
      groups.set(key, list);
    }
  }
  return [...groups.entries()].map(([key, values]) => ({ key, values }));
}

/** The variation matching every currently-selected option, or null. */
function findMatch(
  variations: DetailVariation[],
  selected: Record<string, string>,
  groups: OptionGroup[],
): DetailVariation | null {
  if (!groups.every((g) => selected[g.key])) return null;
  return (
    variations.find((v) =>
      groups.every((g) => v.attributes[g.key] === selected[g.key]),
    ) ?? null
  );
}

/**
 * Interactive product card (gallery + purchase panel) for the detail page.
 * Selecting variation options updates the price, stock status, quantity limit,
 * and gallery image; Add to Cart pushes the chosen variation (id + label + its
 * own price) into the shared cart store. All money math is integer cents.
 */
export function ProductBuyBox({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { addItem } = useCart();

  const optionGroups = useMemo(
    () => buildOptionGroups(product.variations),
    [product.variations],
  );
  const hasVariations = product.variations.length > 0;

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(
    product.gallery[0] ?? null,
  );

  const matched = hasVariations
    ? findMatch(product.variations, selected, optionGroups)
    : null;
  const allSelected = hasVariations
    ? optionGroups.every((g) => selected[g.key])
    : true;

  // Effective (reactive) pricing + stock.
  const unitCents = matched ? matched.priceCents : product.priceCents;
  const unitPriceText = matched ? matched.price : product.price;
  const stock = hasVariations
    ? matched
      ? matched.stock
      : null // unknown until a full combination is chosen
    : product.stock;
  const inStock =
    hasVariations
      ? allSelected
        ? (matched?.stock ?? 0) > 0
        : product.inStock
      : product.stock > 0;

  const maxQty = stock && stock > 0 ? stock : 99;
  const clampedQty = Math.min(qty, maxQty);
  const totalText = formatCents(unitCents * clampedQty);

  const canPurchase = hasVariations
    ? matched != null && matched.stock > 0
    : product.stock > 0;

  const addLabel = added
    ? "Added to cart"
    : hasVariations && !allSelected
      ? "Select options"
      : !canPurchase
        ? "Out of stock"
        : "Add to cart";

  function selectOption(key: string, value: string) {
    const next = { ...selected, [key]: value };
    setSelected(next);
    setQty(1);
    setAdded(false);
    const m = findMatch(product.variations, next, optionGroups);
    if (m?.image) setActiveImage(m.image);
  }

  function buildCartLine() {
    const variantLabel =
      matched && optionGroups.length > 0
        ? optionGroups.map((g) => `${g.key}: ${selected[g.key]}`).join(" · ")
        : null;
    return toCartItem(product, {
      variationId: matched?.id ?? null,
      variantLabel,
      priceCents: unitCents,
      image: matched?.image ?? product.thumbnail,
    });
  }

  function addToCart() {
    if (!canPurchase) return;
    addItem(buildCartLine(), clampedQty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  function buyNow() {
    if (!canPurchase) return;
    addItem(buildCartLine(), clampedQty);
    // Buy now → checkout (link only until the checkout flow is built).
    router.push("/checkout");
  }

  const filledStars = Math.round(product.rating ?? 0);

  return (
    <div className="grid grid-cols-1 gap-9 rounded-[20px] border border-line-soft bg-surface p-7 shadow-[0_1px_2px_rgba(20,18,31,0.05)] md:grid-cols-[400px_1fr]">
      <ProductDetailGallery
        images={product.gallery}
        activeImage={activeImage}
        onSelectImage={setActiveImage}
        productName={product.name}
        discountPercent={matched ? null : product.discountPercent}
      />

      <div>
        <div className="mb-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-iris-500">
          Sold by {product.seller.storeName}
        </div>
        <h1 className="m-0 mb-3.5 font-display text-[28px] font-bold leading-[1.2] tracking-[-0.01em] text-ink">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-line-soft pb-[18px] font-sans text-[13.5px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={15}
                  className={i < filledStars ? "text-star" : "text-line"}
                />
              ))}
            </span>
            <span className="font-medium text-muted">No reviews yet</span>
          </span>
          {product.brand && (
            <>
              <span className="h-3.5 w-px bg-line" />
              <span>
                Brand{" "}
                <span className="font-semibold text-ink">{product.brand.name}</span>
              </span>
            </>
          )}
          <span className="h-3.5 w-px bg-line" />
          <span className={inStock ? "font-semibold text-success" : "font-semibold text-error"}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
          {product.sku && (
            <>
              <span className="h-3.5 w-px bg-line" />
              <span>
                SKU <span className="font-semibold text-ink">{product.sku}</span>
              </span>
            </>
          )}
        </div>

        {/* Price (reactive to the selected variation) */}
        <div className="mt-5 flex items-baseline gap-3">
          {!matched && product.compareAt && (
            <span className="font-sans text-[17px] text-muted-soft line-through">
              {product.compareAt}
            </span>
          )}
          <span className="font-display text-[34px] font-extrabold leading-none text-iris-500">
            {unitPriceText}
          </span>
          {!matched && product.discountPercent != null && (
            <span className="rounded-full bg-iris-100 px-2.5 py-1 font-sans text-[12px] font-semibold text-iris-700">
              −{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Variation selectors */}
        {optionGroups.map((group) => (
          <div key={group.key} className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="min-w-[52px] font-sans text-sm font-medium text-ink-soft">
              {group.key}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {group.values.map((value) => {
                const active = selected[group.key] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectOption(group.key, value)}
                    aria-pressed={active}
                    className={`h-9 rounded-[10px] border px-3.5 font-sans text-[13px] font-medium transition-colors ${
                      active
                        ? "border-iris-500 bg-iris-50 text-iris-700"
                        : "border-line bg-surface text-ink-soft hover:border-iris-200"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {hasVariations && !allSelected && (
          <p className="mt-3 font-sans text-[12.5px] text-muted">
            Select {optionGroups.map((g) => g.key).join(" and ")} to continue.
          </p>
        )}
        {hasVariations && allSelected && !matched && (
          <p className="mt-3 font-sans text-[12.5px] text-error">
            This combination isn&apos;t available.
          </p>
        )}

        {/* Quantity */}
        <div className="mt-5 flex items-center gap-4">
          <span className="min-w-[52px] font-sans text-sm font-medium text-ink-soft">
            Qty
          </span>
          <div className="flex items-center overflow-hidden rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={clampedQty <= 1}
              aria-label="Decrease quantity"
              className="flex h-[46px] w-11 items-center justify-center text-muted transition-colors hover:bg-field disabled:opacity-40"
            >
              <Icon name="chevronDown" size={16} strokeWidth={2.2} className="rotate-90" />
            </button>
            <span className="w-14 border-x border-line-soft text-center font-display text-[15px] font-bold leading-[46px] text-ink">
              {clampedQty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={clampedQty >= maxQty}
              aria-label="Increase quantity"
              className="flex h-[46px] w-11 items-center justify-center text-iris-500 transition-colors hover:bg-iris-50 disabled:opacity-40"
            >
              <Icon name="plus" size={16} strokeWidth={2.2} />
            </button>
          </div>
          {stock != null && stock > 0 && stock <= 10 && (
            <span className="font-sans text-[12.5px] text-warning">
              Only {stock} left
            </span>
          )}
        </div>

        <div className="mt-5 font-sans text-[15px] text-ink-soft">
          Total Price :
          <span className="ml-1.5 font-display text-[22px] font-extrabold text-iris-500">
            {totalText}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={buyNow}
            disabled={!canPurchase}
            className="flex h-[52px] items-center rounded-xl bg-iris-500 px-8 font-display text-sm font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy now
          </button>
          <button
            type="button"
            onClick={addToCart}
            disabled={!canPurchase}
            className={`flex h-[52px] items-center gap-2 rounded-xl px-7 font-display text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
              added ? "bg-success" : "bg-ink hover:opacity-90"
            }`}
          >
            <Icon name={added ? "check" : "cart"} size={17} strokeWidth={2} />
            {addLabel}
          </button>
          <button
            type="button"
            onClick={() => setWished((w) => !w)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="flex h-[52px] items-center gap-2 rounded-xl border border-line bg-surface px-[18px] font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:border-error/40"
          >
            <Icon
              name={wished ? "heart" : "heartLine"}
              size={19}
              strokeWidth={2}
              className={wished ? "text-error" : "text-muted"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
