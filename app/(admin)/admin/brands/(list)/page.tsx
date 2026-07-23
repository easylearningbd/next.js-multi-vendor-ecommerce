import type { Metadata } from "next";
import { auth } from "@/auth";
import { SellerShell } from "@/components/dashboard/SellerShell";
import { adminNav } from "@/components/dashboard/navConfig";
import { BrandsManager } from "@/components/brands/BrandsManager";
import { getBrands } from "../actions";

export const metadata: Metadata = { title: "Brands — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function BrandsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await auth();
  const user = session!.user;

  const search = one(sp.search)?.trim() ?? "";
  const statusRaw = one(sp.status);
  const status: "ALL" | "ACTIVE" | "INACTIVE" =
    statusRaw === "ACTIVE" || statusRaw === "INACTIVE" ? statusRaw : "ALL";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pageSizeRaw = Number(one(sp.pageSize)) || 10;
  const pageSize = [10, 20, 50].includes(pageSizeRaw) ? pageSizeRaw : 10;

  const res = await getBrands({ search, status, page, pageSize });
  const data = res.success ? res.data : undefined;

  return (
    <SellerShell
      variant="admin"
      userName={user.name ?? "Admin"}
      userEmail={user.email ?? ""}
      signOutTo="/admin/login"
      setupPercent={38}
      showSearch
      notifCount={12}
      breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Brands" }]}
      nav={adminNav}
      showRail={false}
    >
      <BrandsManager
        brands={data?.brands ?? []}
        total={data?.total ?? 0}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalPages={data?.totalPages ?? 1}
        hasFilters={Boolean(search) || status !== "ALL"}
        errored={!res.success}
      />
    </SellerShell>
  );
}
