import type { Metadata } from "next";
import { CategoriesManager } from "@/components/categories/CategoriesManager";
import { getCategories } from "../actions";

export const metadata: Metadata = { title: "Categories — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = one(sp.search)?.trim() ?? "";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pageSizeRaw = Number(one(sp.pageSize)) || 10;
  const pageSize = [10, 20, 50].includes(pageSizeRaw) ? pageSizeRaw : 10;

  const res = await getCategories({ search, page, pageSize });
  const data = res.success ? res.data : undefined;

  return (
    <CategoriesManager
      categories={data?.items ?? []}
      total={data?.total ?? 0}
      page={data?.page ?? page}
      pageSize={data?.pageSize ?? pageSize}
      totalPages={data?.totalPages ?? 1}
      hasFilters={Boolean(search)}
      errored={!res.success}
    />
  );
}
