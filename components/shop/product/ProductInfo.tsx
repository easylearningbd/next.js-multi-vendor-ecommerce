import { Icon } from "@/components/dashboard/Icon";
import type { ProductDetail } from "@/lib/shop/queries";

/**
 * Product info column (server): seller line, title, rating summary, and price.
 * Rating shows an honest "No reviews yet" (no Review model). The interactive
 * purchase panel (variations, quantity, add-to-cart) lands in Part 3 — its mount
 * point is marked below.
 */
export function ProductInfo({ product }: { product: ProductDetail }) {
  const filledStars = Math.round(product.rating ?? 0);

  return (
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
        <span className="h-3.5 w-px bg-line" />
        {product.brand && (
          <>
            <span>
              Brand{" "}
              <span className="font-semibold text-ink">{product.brand.name}</span>
            </span>
            <span className="h-3.5 w-px bg-line" />
          </>
        )}
        <span className={product.inStock ? "font-semibold text-success" : "font-semibold text-error"}>
          {product.inStock ? "In stock" : "Out of stock"}
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

      <div className="mt-5 flex items-baseline gap-3">
        {product.compareAt && (
          <span className="font-sans text-[17px] text-muted-soft line-through">
            {product.compareAt}
          </span>
        )}
        <span className="font-display text-[34px] font-extrabold leading-none text-iris-500">
          {product.price}
        </span>
        {product.discountPercent != null && (
          <span className="rounded-full bg-iris-100 px-2.5 py-1 font-sans text-[12px] font-semibold text-iris-700">
            −{product.discountPercent}%
          </span>
        )}
      </div>

      {/* TODO(part3): interactive purchase panel — variation selectors, quantity
          stepper, live total, Add to cart (chosen variation) + Buy now — mounts here. */}
      <div className="mt-6 rounded-xl border border-dashed border-line bg-bg-subtle px-5 py-6 font-sans text-[13.5px] text-muted">
        Variation options, quantity, and add-to-cart arrive in the next step.
      </div>
    </div>
  );
}
