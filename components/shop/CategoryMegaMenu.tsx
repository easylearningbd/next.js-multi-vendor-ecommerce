"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { CategoryNode } from "@/lib/shop/queries";

/**
 * The "All Categories" mega-menu in the nav bar. Hover the black trigger to open
 * a two-pane panel: a scrollable list of top-level categories on the left, and
 * the hovered category's sub-categories (with their sub-sub-categories) grouped
 * on the right — the real 3-level DB tree.
 *
 * Every level links to its listing route (/category/[...slug]):
 *   category  → /category/[slug]
 *   sub       → /category/[slug]/[subSlug]
 *   sub-sub   → /category/[slug]/[subSlug]/[subSubSlug]
 */
export function CategoryMegaMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(
    categories[0]?.id ?? null,
  );

  const active =
    categories.find((c) => c.id === activeId) ?? categories[0] ?? null;

  return (
    // Padding-bridge wrapper: padding (not margin) keeps the pointer inside the
    // hover region so the panel does not close while moving toward it.
    <div
      className="relative pb-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex h-[38px] items-center gap-2.5 rounded-[10px] bg-ink px-[18px] font-sans text-[13.5px] font-semibold text-white"
      >
        <Icon name="grid" size={17} strokeWidth={2} />
        All Categories
        <Icon name="chevronDown" size={15} strokeWidth={2} />
      </button>

      {open && categories.length > 0 && (
        <div className="absolute left-0 top-full z-50 w-[720px] overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-[0_26px_64px_-16px_rgba(20,18,31,0.30)]">
          <div className="grid grid-cols-[240px_1fr]">
            {/* Left: top-level categories */}
            <div className="max-h-[420px] overflow-y-auto border-r border-line-soft bg-bg-subtle p-3">
              {categories.map((c) => {
                const isActive = c.id === active?.id;
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    onMouseEnter={() => setActiveId(c.id)}
                    className={`flex items-center justify-between rounded-[10px] px-3 py-2.5 font-sans text-[13px] transition-colors ${
                      isActive
                        ? "bg-iris-50 font-medium text-iris-500"
                        : "text-ink-soft hover:bg-field"
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
              })}
            </div>

            {/* Right: sub-categories + sub-sub-categories of the active category */}
            <div className="max-h-[420px] overflow-y-auto p-7">
              {active && active.children.length > 0 ? (
                <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
                  {active.children.map((sub) => (
                    <div key={sub.id} className="min-w-[130px]">
                      <Link
                        href={`/category/${active.slug}/${sub.slug}`}
                        className="mb-3.5 block font-display text-sm font-bold text-ink hover:text-iris-500"
                      >
                        {sub.name}
                      </Link>
                      <div className="flex flex-col gap-[11px]">
                        {sub.children.length > 0 ? (
                          sub.children.map((item) => (
                            <Link
                              key={item.id}
                              href={`/category/${active.slug}/${sub.slug}/${item.slug}`}
                              className="font-sans text-[13px] text-muted hover:text-iris-500"
                            >
                              {item.name}
                            </Link>
                          ))
                        ) : (
                          <Link
                            href={`/category/${active.slug}/${sub.slug}`}
                            className="font-sans text-[13px] text-muted hover:text-iris-500"
                          >
                            View all
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center font-sans text-[13px] text-muted">
                  {active ? "No sub-categories yet." : "No categories to show."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
