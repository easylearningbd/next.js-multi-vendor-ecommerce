import type { Metadata } from "next";
import { AdminProductsPage } from "@/components/admin-products/AdminProductsPage";

export const metadata: Metadata = { title: "Popular Products — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function PopularProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return <AdminProductsPage filter="POPULAR" searchParams={searchParams} />;
}
