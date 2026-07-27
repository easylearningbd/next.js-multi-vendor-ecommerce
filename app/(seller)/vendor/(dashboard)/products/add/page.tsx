import type { Metadata } from "next";
import { Icon } from "@/components/dashboard/Icon";
import { ProductForm } from "@/components/products/ProductForm";
import { getProductFormOptions } from "../actions";

export const metadata: Metadata = { title: "Add New Product — Covet Seller" };

export const dynamic = "force-dynamic";

function Header() {
  return (
    <div className="mb-[22px]">
      <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Add New Product</h1>
      <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
    </div>
  );
}

export default async function AddProductPage() {
  const res = await getProductFormOptions();

  if (!res.success || !res.data) {
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center rounded-[18px] border border-[#f6d9da] bg-surface px-8 py-[72px] text-center">
          <span className="mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl bg-error-bg text-error">
            <Icon name="alert" size={34} strokeWidth={1.7} />
          </span>
          <div className="font-display text-[20px] font-bold text-ink">Couldn&apos;t load the form</div>
          <p className="mx-auto mt-3 max-w-[360px] font-sans text-[14px] text-muted">
            We couldn&apos;t load categories and brands. Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <ProductForm options={res.data} mode="create" />
    </div>
  );
}
