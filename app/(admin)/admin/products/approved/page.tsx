import type { Metadata } from "next";
import { AdminProductsPage } from "@/components/admin-products/AdminProductsPage";

export const metadata: Metadata = { title: "Approved Products — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ApprovedProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return <AdminProductsPage filter="APPROVED" searchParams={searchParams} />;
}
