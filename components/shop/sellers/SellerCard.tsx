import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { SellerCard as SellerCardData } from "@/lib/shop/queries";

/**
 * Seller store card for the /sellers list. Handles missing images:
 *  - coverImage missing → a design-system gradient banner
 *  - logo missing → an initial-based avatar (store name first letter)
 * Never renders a broken image. The whole card links to the store page.
 */
export function SellerCard({ seller }: { seller: SellerCardData }) {
  const initial = seller.storeName.trim().charAt(0).toUpperCase() || "?";

  return (
    <Link
      href={`/sellers/${seller.slug}`}
      className="group block overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-[0_1px_2px_rgba(20,18,31,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(20,18,31,0.20)]"
    >
      {/* Cover (with fallback) */}
      <div className="relative h-24 overflow-hidden bg-[linear-gradient(120deg,var(--color-iris-100),var(--color-iris-50))]">
        {seller.coverImage && (
          <img src={seller.coverImage} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="-mt-8 flex items-end gap-3.5">
          {/* Logo (with initial fallback) */}
          <div className="flex size-[66px] flex-none items-center justify-center overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-[0_6px_16px_-6px_rgba(20,18,31,0.2)]">
            {seller.logo ? (
              <img src={seller.logo} alt={seller.storeName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-[26px] font-extrabold text-iris-500">
                {initial}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-0.5">
            <div className="truncate font-display text-base font-bold leading-tight text-ink">
              {seller.storeName}
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-sans text-[12.5px] text-muted">
              <Icon
                name="star"
                size={14}
                className={seller.rating != null ? "text-star" : "text-line"}
              />
              {seller.rating != null ? (
                <span>
                  <span className="font-bold text-ink">{seller.rating.toFixed(1)}</span> Rating
                </span>
              ) : (
                <span>No ratings yet</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-[18px] flex h-11 items-center justify-center gap-1.5 rounded-[11px] bg-field font-sans text-[13.5px] font-semibold text-ink transition-colors group-hover:bg-iris-500 group-hover:text-white">
          <span className="font-display text-sm font-extrabold text-iris-500 group-hover:text-white">
            {seller.productCount}
          </span>
          {seller.productCount === 1 ? "Product" : "Products"}
          <span className="mx-1 opacity-40">·</span>
          Visit Store
        </div>
      </div>
    </Link>
  );
}
