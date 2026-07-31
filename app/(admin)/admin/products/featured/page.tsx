import type { Metadata } from "next";
import { AdminProductsPage } from "@/components/admin-products/AdminProductsPage";

export const metadata: Metadata = { title: "Featured Products — Covet Admin" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FeaturedProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return <AdminProductsPage filter="FEATURED" searchParams={searchParams} />;
}
