import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminProductDetailView } from "@/components/admin-products/AdminProductDetailView";
import { getAdminProductDetail, getAdminProductReviews } from "../actions";

export const metadata: Metadata = { title: "Product Details — Covet Admin" };

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getAdminProductDetail(id);

  if (!res.success || !res.data) notFound();

  const reviewsRes = await getAdminProductReviews(id);
  const reviews = reviewsRes.success ? (reviewsRes.data ?? []) : [];

  return <AdminProductDetailView product={res.data} reviews={reviews} />;
}
