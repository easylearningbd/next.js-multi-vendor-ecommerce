"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { CategoryNode } from "@/lib/shop/queries";

/**
 * Home hero category menu. A vertical rail of the real top-level categories sits
 * left of the hero banner (passed as `children`). Hovering a category slides a
 * mega-panel over the banner showing that category's sub-categories (group
 * titles) and their sub-sub-categories (items) — the real 3-level DB tree.
 *
 * Every level links to its listing route (/category/[...slug]):
 *   category → /category/[slug]
 *   sub      → /category/[slug]/[subSlug]
 *   sub-sub  → /category/[slug]/[subSlug]/[subSubSlug]
 *
 * The rail is text-only, matching the design (no category image is used here).
 */
export function HeroCategoryMenu({
  categories,
  children,
}: {
  categories: CategoryNode[];
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = categories.find((c) => c.id === activeId) ?? null;

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-8">
      <div
        className="relative grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]"
        onMouseLeave={() => setActiveId(null)}
      >
        {/* Category rail */}
        <aside className="hidden rounded-[18px] border border-line-soft bg-surface p-2.5 shadow-[0_1px_2px_rgba(20,18,31,0.05)] lg:block">
          {categories.length === 0 ? (
            <div className="px-3.5 py-3 font-sans text-[13px] text-muted">
              No categories yet.
            </div>
          ) : (
            categories.map((c) => {
              const isActive = c.id === active?.id;
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  onMouseEnter={() => setActiveId(c.id)}
                  className={`flex items-center justify-between rounded-[10px] px-3.5 py-2.75 font-sans text-[13.5px] transition-colors ${
                    isActive
                      ? "bg-iris-50 font-semibold text-iris-500"
                      : "font-medium text-ink-soft hover:bg-field"
                  }`}
                >
                  <span>{c.name}</span>
                  <Icon
                    name="chevronRight"
                    size={15}
                    strokeWidth={2}
                    className={isActive ? "text-iris-500" : "text-muted-soft"}
                  />
                </Link>
              );
            })
          )}
        </aside>

        {/* Mega-panel — overlays the banner on hover */}
        <div
          className={`absolute left-[274px] right-0 top-0 z-30 hidden min-h-full overflow-y-auto rounded-[18px] border border-line-soft bg-surface px-[34px] py-[30px] shadow-[0_26px_64px_-16px_rgba(20,18,31,0.26)] transition-[opacity,transform] duration-150 lg:block ${
            active
              ? "visible translate-x-0 opacity-100"
              : "pointer-events-none invisible -translate-x-1.5 opacity-0"
          }`}
        >
          {active &&
            (active.children.length > 0 ? (
              <div className="flex flex-wrap items-start gap-x-[46px] gap-y-[26px]">
                {active.children.map((sub) => (
                  <div key={sub.id} className="min-w-[158px]">
                    <Link
                      href={`/category/${active.slug}/${sub.slug}`}
                      className="mb-4 block font-display text-[15px] font-bold text-ink hover:text-iris-500"
                    >
                      {sub.name}
                    </Link>
                    <div className="flex flex-col gap-3">
                      {sub.children.length > 0 ? (
                        sub.children.map((item) => (
                          <Link
                            key={item.id}
                            href={`/category/${active.slug}/${sub.slug}/${item.slug}`}
                            className="font-sans text-[13.5px] text-muted hover:text-iris-500"
                          >
                            {item.name}
                          </Link>
                        ))
                      ) : (
                        <Link
                          href={`/category/${active.slug}/${sub.slug}`}
                          className="font-sans text-[13.5px] text-muted hover:text-iris-500"
                        >
                          View all
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[120px] items-center justify-center font-sans text-[13.5px] text-muted">
                No sub-categories in {active.name} yet.
              </div>
            ))}
        </div>

        {/* Hero banner slot (real promo content lands in Part 4) */}
        {children}
      </div>
    </section>
  );
}
