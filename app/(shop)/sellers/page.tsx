import type { Metadata } from "next";
import { Suspense } from "react";
import type { VendorSort } from "@/lib/shop/queries";
import { StoreSearch } from "@/components/shop/sellers/StoreSearch";
import { StoreSort } from "@/components/shop/sellers/StoreSort";
import { SellerResults } from "@/components/shop/sellers/SellerResults";
import { SellerGridSkeleton } from "@/components/shop/sellers/SellerGridSkeleton";

export const metadata: Metadata = {
  title: "All Stores — Covet",
  description: "Browse every approved seller on the Covet marketplace.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const VALID_SORTS: VendorSort[] = ["featured", "newest", "name", "products"];

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function SellersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = first(sp.search).trim();
  const sortRaw = first(sp.sort) as VendorSort;
  const sort: VendorSort = VALID_SORTS.includes(sortRaw) ? sortRaw : "featured";
  const page = Math.max(1, Number.parseInt(first(sp.page), 10) || 1);

  return (
    <div className="pb-20">
      {/* Hero band */}
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-7">
        <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[20px] border border-iris-100 bg-[linear-gradient(120deg,var(--color-iris-50)_0%,var(--color-bg-subtle)_60%)] px-10 py-9">
          <div className="relative">
            <h1 className="m-0 mb-3 font-display text-[34px] font-extrabold leading-none tracking-[-0.01em] text-iris-700">
              All Stores
            </h1>
            <p className="m-0 font-sans text-[15px] text-muted">
              Find your favourite stores and shop the products you love.
            </p>
          </div>
          <div className="relative w-full max-w-[420px]">
            <StoreSearch initial={search} />
          </div>
        </div>
      </div>

      {/* Toolbar + results */}
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-6">
        <div className="mb-5 flex items-center justify-end">
          <StoreSort value={sort} />
        </div>

        <Suspense
          key={`${search}|${sort}|${page}`}
          fallback={<SellerGridSkeleton />}
        >
          <SellerResults search={search} sort={sort} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
