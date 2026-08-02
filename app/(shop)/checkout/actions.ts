"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateCoupon, type CouponCartItem } from "@/lib/coupon-validate";
import { computeCardPricing } from "@/lib/shop/pricing";
import { computeTotals } from "@/lib/checkout/totals";
import { addressSchema, shippingCostCents } from "@/lib/checkout/shipping-schema";

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

/* ------------------------------------------------------------------ */
/* placeOrder — server-authoritative order placement (COD v1)          */
/* ------------------------------------------------------------------ */

const placeOrderSchema = z.object({
  cartItems: z
    .array(
      z.object({
        productId: z.string().min(1),
        variationId: z.string().nullish(),
        qty: z.number().int().positive().max(999),
      }),
    )
    .min(1),
  couponCodes: z
    .array(z.object({ code: z.string(), vendorId: z.string() }))
    .default([]),
  shipping: addressSchema,
  billing: addressSchema.nullish(),
  billingSame: z.boolean(),
  shippingMethod: z.enum(["standard", "express"]),
  note: z.string().max(1000).optional(),
});

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string; code?: "AUTH" | "STOCK" | "EMPTY" | "VALIDATION" };

/** Money helper: integer cents -> a Decimal(10,2) dollar value. */
function cents(n: number): Prisma.Decimal {
  return new Prisma.Decimal(n).div(100);
}

