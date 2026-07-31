import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";
import { CouponForm } from "@/components/coupons/CouponForm";
import { getCouponForEdit, getCouponFormProducts } from "../../actions";

export const metadata: Metadata = { title: "Edit Coupon — Covet Seller" };

export const dynamic = "force-dynamic";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [couponRes, productsRes] = await Promise.all([getCouponForEdit(id), getCouponFormProducts()]);

  // Session-scoped: another vendor's coupon or a bad id → real 404.
  if (!couponRes.success || !couponRes.data) notFound();

  return (
    <div>
      <div className="mb-[22px] flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
          <Icon name="ticket" size={20} strokeWidth={1.9} />
        </span>
        <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Edit Coupon</h1>
      </div>
      <CouponForm
        mode="edit"
        couponId={couponRes.data.id}
        initial={couponRes.data}
        products={productsRes.success ? productsRes.data! : []}
      />
    </div>
  );
}
