import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { resolveCategoryPath, type CategorySort } from "@/lib/shop/queries";
import { CategoryBreadcrumb } from "@/components/shop/category/CategoryBreadcrumb";
import {
  CategoryResults,
  CategoryProductsSkeleton,
  type CategoryQuery,
} from "@/components/shop/category/CategoryResults";

// Real 404 for unknown / wrongly-nested category paths.
export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string[] }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const VALID_SORTS: CategorySort[] = ["newest", "price-asc", "price-desc", "rating"];

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function parseNum(v: string): number | undefined {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const node = await resolveCategoryPath(slug);
  if (!node) notFound();
  return {
    title: `${node.name} — Covet`,
    description: `Shop ${node.name} products on the Covet marketplace.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const node = await resolveCategoryPath(slug);
  if (!node) notFound();

  const sp = await searchParams;
  const sortRaw = first(sp.sort) as CategorySort;
  const query: CategoryQuery = {
    search: first(sp.search).trim(),
    min: parseNum(first(sp.min)),
    max: parseNum(first(sp.max)),
    brand: first(sp.brand),
    sort: VALID_SORTS.includes(sortRaw) ? sortRaw : "newest",
    page: Math.max(1, Number.parseInt(first(sp.page), 10) || 1),
  };

  const suspenseKey = JSON.stringify([node.id, query]);

  return (
    <div className="pb-20">
      <CategoryBreadcrumb trail={node.trail} />

      {/* Header */}
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-4">
        <div className="rounded-[18px] border border-line-soft bg-surface px-6 py-5 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
          <h1 className="m-0 font-display text-[24px] font-bold leading-[1.1] tracking-[-0.01em] text-ink">
            {node.name}
          </h1>
          <p className="mt-2 font-sans text-[13px] text-muted">
            Browse products in {node.name}
            {node.children.length > 0 ? " and its sub-categories" : ""}.
          </p>
        </div>
      </div>

      {/* Main: filter sidebar (Part 3) + product grid */}
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-start gap-6 px-[var(--cpad)] pt-6 lg:grid-cols-[296px_1fr]">
        <aside className="rounded-[18px] border border-dashed border-line bg-bg-subtle px-5 py-8 text-center font-sans text-[13px] text-muted lg:sticky lg:top-24">
          Filters (search, price, brand, sub-categories, sort) arrive in Part 3.
        </aside>

        <div>
          <Suspense key={suspenseKey} fallback={<CategoryProductsSkeleton />}>
            <CategoryResults node={node} query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