function variantLabelFrom(attributes: Prisma.JsonValue | null): string | null {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) return null;
  const parts = Object.entries(attributes)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}: ${String(v)}`);
  return parts.length ? parts.join(" · ") : null;
}

const ORDER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateOrderNumber(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ORDER_CHARS[Math.floor(Math.random() * ORDER_CHARS.length)];
  return `CVT-${s}`;
}

class StockError extends Error {
  constructor(public itemName: string) {
    super("out-of-stock");
  }
}

/**
 * Place a marketplace order. The SERVER is the authority: it re-reads every
 * product/variation's REAL price + stock, recomputes all totals, re-validates
 * coupons, checks stock, then creates the Order + per-vendor SubOrders +
 * OrderItems (snapshots), decrements stock, and bumps coupon usedCount — all in
 * ONE transaction. The client cart is never trusted for price or discount.
 *
 * paymentMethod=COD, paymentStatus=UNPAID, status=PENDING. A Stripe branch can
 * slot in after totals are computed (mark PAID / create a PaymentIntent) without
 * restructuring anything below.
 */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Some checkout details are invalid.", code: "VALIDATION" };
  }
  const data = parsed.data;

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Please sign in to place your order.", code: "AUTH" };
  }
  const customerId = session.user.id;

  // ---- Re-read products with real prices + stock (server authority) ----
  const productIds = [...new Set(data.cartItems.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      vendorId: true,
      price: true,
      compareAtPrice: true,
      discount: true,
      discountType: true,
      stock: true,
      approvalStatus: true,
      isActive: true,
      variations: { select: { id: true, price: true, stock: true, attributes: true } },
    },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  type Line = {
    productId: string;
    variationId: string | null;
    vendorId: string;
    name: string;
    variantLabel: string | null;
    unitPriceCents: number;
    qty: number;
    lineTotalCents: number;
  };
  const lines: Line[] = [];

  for (const item of data.cartItems) {
    const p = productMap.get(item.productId);
    if (!p) return { ok: false, error: "A product in your cart no longer exists." };
    if (p.approvalStatus !== "APPROVED" || !p.isActive) {
      return { ok: false, error: `"${p.name}" is no longer available.` };
    }

    let unitPriceCents: number;
    let stock: number;
    let variantLabel: string | null = null;
    let variationId: string | null = null;

    if (item.variationId) {
      const v = p.variations.find((x) => x.id === item.variationId);
      if (!v) return { ok: false, error: `A selected option for "${p.name}" is unavailable.` };
      unitPriceCents = computeCardPricing({
        price: v.price,
        compareAtPrice: null,
        discount: null,
        discountType: "AMOUNT",
      }).priceCents;
      stock = v.stock;
      variationId = v.id;
      variantLabel = variantLabelFrom(v.attributes);
    } else {
      unitPriceCents = computeCardPricing(p).priceCents;
      stock = p.stock;
    }

    if (stock < item.qty) {
      return { ok: false, error: `"${p.name}" is out of stock.`, code: "STOCK" };
    }

    lines.push({
      productId: p.id,
      variationId,
      vendorId: p.vendorId,
      name: p.name,
      variantLabel,
      unitPriceCents,
      qty: item.qty,
      lineTotalCents: unitPriceCents * item.qty,
    });
  }

  // ---- Group by vendor ----
  const byVendor = new Map<string, Line[]>();
  for (const l of lines) {
    const arr = byVendor.get(l.vendorId) ?? [];
    arr.push(l);
    byVendor.set(l.vendorId, arr);
  }

  // ---- Re-validate coupons against the SERVER prices (never trust the client) ----
  const couponCartItems: CouponCartItem[] = lines.map((l, idx) => ({
    itemId: String(idx),
    productId: l.productId,
    vendorId: l.vendorId,
    unitPrice: l.unitPriceCents / 100,
    quantity: l.qty,
  }));

  const vendorCoupon = new Map<string, { couponId: string; discountCents: number }>();
  for (const cc of data.couponCodes) {
    if (!byVendor.has(cc.vendorId)) continue; // that vendor isn't in the cart
    const code = cc.code.trim().toUpperCase();
    const r = await validateCoupon(code, cc.vendorId, couponCartItems, customerId);
    if (!r.valid) continue; // silently drop coupons that no longer validate
    const coupon = await prisma.coupon.findUnique({
      where: { vendorId_code: { vendorId: cc.vendorId, code } },
      select: { id: true },
    });
    if (coupon) {
      vendorCoupon.set(cc.vendorId, {
        couponId: coupon.id,
        discountCents: Math.round(r.discountAmount * 100),
      });
    }
  }

  // ---- Compute totals (integer cents) ----
  let subtotalCents = 0;
  let discountCents = 0;
  const vendorGroups = [...byVendor.entries()].map(([vendorId, vLines]) => {
    const vSub = vLines.reduce((s, l) => s + l.lineTotalCents, 0);
    const vc = vendorCoupon.get(vendorId);
    const vDiscount = vc ? Math.min(vc.discountCents, vSub) : 0;
    subtotalCents += vSub;
    discountCents += vDiscount;
    return { vendorId, vLines, vSub, vDiscount, couponId: vc?.couponId ?? null };
  });

  const shippingCents = shippingCostCents(data.shippingMethod);
  const totals = computeTotals(subtotalCents, { shippingCents, discountCents });
  const usedCouponIds = vendorGroups
    .map((g) => g.couponId)
    .filter((c): c is string => c !== null);
  const billing = data.billingSame ? null : data.billing;

  // ---- Create everything in ONE transaction (retry on order-number collision) ----
  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      const order = await prisma.$transaction(async (tx) => {
        // Atomic check-and-decrement: guards against overselling under concurrency.
        for (const l of lines) {
          const res = l.variationId
            ? await tx.productVariation.updateMany({
                where: { id: l.variationId, stock: { gte: l.qty } },
                data: { stock: { decrement: l.qty } },
              })
            : await tx.product.updateMany({
                where: { id: l.productId, stock: { gte: l.qty } },
                data: { stock: { decrement: l.qty } },
              });
          if (res.count !== 1) throw new StockError(l.name);
        }

        const created = await tx.order.create({
          data: {
            orderNumber,
            customerId,
            shipName: data.shipping.name,
            shipEmail: data.shipping.email,
            shipPhone: data.shipping.phone,
            shipCountry: data.shipping.country,
            shipCity: data.shipping.city,
            shipZip: data.shipping.zip,
            shipAddress: data.shipping.address,
            billName: billing?.name ?? null,
            billEmail: billing?.email ?? null,
            billPhone: billing?.phone ?? null,
            billCountry: billing?.country ?? null,
            billCity: billing?.city ?? null,
            billZip: billing?.zip ?? null,
            billAddress: billing?.address ?? null,
            subtotal: cents(subtotalCents),
            discount: cents(discountCents),
            tax: cents(totals.taxCents),
            shipping: cents(shippingCents),
            grandTotal: cents(totals.grandTotalCents),
            shippingMethod: data.shippingMethod,
            paymentMethod: "COD",
            paymentStatus: "UNPAID",
            status: "PENDING",
            note: data.note?.trim() || null,
            subOrders: {
              create: vendorGroups.map((g) => ({
                vendorId: g.vendorId,
                subtotal: cents(g.vSub),
                discount: cents(g.vDiscount),
                total: cents(g.vSub - g.vDiscount),
                couponId: g.couponId,
                status: "PENDING",
                items: {
                  create: g.vLines.map((l) => ({
                    productId: l.productId,
                    variationId: l.variationId,
                    productName: l.name,
                    variantLabel: l.variantLabel,
                    unitPrice: cents(l.unitPriceCents),
                    qty: l.qty,
                    lineTotal: cents(l.lineTotalCents),
                  })),
                },
              })),
            },
          },
          select: { id: true, orderNumber: true },
        });

        for (const couponId of usedCouponIds) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } },
          });
        }

        return created;
      });

      return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
    } catch (e) {
      if (e instanceof StockError) {
        return { ok: false, error: `"${e.itemName}" is out of stock.`, code: "STOCK" };
      }
      // Retry only on a duplicate order-number collision.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      console.error("placeOrder failed:", e);
      return { ok: false, error: "We couldn't place your order. Please try again." };
    }
  }

  return { ok: false, error: "We couldn't generate an order number. Please try again." };
}
