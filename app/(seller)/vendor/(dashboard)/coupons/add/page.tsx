import type { Metadata } from "next";
import { Icon } from "@/components/dashboard/Icon";
import { CouponForm } from "@/components/coupons/CouponForm";
import { getCouponFormProducts } from "../actions";

export const metadata: Metadata = { title: "Add Coupon — Covet Seller" };

export const dynamic = "force-dynamic";

function Header() {
  return (
    <div className="mb-[22px] flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
        <Icon name="ticket" size={20} strokeWidth={1.9} />
      </span>
      <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Add Coupon</h1>
    </div>
  );
}

export default async function AddCouponPage() {
  const res = await getCouponFormProducts();

  return (
    <div>
      <Header />
      <CouponForm products={res.success ? res.data! : []} />
    </div>
  );
}
