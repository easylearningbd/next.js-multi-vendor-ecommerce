import type { Metadata } from "next";
import { SubCategoriesManager } from "@/components/categories/SubCategoriesManager";
import { getSubCategories, getCategoryOptions } from "../actions";

export const metadata: Metadata = { title: "Sub-Categories — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function SubCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = one(sp.search)?.trim() ?? "";
  const categoryId = one(sp.categoryId) ?? "";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pageSizeRaw = Number(one(sp.pageSize)) || 10;
  const pageSize = [10, 20, 50].includes(pageSizeRaw) ? pageSizeRaw : 10;

  const [res, optsRes] = await Promise.all([
    getSubCategories({ search, categoryId: categoryId || undefined, page, pageSize }),
    getCategoryOptions(),
  ]);
  const data = res.success ? res.data : undefined;
  const categoryOptions = optsRes.success ? optsRes.data ?? [] : [];

  return (
    <SubCategoriesManager
      subCategories={data?.items ?? []}
      categoryOptions={categoryOptions}
      total={data?.total ?? 0}
      page={data?.page ?? page}
      pageSize={data?.pageSize ?? pageSize}
      totalPages={data?.totalPages ?? 1}
      hasFilters={Boolean(search) || Boolean(categoryId)}
      errored={!res.success}
    />
  );
}
