import type { Metadata } from "next";
import { AdminProductsPage } from "@/components/admin-products/AdminProductsPage";

export const metadata: Metadata = { title: "Denied Products — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// The route is /denied; the stored enum value is REJECTED (shown as "Denied" in the UI).
export default function DeniedProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return <AdminProductsPage filter="REJECTED" searchParams={searchParams} />;
}
