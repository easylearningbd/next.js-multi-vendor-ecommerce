import type { Metadata } from "next";
import { AdminProductsPage } from "@/components/admin-products/AdminProductsPage";

export const metadata: Metadata = { title: "Pending Products — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function PendingProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return <AdminProductsPage filter="PENDING" searchParams={searchParams} />;
}
