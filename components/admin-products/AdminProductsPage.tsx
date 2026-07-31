import type { AdminProductFilter } from "@/lib/admin-product-types";
import { getAdminProducts, getAdminProductCategories } from "@/app/(admin)/admin/products/actions";
import { AdminProductsList } from "./AdminProductsList";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Shared server body for all five admin product list routes — each route page just
// passes its filter. (One reusable list, filtered five ways — not five copies.)
export async function AdminProductsPage({
  filter,
  searchParams,
}: {
  filter: AdminProductFilter;
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = one(sp.search)?.trim() ?? "";
  const categoryId = one(sp.categoryId)?.trim() ?? "";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pageSizeRaw = Number(one(sp.pageSize)) || 10;
  const pageSize = [10, 20, 50].includes(pageSizeRaw) ? pageSizeRaw : 10;

  const [res, catRes] = await Promise.all([
    getAdminProducts(filter, { search, categoryId: categoryId || undefined, page, pageSize }),
    getAdminProductCategories(),
  ]);
  const data = res.success ? res.data : undefined;

  return (
    <AdminProductsList
      filter={filter}
      products={data?.items ?? []}
      total={data?.total ?? 0}
      page={data?.page ?? page}
      pageSize={data?.pageSize ?? pageSize}
      totalPages={data?.totalPages ?? 1}
      hasFilters={Boolean(search) || Boolean(categoryId)}
      errored={!res.success}
      categories={catRes.success ? catRes.data! : []}
    />
  );
}
