import type { Metadata } from "next";
import { SubSubCategoriesManager } from "@/components/categories/SubSubCategoriesManager";
import { getSubSubCategories, getCategoryOptions } from "../actions";

export const metadata: Metadata = { title: "Sub-Sub-Categories — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function SubSubCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = one(sp.search)?.trim() ?? "";
  const categoryId = one(sp.categoryId) ?? "";
  const subCategoryId = one(sp.subCategoryId) ?? "";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pageSizeRaw = Number(one(sp.pageSize)) || 10;
  const pageSize = [10, 20, 50].includes(pageSizeRaw) ? pageSizeRaw : 10;

  const [res, optsRes] = await Promise.all([
    getSubSubCategories({
      search,
      categoryId: categoryId || undefined,
      subCategoryId: subCategoryId || undefined,
      page,
      pageSize,
    }),
    getCategoryOptions(),
  ]);
  const data = res.success ? res.data : undefined;
  const categoryOptions = optsRes.success ? optsRes.data ?? [] : [];

  return (
    <SubSubCategoriesManager
      subSubCategories={data?.items ?? []}
      categoryOptions={categoryOptions}
      total={data?.total ?? 0}
      page={data?.page ?? page}
      pageSize={data?.pageSize ?? pageSize}
      totalPages={data?.totalPages ?? 1}
      hasFilters={Boolean(search) || Boolean(categoryId) || Boolean(subCategoryId)}
      errored={!res.success}
    />
  );
}
