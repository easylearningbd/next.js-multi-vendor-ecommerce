import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { VendorSummary } from "@/lib/shop/queries";

/**
 * Seller card for the product detail sidebar: store logo, name, honest rating,
 * product count, and a "Visit Store" link (→ /sellers/[slug], link only until
 * the store page is built). Review count is 0 until a Review model exists.
 */
export function VendorCard({ vendor }: { vendor: VendorSummary }) {
  return (
    <div className="rounded-[18px] border border-line-soft bg-surface p-[22px] shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <div className="mb-4 flex items-center gap-3.5">
        <div className="flex size-[52px] flex-none items-center justify-center overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,var(--color-iris-500),var(--color-iris-700))] text-white">
          {vendor.logo ? (
            <img src={vendor.logo} alt={vendor.storeName} className="h-full w-full object-cover" />
          ) : (
            <Icon name="store" size={24} strokeWidth={1.9} />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-base font-bold leading-tight text-ink">
            {vendor.storeName}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={12} className="text-line" />
              ))}
            </span>
            <span className="font-sans text-[11.5px] text-muted">No ratings yet</span>
          </div>
        </div>
      </div>

      <div className="mb-[18px] flex gap-3">
        <div className="flex-1 rounded-xl bg-field py-3.5 text-center">
          <div className="font-display text-[18px] font-extrabold text-ink">
            {vendor.productCount}
          </div>
          <div className="mt-1.5 font-sans text-[11px] text-muted">Products</div>
        </div>
        <div className="flex-1 rounded-xl bg-field py-3.5 text-center">
          <div className="font-display text-[18px] font-extrabold text-ink">0</div>
          <div className="mt-1.5 font-sans text-[11px] text-muted">Reviews</div>
        </div>
      </div>

      <Link
        href={`/sellers/${vendor.slug}`}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-iris-500 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-iris-600"
      >
        <Icon name="store" size={18} strokeWidth={2} />
        Visit Store
      </Link>
    </div>
  );
}
