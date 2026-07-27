import type { Metadata } from "next";
import { ProductsListManager } from "@/components/products/ProductsListManager";
import type { ProductStatusFilter } from "@/lib/product-types";
import { getProducts } from "../actions";

export const metadata: Metadata = { title: "Product List — Covet Seller" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProductListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = one(sp.search)?.trim() ?? "";
  const statusRaw = one(sp.status);
  const status: ProductStatusFilter =
    statusRaw === "PENDING" || statusRaw === "APPROVED" || statusRaw === "REJECTED"
      ? statusRaw
      : "ALL";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pageSizeRaw = Number(one(sp.pageSize)) || 10;
  const pageSize = [10, 20, 50].includes(pageSizeRaw) ? pageSizeRaw : 10;

  const res = await getProducts({ status, search, page, pageSize });
  const data = res.success ? res.data : undefined;

  return (
    <ProductsListManager
      products={data?.items ?? []}
      total={data?.total ?? 0}
      page={data?.page ?? page}
      pageSize={data?.pageSize ?? pageSize}
      totalPages={data?.totalPages ?? 1}
      hasFilters={Boolean(search) || status !== "ALL"}
      errored={!res.success}
    />
  );
}
