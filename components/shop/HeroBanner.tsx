import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

/**
 * Home hero promo banner (static). Sits to the right of the hero category rail;
 * the category mega-panel overlays it on hover. No product data — this is the
 * marketing surface from the design.
 */
export function HeroBanner() {
  return (
    <div className="relative flex min-h-[380px] overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,var(--color-iris-900)_0%,var(--color-iris-700)_45%,var(--color-iris-500)_100%)]">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-10 -top-20 size-[360px] rounded-full bg-white/[0.06]" />
      <div className="pointer-events-none absolute -bottom-28 right-28 size-[280px] rounded-full bg-white/[0.05]" />

      {/* Copy */}
      <div className="relative z-[2] flex max-w-[56%] flex-col justify-center p-14">
        <span className="mb-[22px] inline-flex items-center gap-1.5 self-start rounded-full bg-white/[0.14] px-3.5 py-2 font-sans text-[12px] font-semibold tracking-[0.04em] text-white">
          New season arrivals
        </span>
        <h1 className="m-0 mb-[18px] font-display text-[46px] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
          Everything you love, from sellers you trust.
        </h1>
        <p className="m-0 mb-[30px] max-w-[400px] font-sans text-base leading-[1.55] text-white/80">
          One storefront, one checkout, and a marketplace of independent makers
          and brands. Discover today&apos;s best.
        </p>
        <div className="flex gap-3">
          <Link
            href="/new-arrivals"
            className="flex h-[50px] items-center gap-2.5 rounded-xl bg-white px-[26px] font-display text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
          >
            Shop new arrivals
            <Icon name="chevronRight" size={17} strokeWidth={2.2} />
          </Link>
          <Link
            href="/offers"
            className="flex h-[50px] items-center rounded-xl border border-white/35 px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
          >
            Explore deals
          </Link>
        </div>
        <div className="mt-[38px] flex gap-2">
          <span className="h-[5px] w-[26px] rounded-[3px] bg-white" />
          <span className="h-[5px] w-[9px] rounded-[3px] bg-white/40" />
          <span className="h-[5px] w-[9px] rounded-[3px] bg-white/40" />
        </div>
      </div>

      {/* Decorative panel (no product/lifestyle asset available) */}
      <div className="relative z-[2] hidden flex-1 items-center justify-center p-8 lg:flex">
        <div className="flex h-[280px] w-full items-center justify-center rounded-2xl border border-white/20 bg-white/[0.08] text-white/25">
          <Icon name="bag" size={72} strokeWidth={1.25} />
        </div>
      </div>
    </div>
  );
}
