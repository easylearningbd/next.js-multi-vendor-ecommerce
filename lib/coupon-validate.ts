import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Reusable coupon validation — the CONTRACT checkout will call. It is intentionally
// pure server logic (no auth/session here): the caller supplies the coupon's vendorId,
// the full (possibly multi-vendor) cart, and the customer id.
//
// THE CORE RULE: a coupon may only ever discount ITS vendor's own line items. In a
// mixed cart, applying Vendor A's coupon reduces ONLY Vendor A's items.
//
// NOTE: the final "apply + record redemption at checkout" wiring lands when checkout is
// built. This function returns the discount contract; it does not mutate anything.
// ─────────────────────────────────────────────────────────────────────────────

/** One cart line. `itemId` is the cart-line identifier checkout will map back to. */
export type CouponCartItem = {
  itemId: string;
  productId: string;
  vendorId: string;
  unitPrice: number;
  quantity: number;
};

export type CouponValidationResult = {
  valid: boolean;
  discountAmount: number; // 2-decimal money the coupon takes off the applicable items
  appliesToItemIds: string[]; // cart-line ids the discount applies to (this vendor only)
  freeShipping: boolean; // true for FREE_SHIPPING coupons (checkout waives shipping)
  error?: string;
};

const invalid = (error: string): CouponValidationResult => ({
  valid: false,
  discountAmount: 0,
  appliesToItemIds: [],
  freeShipping: false,
  error,
});

export async function validateCoupon(
  code: string,
  vendorId: string,
  cartItems: CouponCartItem[],
  userId: string,
): Promise<CouponValidationResult> {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return invalid("Enter a coupon code.");

  const coupon = await prisma.coupon.findUnique({
    where: { vendorId_code: { vendorId, code: normalized } }, // scoped to the coupon's vendor
    include: { products: { select: { productId: true } } },
  });
  if (!coupon) return invalid("This coupon isn't valid.");
  if (!coupon.isActive) return invalid("This coupon is no longer active.");

  const now = new Date();
  if (coupon.startsAt.getTime() > now.getTime()) return invalid("This coupon isn't active yet.");
  if (coupon.expiresAt.getTime() < now.getTime()) return invalid("This coupon has expired.");
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return invalid("This coupon has reached its usage limit.");
  }
  // TODO(order): per-customer limit (usageLimitPerUser) needs a redemption/order-history
  // model. `userId` is part of the contract now so checkout can enforce it once that lands.
  void userId;

  // ── CORE RULE: only ever consider THIS vendor's line items. ──
  const vendorItems = cartItems.filter((i) => i.vendorId === vendorId);
  if (vendorItems.length === 0) return invalid("This coupon doesn't apply to anything in your cart.");

  // Scope narrows which of the vendor's items actually get the discount.
  const specificIds = new Set(coupon.products.map((p) => p.productId));
  const applicable =
    coupon.scope === "SPECIFIC_PRODUCTS" ? vendorItems.filter((i) => specificIds.has(i.productId)) : vendorItems;
  if (applicable.length === 0) {
    return invalid("This coupon doesn't apply to any eligible items in your cart.");
  }

  const subtotal = (items: CouponCartItem[]) =>
    items.reduce((acc, i) => acc.add(new Prisma.Decimal(i.unitPrice).mul(i.quantity)), new Prisma.Decimal(0));

  // minSpend is measured against THIS vendor's subtotal (all their items in the cart).
  const vendorSubtotal = subtotal(vendorItems);
  if (coupon.minSpend != null && vendorSubtotal.lessThan(coupon.minSpend)) {
    return invalid(`Spend at least $${coupon.minSpend.toFixed(2)} with this seller to use this coupon.`);
  }

  const applicableSubtotal = subtotal(applicable);
  const appliesToItemIds = applicable.map((i) => i.itemId);

  if (coupon.type === "FREE_SHIPPING") {
    return { valid: true, discountAmount: 0, appliesToItemIds, freeShipping: true };
  }

  let discount: Prisma.Decimal;
  if (coupon.type === "PERCENTAGE") {
    discount = applicableSubtotal.mul(coupon.value).div(100);
    if (coupon.maxDiscount != null && discount.greaterThan(coupon.maxDiscount)) {
      discount = new Prisma.Decimal(coupon.maxDiscount); // cap % discounts
    }
  } else {
    // FIXED — never take off more than the applicable subtotal.
    discount = coupon.value.greaterThan(applicableSubtotal) ? applicableSubtotal : new Prisma.Decimal(coupon.value);
  }

  const discountAmount = Math.max(0, Number(discount.toDecimalPlaces(2)));
  return { valid: true, discountAmount, appliesToItemIds, freeShipping: false };
}
