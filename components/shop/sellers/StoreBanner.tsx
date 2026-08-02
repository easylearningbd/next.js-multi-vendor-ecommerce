import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { StoreProfile } from "@/lib/shop/queries";

/**
 * Store banner (cover image + gradient fallback) with the seller identity card
 * overlapping it: logo (initial fallback), store name, honest rating, product
 * count, and join date. "Ask AI Support" is a link placeholder — no AI chat.
 */
export function StoreBanner({ store }: { store: StoreProfile }) {
  const initial = store.storeName.trim().charAt(0).toUpperCase() || "?";
  const joinYear = store.joinedAt.slice(0, 4);

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-7">
      {/* Banner */}
      <div className="relative flex min-h-[280px] items-center overflow-hidden rounded-[20px] bg-[linear-gradient(120deg,var(--color-iris-800),var(--color-iris-500))]">
        {store.coverImage && (
          <img
            src={store.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Legibility overlay for the title over any cover image */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/25 to-transparent" />
        <div className="relative z-[2] px-[8%]">
          <h1 className="m-0 max-w-[440px] font-display text-[44px] font-extrabold leading-[1.1] tracking-[-0.01em] text-white">
            {store.storeName}
          </h1>
        </div>
      </div>

      {/* Identity card */}
      <div className="relative z-[3] -mt-10 ml-5 inline-flex flex-wrap items-center gap-[18px] rounded-[18px] border border-line-soft bg-surface py-[18px] pl-[18px] pr-6 shadow-[0_18px_44px_-18px_rgba(20,18,31,0.28)]">
        <div className="flex size-[72px] flex-none items-center justify-center overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))]">
          {store.logo ? (
            <img src={store.logo} alt={store.storeName} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-[30px] font-extrabold text-iris-500">
              {initial}
            </span>
          )}
        </div>

        <div>
          <div className="mb-2 font-display text-[19px] font-bold leading-none text-ink">
            {store.storeName}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-sans text-[13px] text-muted">
            <span className="flex items-center gap-1">
              <Icon
                name="star"
                size={14}
                className={store.rating != null ? "text-star" : "text-line"}
              />
              {store.rating != null ? (
                <span className="font-semibold text-ink">{store.rating.toFixed(1)}</span>
              ) : (
                "No ratings yet"
              )}
            </span>
            <span className="h-3 w-px bg-line" />
            <span>
              <span className="font-semibold text-ink">{store.productCount}</span>{" "}
              {store.productCount === 1 ? "Product" : "Products"}
            </span>
            <span className="h-3 w-px bg-line" />
            <span>Member since {joinYear}</span>
          </div>
        </div>

        <Link
          href="/help"
          className="ml-3.5 flex h-11 items-center gap-2 rounded-[11px] bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="chat" size={17} strokeWidth={2} />
          Ask AI Support
        </Link>
      </div>
    </div>
  );
}
