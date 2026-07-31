import type { Metadata } from "next";
import { CouponsListManager } from "@/components/coupons/CouponsListManager";
import type { CouponStatusFilter } from "@/lib/coupon-types";
import { getCoupons } from "../actions";

export const metadata: Metadata = { title: "Coupon List — Covet Seller" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const STATUSES: CouponStatusFilter[] = ["ACTIVE", "SCHEDULED", "EXPIRED", "INACTIVE"];

export default async function CouponListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = one(sp.search)?.trim() ?? "";
  const statusRaw = one(sp.status) as CouponStatusFilter | undefined;
  const status: CouponStatusFilter = statusRaw && STATUSES.includes(statusRaw) ? statusRaw : "ALL";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const pageSizeRaw = Number(one(sp.pageSize)) || 10;
  const pageSize = [10, 20, 50].includes(pageSizeRaw) ? pageSizeRaw : 10;

  const res = await getCoupons({ status, search, page, pageSize });
  const data = res.success ? res.data : undefined;

  return (
    <CouponsListManager
      coupons={data?.items ?? []}
      total={data?.total ?? 0}
      page={data?.page ?? page}
      pageSize={data?.pageSize ?? pageSize}
      totalPages={data?.totalPages ?? 1}
      hasFilters={Boolean(search) || status !== "ALL"}
      errored={!res.success}
    />
  );
}
