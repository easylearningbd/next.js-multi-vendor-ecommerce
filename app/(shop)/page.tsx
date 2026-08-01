import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Covet — Multi-vendor marketplace",
};

/**
 * Storefront home. Part 1 ships the shared shell (header + footer) only — this
 * page is a placeholder. The real home sections (hero, flash deals, featured,
 * shop-by-category, top sellers, brand rails, …) land in Parts 4 and 5, fed by
 * the data layer in Part 3.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] py-20">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface px-8 py-24 text-center">
        <span className="mb-5 rounded-full bg-iris-50 px-4 py-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-iris-700">
          Storefront shell
        </span>
        <h1 className="max-w-[640px] font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink">
          Home sections arrive next.
        </h1>
        <p className="mt-4 max-w-[460px] font-sans text-[15px] leading-relaxed text-muted">
          The shared header and footer are live. The hero, flash deals, featured
          products, category rails, and top sellers are built in the following
          parts with real data.
        </p>
      </div>
    </div>
  );
}
