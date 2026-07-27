import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";
import { getProductFormOptions, getProductForEdit } from "../../actions";

export const metadata: Metadata = { title: "Edit Product — Covet Seller" };

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [optionsRes, productRes] = await Promise.all([getProductFormOptions(), getProductForEdit(id)]);

  // Session-scoped: not found (or another vendor's product) → real 404.
  if (!productRes.success || !productRes.data) notFound();
  if (!optionsRes.success || !optionsRes.data) notFound();

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Edit Product</h1>
        <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
      </div>
      <ProductForm options={optionsRes.data} mode="edit" productId={id} initial={productRes.data} />
    </div>
  );
}
