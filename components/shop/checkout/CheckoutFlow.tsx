"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import { useCart, lineKey } from "@/components/shop/cart/CartProvider";
import {
  applyCouponAction,
  placeOrder,
  type AppliedCoupon,
} from "@/app/(shop)/checkout/actions";
import {
  addressSchema,
  defaultCheckoutForm,
  shippingCostCents,
  type CheckoutForm,
} from "@/lib/checkout/shipping-schema";
import { CheckoutStepper, type CheckoutStep } from "@/components/shop/checkout/CheckoutStepper";
import { CartStep } from "@/components/shop/checkout/CartStep";
import { CouponForm } from "@/components/shop/checkout/CouponForm";
import { ShippingStep, type ShippingErrors } from "@/components/shop/checkout/ShippingStep";
import { PaymentStep } from "@/components/shop/checkout/PaymentStep";
import { OrderSummary } from "@/components/shop/checkout/OrderSummary";

type ContactDefaults = { name?: string | null; email?: string | null; phone?: string | null };

// SSR-safe "is this the client, post-hydration?" — matches the cart store's own
// hydration timing so we don't flash the empty state before the cart loads.
const noopSubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function CheckoutFlow({ defaultContact }: { defaultContact?: ContactDefaults }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { count, subtotalCents, items, clear } = useCart();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [applied, setApplied] = useState<AppliedCoupon[]>([]);
  const [couponPending, setCouponPending] = useState(false);
  const [form, setForm] = useState<CheckoutForm>(() => defaultCheckoutForm(defaultContact));
  const [shipErrors, setShipErrors] = useState<ShippingErrors>({});
  const [note, setNote] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [placing, setPlacing] = useState(false);

  const shippingCents = shippingCostCents(form.shippingMethod);

  async function handlePlaceOrder() {
    if (placing || !agreedTerms) return;
    setPlacing(true);
    const res = await placeOrder({
      cartItems: items.map((i) => ({
        productId: i.productId,
        variationId: i.variationId,
        qty: i.qty,
      })),
      couponCodes: applied.map((c) => ({ code: c.code, vendorId: c.vendorId })),
      shipping: form.shipping,
      billing: form.billingSame ? null : form.billing,
      billingSame: form.billingSame,
      shippingMethod: form.shippingMethod,
      note: note.trim() || undefined,
    });
    if (!res.ok) {
      setPlacing(false);
      toast.error(res.error);
      if (res.code === "AUTH") router.push("/login?next=/checkout");
      return;
    }
    // Success: clear the cart, then go to the confirmation page (reachable by URL).
    clear();
    router.push(`/order/confirmation/${res.orderNumber}`);
  }

  function validateShipping(): boolean {
    const ship = addressSchema.safeParse(form.shipping);
    const errs: ShippingErrors = {};
    if (!ship.success) {
      errs.shipping = Object.fromEntries(
        Object.entries(ship.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]]),
      );
    }
    let billOk = true;
    if (!form.billingSame) {
      const bill = addressSchema.safeParse(form.billing);
      billOk = bill.success;
      if (!bill.success) {
        errs.billing = Object.fromEntries(
          Object.entries(bill.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]]),
        );
      }
    }
    setShipErrors(errs);
    const ok = ship.success && billOk;
    if (!ok) toast.error("Please complete the required fields.");
    return ok;
  }

  // Only coupons whose vendor still has items in the cart count (auto-drops a
  // coupon if its store's items were all removed). Placement (Part 5) re-validates.
  const validApplied = applied.filter((c) =>
    items.some((i) => i.sellerSlug === c.vendorSlug),
  );
  const discountCents = validApplied.reduce((s, c) => s + c.discountCents, 0);

  async function handleApplyCoupon(code: string) {
    if (applied.some((c) => c.code === code.trim().toUpperCase())) {
      toast.error("That coupon is already applied.");
      return;
    }
    setCouponPending(true);
    const cartItems = items.map((i) => ({
      itemId: lineKey(i),
      productId: i.productId,
      sellerSlug: i.sellerSlug,
      unitPriceCents: i.priceCents,
      quantity: i.qty,
    }));
    const res = await applyCouponAction({ code, cartItems });
    setCouponPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    // One coupon per vendor — replace any existing coupon for that store.
    setApplied((prev) => [
      ...prev.filter((c) => c.vendorId !== res.coupon.vendorId),
      res.coupon,
    ]);
    toast.success(
      res.coupon.discountCents > 0
        ? `${res.coupon.code} applied — ${formatCents(res.coupon.discountCents)} off ${res.coupon.vendorName}`
        : `${res.coupon.code} applied to ${res.coupon.vendorName}`,
    );
  }

  function handleRemoveCoupon(vendorId: string) {
    setApplied((prev) => prev.filter((c) => c.vendorId !== vendorId));
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] py-24">
        <div className="mx-auto h-64 max-w-[900px] animate-pulse rounded-[18px] bg-line-soft" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] py-16">
        <div className="mx-auto flex max-w-[520px] flex-col items-center rounded-[20px] border border-dashed border-line bg-surface px-8 py-20 text-center">
          <span className="mb-5 flex size-[72px] items-center justify-center rounded-full bg-field text-muted-soft">
            <Icon name="cart" size={34} strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-[22px] font-bold text-ink">Your cart is empty</h1>
          <p className="mx-auto mb-6 mt-3 max-w-[340px] font-sans text-sm text-muted">
            Add some products to your cart before heading to checkout.
          </p>
          <Link
            href="/"
            className="flex h-[46px] items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  const primary =
    step === "cart"
      ? { label: "Proceed to Shipping", action: () => setStep("shipping") }
      : step === "shipping"
        ? {
            label: "Proceed to Payment",
            action: () => {
              if (validateShipping()) setStep("payment");
            },
          }
        : { label: placing ? "Placing order…" : "Place Order", action: handlePlaceOrder };

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-8">
        <h1 className="mb-6 text-center font-display text-[26px] font-bold tracking-[-0.01em] text-ink">
          Checkout
        </h1>
        <CheckoutStepper step={step} />
      </div>

      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-start gap-6 px-[var(--cpad)] pt-8 lg:grid-cols-[1fr_400px]">
        <div>
          {step === "cart" && <CartStep />}
          {step === "shipping" && (
            <ShippingStep value={form} setForm={setForm} errors={shipErrors} />
          )}
          {step === "payment" && (
            <PaymentStep
              note={note}
              onNoteChange={setNote}
              onBack={() => setStep("shipping")}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          <OrderSummary
            subtotalCents={subtotalCents}
            discountCents={discountCents}
            shippingCents={shippingCents}
            primaryLabel={primary.label}
            onPrimary={primary.action}
            primaryDisabled={step === "payment" && (!agreedTerms || placing)}
            coupon={
              <CouponForm
                applied={validApplied}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                pending={couponPending}
              />
            }
            terms={
              step === "payment" ? (
                <label className="mb-4 flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 size-[18px] flex-none accent-iris-500"
                  />
                  <span className="font-sans text-[12.5px] leading-[1.5] text-ink-soft">
                    I agree to the{" "}
                    <Link href="/terms" className="text-iris-500 hover:underline">
                      Terms &amp; Conditions
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="text-iris-500 hover:underline">
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link href="/refund-policy" className="text-iris-500 hover:underline">
                      Refund Policy
                    </Link>
                    .
                  </span>
                </label>
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
