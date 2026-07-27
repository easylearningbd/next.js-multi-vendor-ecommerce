import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { getProductDetail } from "../actions";

export const metadata: Metadata = { title: "Product Details — Covet Seller" };

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getProductDetail(id);

  // Session-scoped: another vendor's product or a bad id → real 404.
  if (!res.success || !res.data) notFound();

  return <ProductDetailView product={res.data} />;
}
