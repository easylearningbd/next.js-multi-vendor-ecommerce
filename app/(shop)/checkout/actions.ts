"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateCoupon, type CouponCartItem } from "@/lib/coupon-validate";

const cartItemSchema = z.object({
  itemId: z.string(),
  productId: z.string(),
  sellerSlug: z.string(),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const applySchema = z.object({
  code: z.string().min(1).max(64),
  cartItems: z.array(cartItemSchema).min(1),
});

export type AppliedCoupon = {
  vendorId: string;
  vendorSlug: string;
  vendorName: string;
  code: string;
  discountCents: number;
  freeShipping: boolean;
};

export type ApplyCouponResult =
  | { ok: true; coupon: AppliedCoupon }
  | { ok: false; error: string };

/**
 * Validate + resolve a coupon code against the (multi-vendor) cart.
 *
 * Codes are unique PER VENDOR, so we find which cart vendor owns the code, then
 * delegate to validateCoupon — which enforces the core rule that a coupon only
 * ever discounts ITS vendor's line items. This is a PREVIEW using the client
 * cart's prices; placeOrder (Part 5) re-validates against real DB prices.
 */
export async function applyCouponAction(input: unknown): Promise<ApplyCouponResult> {
  const parsed = applySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const { code, cartItems } = parsed.data;
  const normalized = code.trim().toUpperCase();

  const session = await auth();
  const userId = session?.user?.id ?? "guest";

  // Map seller slugs → vendor ids (cart stores slug, coupons are keyed by id).
  const slugs = [...new Set(cartItems.map((i) => i.sellerSlug))];
  const vendors = await prisma.vendor.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, storeName: true },
  });
  const bySlug = new Map(vendors.map((v) => [v.slug, v]));

  const couponItems: CouponCartItem[] = cartItems.map((i) => ({
    itemId: i.itemId,
    productId: i.productId,
    vendorId: bySlug.get(i.sellerSlug)?.id ?? "",
    unitPrice: i.unitPriceCents / 100,
    quantity: i.quantity,
  }));

  const cartVendorIds = [...new Set(couponItems.map((i) => i.vendorId).filter(Boolean))];
  const matches = await prisma.coupon.findMany({
    where: { code: normalized, vendorId: { in: cartVendorIds } },
    select: { vendorId: true, vendor: { select: { slug: true, storeName: true } } },
  });
  if (matches.length === 0) {
    return { ok: false, error: "This coupon isn't valid for any store in your cart." };
  }

  let lastError = "This coupon isn't valid.";
  for (const m of matches) {
    const r = await validateCoupon(normalized, m.vendorId, couponItems, userId);
    if (r.valid) {
      return {
        ok: true,
        coupon: {
          vendorId: m.vendorId,
          vendorSlug: m.vendor.slug,
          vendorName: m.vendor.storeName,
          code: normalized,
          discountCents: Math.round(r.discountAmount * 100),
          freeShipping: r.freeShipping,
        },
      };
    }
    if (r.error) lastError = r.error;
  }
  return { ok: false, error: lastError };
}
