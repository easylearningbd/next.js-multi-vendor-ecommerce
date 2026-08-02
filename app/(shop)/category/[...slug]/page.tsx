import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  resolveCategoryPath,
  getFiltersForCategory,
  type CategorySort,
} from "@/lib/shop/queries";
import { CategoryBreadcrumb } from "@/components/shop/category/CategoryBreadcrumb";
import { CategoryToolbar } from "@/components/shop/category/CategoryToolbar";
import { CategoryFilterChips } from "@/components/shop/category/CategoryFilterChips";
import { CategoryFilterSidebar } from "@/components/shop/category/CategoryFilterSidebar";
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

  const filters = await getFiltersForCategory(node);

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

      {/* Header: title + in-category search + sort */}
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-4">
        <CategoryToolbar name={node.name} search={query.search} sort={query.sort} />
      </div>

      {/* Main: filter sidebar + product grid */}
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-start gap-6 px-[var(--cpad)] pt-6 lg:grid-cols-[296px_1fr]">
        <CategoryFilterSidebar node={node} filters={filters} />

        <div>
          <CategoryFilterChips brands={filters.brands} />
          <Suspense key={suspenseKey} fallback={<CategoryProductsSkeleton />}>
            <CategoryResults node={node} query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
