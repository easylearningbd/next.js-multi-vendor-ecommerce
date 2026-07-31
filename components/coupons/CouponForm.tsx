"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createCoupon, updateCoupon } from "@/app/(seller)/vendor/(dashboard)/coupons/actions";
import type { ActionResult, CouponFormInitial, CouponPickerProduct } from "@/lib/coupon-types";
import { ProductPicker } from "./ProductPicker";

const inputBase =
  "h-[48px] w-full rounded-xl border bg-bg-subtle px-3.5 font-sans text-[13.5px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]";
const labelClass = "mb-2 block font-sans text-[12.5px] font-semibold text-ink-soft";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 font-sans text-[12px] text-error">{message}</p>;
}
function Req() {
  return <span className="text-error">*</span>;
}
function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function CouponForm({
  products,
  mode = "create",
  couponId,
  initial,
}: {
  products: CouponPickerProduct[];
  mode?: "create" | "edit";
  couponId?: string;
  initial?: CouponFormInitial;
}) {
  const router = useRouter();
  const action = mode === "edit" && couponId ? updateCoupon.bind(null, couponId) : createCoupon;
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | undefined, FormData>(
    action,
    undefined,
  );
  const errors = state?.fieldErrors;

  const [type, setType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING">(initial?.type ?? "PERCENTAGE");
  const [scope, setScope] = useState<"STORE_WIDE" | "SPECIFIC_PRODUCTS">(initial?.scope ?? "STORE_WIDE");
  const [active, setActive] = useState(initial?.isActive ?? true);
  const [code, setCode] = useState(initial?.code ?? "");
  const [productIds, setProductIds] = useState<string[]>(initial?.productIds ?? []);

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data?.id) {
      toast.success(mode === "edit" ? "Coupon updated." : "Coupon created.");
      router.push("/vendor/coupons");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, mode]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (scope === "SPECIFIC_PRODUCTS" && productIds.length === 0) {
      toast.error("Select at least one product for this coupon.");
      return;
    }
    fd.set("isActive", active ? "true" : "false");
    fd.set("productIds", JSON.stringify(scope === "SPECIFIC_PRODUCTS" ? productIds : []));
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[22px]">
      <div className="rounded-[18px] border border-line-soft bg-surface p-[26px_28px] shadow-xs">
        <div className="mb-5">
          <div className="font-display text-[18px] font-bold text-ink">Coupon Setup</div>
          <div className="mt-2 font-sans text-[13px] text-muted">
            Create a discount code for your store. It only ever applies to your own products.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="type" className={labelClass}>
              Coupon Type <Req />
            </label>
            <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className={`${inputBase} ${errors?.type ? "border-error" : "border-line"}`}>
              <option value="PERCENTAGE">Percentage discount</option>
              <option value="FIXED">Fixed amount</option>
              <option value="FREE_SHIPPING">Free shipping</option>
            </select>
            <FieldError message={errors?.type} />
          </div>

          <div>
            <label htmlFor="title" className={labelClass}>
              Coupon Title <Req />
            </label>
            <input id="title" name="title" defaultValue={initial?.title} placeholder="e.g. Summer Sale" className={`${inputBase} ${errors?.title ? "border-error" : "border-line"}`} />
            <FieldError message={errors?.title} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="code" className="font-sans text-[12.5px] font-semibold text-ink-soft">
                Coupon Code <Req />
              </label>
              <button type="button" onClick={() => setCode(randomCode())} className="font-sans text-[12px] font-semibold text-iris-500 hover:text-iris-600">
                Generate code
              </button>
            </div>
            <input id="code" name="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE10" className={`${inputBase} font-mono uppercase tracking-wide ${errors?.code ? "border-error" : "border-line"}`} />
            <FieldError message={errors?.code} />
          </div>

          {type !== "FREE_SHIPPING" && (
            <div>
              <label htmlFor="value" className={labelClass}>
                {type === "PERCENTAGE" ? "Discount Percentage (%)" : "Discount Amount ($)"} <Req />
              </label>
              <input id="value" name="value" type="number" step="0.01" min="0" max={type === "PERCENTAGE" ? "100" : undefined} defaultValue={initial?.value} placeholder={type === "PERCENTAGE" ? "e.g. 10" : "e.g. 5.00"} className={`${inputBase} ${errors?.value ? "border-error" : "border-line"}`} />
              <FieldError message={errors?.value} />
            </div>
          )}

          {type === "PERCENTAGE" && (
            <div>
              <label htmlFor="maxDiscount" className={labelClass}>
                Max Discount ($)
              </label>
              <input id="maxDiscount" name="maxDiscount" type="number" step="0.01" min="0" defaultValue={initial?.maxDiscount} placeholder="Cap, optional" className={`${inputBase} ${errors?.maxDiscount ? "border-error" : "border-line"}`} />
              <FieldError message={errors?.maxDiscount} />
            </div>
          )}

          <div>
            <label htmlFor="minSpend" className={labelClass}>
              Minimum Purchase ($)
            </label>
            <input id="minSpend" name="minSpend" type="number" step="0.01" min="0" defaultValue={initial?.minSpend} placeholder="e.g. 100" className={`${inputBase} ${errors?.minSpend ? "border-error" : "border-line"}`} />
            <FieldError message={errors?.minSpend} />
          </div>

          <div>
            <label htmlFor="scope" className={labelClass}>
              Applies To <Req />
            </label>
            <select id="scope" name="scope" value={scope} onChange={(e) => setScope(e.target.value as typeof scope)} className={`${inputBase} border-line`}>
              <option value="STORE_WIDE">All my products (store-wide)</option>
              <option value="SPECIFIC_PRODUCTS">Specific products</option>
            </select>
          </div>

          <div>
            <label htmlFor="usageLimit" className={labelClass}>
              Total Usage Limit
            </label>
            <input id="usageLimit" name="usageLimit" type="number" step="1" min="1" defaultValue={initial?.usageLimit} placeholder="Unlimited if blank" className={`${inputBase} ${errors?.usageLimit ? "border-error" : "border-line"}`} />
            <FieldError message={errors?.usageLimit} />
          </div>
          <div>
            <label htmlFor="usageLimitPerUser" className={labelClass}>
              Limit Per Customer
            </label>
            <input id="usageLimitPerUser" name="usageLimitPerUser" type="number" step="1" min="1" defaultValue={initial?.usageLimitPerUser} placeholder="Unlimited if blank" className={`${inputBase} ${errors?.usageLimitPerUser ? "border-error" : "border-line"}`} />
            <FieldError message={errors?.usageLimitPerUser} />
          </div>

          <div>
            <label htmlFor="startsAt" className={labelClass}>
              Start Date <Req />
            </label>
            <input id="startsAt" name="startsAt" type="date" defaultValue={initial?.startsAt} className={`${inputBase} ${errors?.startsAt ? "border-error" : "border-line"}`} />
            <FieldError message={errors?.startsAt} />
          </div>
          <div>
            <label htmlFor="expiresAt" className={labelClass}>
              Expiry Date <Req />
            </label>
            <input id="expiresAt" name="expiresAt" type="date" defaultValue={initial?.expiresAt} className={`${inputBase} ${errors?.expiresAt ? "border-error" : "border-line"}`} />
            <FieldError message={errors?.expiresAt} />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <button type="button" role="switch" aria-checked={active} onClick={() => setActive((a) => !a)} className="flex h-[48px] w-full items-center justify-between rounded-xl border border-line bg-bg-subtle px-3.5">
              <span className="font-sans text-[13px] text-ink-soft">{active ? "Active" : "Inactive"}</span>
              <span className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${active ? "bg-iris-500" : "bg-line"}`}>
                <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
              </span>
            </button>
          </div>
        </div>

        {scope === "SPECIFIC_PRODUCTS" && (
          <div className="mt-6 border-t border-line-soft pt-6">
            <ProductPicker products={products} selected={productIds} onChange={setProductIds} error={errors?.productIds} />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/vendor/coupons")} className="h-12 rounded-xl border border-line bg-surface px-7 font-sans text-[14px] font-semibold text-ink-soft transition-colors hover:bg-field">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-iris-500 px-9 font-display text-[14px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-70">
          {pending && <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}
