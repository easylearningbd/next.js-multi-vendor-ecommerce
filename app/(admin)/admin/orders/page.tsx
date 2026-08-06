import type { Metadata } from "next";
import { requireRole } from "@/lib/guard";
import { AdminOrderList } from "@/components/admin-orders/AdminOrderList";

export const metadata: Metadata = { title: "Orders — Covet Admin" };
export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// One route drives all 9 views (All + each status) via ?status. Admin-guarded.
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("ADMIN", "/admin/login");

  const sp = await searchParams;
  const statusSlug = one(sp.status);
  const search = one(sp.search)?.trim() || undefined;
  const page = Math.max(1, Number(one(sp.page)) || 1);

  return <AdminOrderList statusSlug={statusSlug} search={search} page={page} />;
}
