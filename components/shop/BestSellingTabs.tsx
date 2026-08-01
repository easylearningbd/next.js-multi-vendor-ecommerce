"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";
import type { StorefrontProduct } from "@/lib/shop/queries";

const TABS = [
  { key: "best", label: "Best Selling" },
  { key: "rated", label: "Top Rated" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Best Selling / Top Rated tabbed switcher. Both lists come pre-fetched from the server. */
export function BestSellingTabs({
  bestSelling,
  topRated,
}: {
  bestSelling: StorefrontProduct[];
  topRated: StorefrontProduct[];
}) {
  const [tab, setTab] = useState<TabKey>("best");
  const products = tab === "best" ? bestSelling : topRated;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`h-10 rounded-[10px] px-5 font-sans text-[13.5px] font-semibold transition-colors ${
              tab === t.key
                ? "bg-iris-500 text-white"
                : "border border-line bg-surface text-ink-soft hover:border-iris-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <Link
          href="/best-selling"
          className="ml-auto flex items-center gap-1.5 font-sans text-[13.5px] font-semibold text-iris-500 hover:text-iris-600"
        >
          View all
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </Link>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState message="Nothing to show here yet." />
      )}
    </>
  );
}
