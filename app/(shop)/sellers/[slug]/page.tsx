import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getVendorStore,
  getVendorStoreFacets,
  type ProductSort,
} from "@/lib/shop/queries";
import { StoreBanner } from "@/components/shop/sellers/StoreBanner";
import { StoreToolbar } from "@/components/shop/sellers/StoreToolbar";
import { StoreFilterSidebar } from "@/components/shop/sellers/StoreFilterSidebar";
import {
  StoreProducts,
  StoreProductsSkeleton,
} from "@/components/shop/sellers/StoreProducts";

// Real 404 for unknown / non-approved stores (see the product page for why).
export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const VALID_SORTS: ProductSort[] = ["newest", "price-asc", "price-desc", "name"];

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getVendorStore(slug);
  if (!store) notFound();
  return {
    title: `${store.storeName} — Covet`,
    description: `Shop ${store.productCount} products from ${store.storeName} on Covet.`,
  };
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const store = await getVendorStore(slug);
  if (!store) notFound();

  const facets = await getVendorStoreFacets(store.id);

  const sp = await searchParams;
  const search = first(sp.search).trim();
  const sortRaw = first(sp.sort) as ProductSort;
  const sort: ProductSort = VALID_SORTS.includes(sortRaw) ? sortRaw : "newest";
  const category = first(sp.category);
  const brand = first(sp.brand);
  const page = Math.max(1, Number.parseInt(first(sp.page), 10) || 1);

  return (
    <div className="pb-20">
      <StoreBanner store={store} />

      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-[22px]">
        <StoreToolbar search={search} sort={sort} />
      </div>

      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-start gap-6 px-[var(--cpad)] pt-[22px] lg:grid-cols-[280px_1fr]">
        <StoreFilterSidebar
          slug={slug}
          facets={facets}
          active={{ search, sort, category, brand }}
        />

        <div>
          <Suspense
            key={`${search}|${sort}|${category}|${brand}|${page}`}
            fallback={<StoreProductsSkeleton />}
          >
            <StoreProducts
              vendorId={store.id}
              slug={slug}
              search={search}
              sort={sort}
              category={category}
              brand={brand}
              page={page}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
