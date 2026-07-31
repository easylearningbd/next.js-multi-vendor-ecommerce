"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type CouponType, type CouponScope } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { couponCoreSchema } from "@/lib/coupon-validation";
import type {
  ActionResult,
  CouponDerivedStatus,
  CouponFormInitial,
  CouponListItem,
  CouponPickerProduct,
  CouponStatusFilter,
  CouponsQuery,
  Paginated,
} from "@/lib/coupon-types";

// ─────────────────────────────────────────────────────────────
// Session → vendor. Every coupon query is scoped to THIS vendorId, so a vendor can
// only ever see/mutate their own coupons and attach only their own products.
// ─────────────────────────────────────────────────────────────
async function requireVendor(): Promise<{ vendorId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { error: "You are not authorized to perform this action." };
  }
  let vendorId = session.user.vendorId ?? null;
  if (!vendorId) {
    const v = await prisma.vendor.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    vendorId = v?.id ?? null;
  }
  if (!vendorId) return { error: "Your store profile could not be found." };
  return { vendorId };
}

function firstFieldErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

const dec = (n: number) => new Prisma.Decimal(n.toFixed(2));
const money = (d: Prisma.Decimal) => `$${d.toFixed(2)}`;

// ─────────────────────────────────────────────────────────────
// This vendor's products, for the SPECIFIC_PRODUCTS picker (session-scoped).
// ─────────────────────────────────────────────────────────────
export async function getCouponFormProducts(): Promise<ActionResult<CouponPickerProduct[]>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };
  try {
    const rows = await prisma.product.findMany({
      where: { vendorId: authed.vendorId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, thumbnail: true, price: true },
    });
    return {
      success: true,
      data: rows.map((p) => ({ id: p.id, name: p.name, thumbnail: p.thumbnail, price: money(p.price) })),
    };
  } catch {
    return { success: false, error: "Couldn't load your products." };
  }
}

// ─────────────────────────────────────────────────────────────
// Create coupon — session-scoped, Zod-validated, one transaction. code is unique
// per vendor; SPECIFIC_PRODUCTS attaches only THIS vendor's products.
// ─────────────────────────────────────────────────────────────
export async function createCoupon(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };
  const { vendorId } = authed;

  let productIdsRaw: unknown = [];
  try {
    productIdsRaw = JSON.parse((formData.get("productIds") as string) || "[]");
  } catch {
    return { success: false, error: "Invalid product selection." };
  }

  const parsed = couponCoreSchema.safeParse({
    code: formData.get("code"),
    title: formData.get("title"),
    type: formData.get("type"),
    value: formData.get("value"),
    scope: formData.get("scope"),
    minSpend: formData.get("minSpend"),
    maxDiscount: formData.get("maxDiscount"),
    usageLimit: formData.get("usageLimit"),
    usageLimitPerUser: formData.get("usageLimitPerUser"),
    startsAt: formData.get("startsAt"),
    expiresAt: formData.get("expiresAt"),
    isActive: formData.get("isActive") !== "false",
    productIds: productIdsRaw,
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const d = parsed.data;

  // Per-vendor code uniqueness (two vendors may share the same code).
  const clash = await prisma.coupon.findUnique({
    where: { vendorId_code: { vendorId, code: d.code } },
    select: { id: true },
  });
  if (clash) {
    return { success: false, error: "You already have a coupon with this code.", fieldErrors: { code: "This code is already in use" } };
  }

  // Validate attached products belong to THIS vendor (never trust the client).
  let productIds: string[] = [];
  if (d.scope === "SPECIFIC_PRODUCTS") {
    productIds = [...new Set(d.productIds)];
    const owned = await prisma.product.findMany({
      where: { id: { in: productIds }, vendorId },
      select: { id: true },
    });
    if (owned.length !== productIds.length) {
      return { success: false, error: "One or more selected products aren't yours.", fieldErrors: { productIds: "Invalid product selection" } };
    }
  }

  // Store dates as a full window: start at day-start, expiry through day-end.
  const startsAt = new Date(Date.parse(d.startsAt));
  const expiresAt = new Date(Date.parse(d.expiresAt) + 86_399_999);
  const value = d.type === "FREE_SHIPPING" ? dec(0) : dec(d.value ?? 0);

  try {
    const created = await prisma.$transaction(async (tx) => {
      return tx.coupon.create({
        data: {
          vendorId, // session-scoped
          code: d.code,
          title: d.title,
          type: d.type,
          value,
          scope: d.scope,
          minSpend: d.minSpend != null ? dec(d.minSpend) : null,
          // maxDiscount only meaningful for PERCENTAGE.
          maxDiscount: d.type === "PERCENTAGE" && d.maxDiscount != null ? dec(d.maxDiscount) : null,
          usageLimit: d.usageLimit ?? null,
          usageLimitPerUser: d.usageLimitPerUser ?? null,
          startsAt,
          expiresAt,
          isActive: d.isActive,
          ...(d.scope === "SPECIFIC_PRODUCTS" && productIds.length
            ? { products: { create: productIds.map((productId) => ({ productId })) } }
            : {}),
        },
        select: { id: true },
      });
    });

    revalidatePath("/vendor/coupons");
    return { success: true, data: { id: created.id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, error: "You already have a coupon with this code.", fieldErrors: { code: "This code is already in use" } };
    }
    return { success: false, error: "Something went wrong creating the coupon. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// List — this vendor's coupons (derived-status filter + search + paginate)
// ─────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<CouponType, string> = {
  PERCENTAGE: "Percentage",
  FIXED: "Fixed amount",
  FREE_SHIPPING: "Free shipping",
};

function deriveStatus(isActive: boolean, startsAt: Date, expiresAt: Date, now: Date): CouponDerivedStatus {
  if (!isActive) return "INACTIVE";
  if (startsAt.getTime() > now.getTime()) return "SCHEDULED";
  if (expiresAt.getTime() < now.getTime()) return "EXPIRED";
  return "ACTIVE";
}

/** Where-clause matching a derived status (same logic as deriveStatus, in SQL terms). */
function statusWhere(status: CouponStatusFilter, now: Date): Prisma.CouponWhereInput {
  switch (status) {
    case "INACTIVE":
      return { isActive: false };
    case "SCHEDULED":
      return { isActive: true, startsAt: { gt: now } };
    case "EXPIRED":
      return { isActive: true, expiresAt: { lt: now } };
    case "ACTIVE":
      return { isActive: true, startsAt: { lte: now }, expiresAt: { gte: now } };
    default:
      return {};
  }
}

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);

function valueLabel(type: CouponType, value: Prisma.Decimal): string {
  if (type === "FREE_SHIPPING") return "Free shipping";
  if (type === "PERCENTAGE") return `${Number(value)}%`;
  return `$${value.toFixed(2)}`;
}
function bigLabel(type: CouponType, value: Prisma.Decimal): string {
  if (type === "FREE_SHIPPING") return "Free";
  if (type === "PERCENTAGE") return `${Number(value)}%`;
  return `$${Number(value)}`;
}

export async function getCoupons(query: CouponsQuery = {}): Promise<ActionResult<Paginated<CouponListItem>>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const search = (query.search ?? "").trim();
  const status = query.status ?? "ALL";
  const page = Math.max(1, query.page ?? 1);
  const requested = query.pageSize ?? 10;
  const pageSize = [10, 20, 50].includes(requested) ? requested : 10;
  const now = new Date();

  const where: Prisma.CouponWhereInput = {
    vendorId: authed.vendorId, // session-scoped
    ...statusWhere(status, now),
    ...(search ? { OR: [{ code: { contains: search } }, { title: { contains: search } }] } : {}),
  };

  try {
    const total = await prisma.coupon.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const rows = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { products: true } } },
    });

    const items: CouponListItem[] = rows.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      type: c.type,
      typeLabel: TYPE_LABEL[c.type],
      valueLabel: valueLabel(c.type, c.value),
      scope: c.scope,
      scopeLabel: c.scope === "STORE_WIDE" ? "Store-wide" : `Specific (${c._count.products})`,
      usedCount: c.usedCount,
      usageLimit: c.usageLimit,
      usageLimitPerUser: c.usageLimitPerUser,
      usageLabel: `${c.usedCount} / ${c.usageLimit ?? "∞"}`,
      startLabel: fmtDate(c.startsAt),
      expiryLabel: fmtDate(c.expiresAt),
      status: deriveStatus(c.isActive, c.startsAt, c.expiresAt, now),
      isActive: c.isActive,
      minSpendLabel: c.minSpend != null ? `$${c.minSpend.toFixed(2)}` : "—",
      maxDiscountLabel:
        c.type === "FREE_SHIPPING"
          ? "Free shipping"
          : c.maxDiscount != null
            ? `$${c.maxDiscount.toFixed(2)}`
            : "—",
      bigLabel: bigLabel(c.type, c.value),
    }));

    return { success: true, data: { items, total, page: safePage, pageSize, totalPages } };
  } catch {
    return { success: false, error: "Couldn't load coupons. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Load a vendor's OWN coupon for editing (session-scoped → 404 for other vendors).
// ─────────────────────────────────────────────────────────────
export async function getCouponForEdit(id: string): Promise<ActionResult<CouponFormInitial>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const c = await prisma.coupon.findFirst({
    where: { id, vendorId: authed.vendorId },
    include: { products: { select: { productId: true } } },
  });
  if (!c) return { success: false, error: "Coupon not found." };

  const day = (d: Date) => d.toISOString().slice(0, 10);
  return {
    success: true,
    data: {
      id: c.id,
      code: c.code,
      title: c.title,
      type: c.type,
      value: c.type === "FREE_SHIPPING" ? "" : c.value.toString(),
      scope: c.scope,
      minSpend: c.minSpend?.toString() ?? "",
      maxDiscount: c.maxDiscount?.toString() ?? "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      usageLimitPerUser: c.usageLimitPerUser != null ? String(c.usageLimitPerUser) : "",
      startsAt: day(c.startsAt),
      expiresAt: day(c.expiresAt),
      isActive: c.isActive,
      productIds: c.products.map((p) => p.productId),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Update coupon — session-scoped, one transaction; re-diffs attached products.
// ─────────────────────────────────────────────────────────────
export async function updateCoupon(
  id: string,
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };
  const { vendorId } = authed;

  const existing = await prisma.coupon.findFirst({
    where: { id, vendorId }, // session-scoped
    include: { products: { select: { productId: true } } },
  });
  if (!existing) return { success: false, error: "Coupon not found." };

  let productIdsRaw: unknown = [];
  try {
    productIdsRaw = JSON.parse((formData.get("productIds") as string) || "[]");
  } catch {
    return { success: false, error: "Invalid product selection." };
  }

  const parsed = couponCoreSchema.safeParse({
    code: formData.get("code"),
    title: formData.get("title"),
    type: formData.get("type"),
    value: formData.get("value"),
    scope: formData.get("scope"),
    minSpend: formData.get("minSpend"),
    maxDiscount: formData.get("maxDiscount"),
    usageLimit: formData.get("usageLimit"),
    usageLimitPerUser: formData.get("usageLimitPerUser"),
    startsAt: formData.get("startsAt"),
    expiresAt: formData.get("expiresAt"),
    isActive: formData.get("isActive") !== "false",
    productIds: productIdsRaw,
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const d = parsed.data;

  // Per-vendor code uniqueness, excluding THIS coupon.
  const clash = await prisma.coupon.findFirst({
    where: { vendorId, code: d.code, NOT: { id } },
    select: { id: true },
  });
  if (clash) {
    return { success: false, error: "You already have another coupon with this code.", fieldErrors: { code: "This code is already in use" } };
  }

  // Validate the attached products belong to THIS vendor.
  let productIds: string[] = [];
  if (d.scope === "SPECIFIC_PRODUCTS") {
    productIds = [...new Set(d.productIds)];
    const owned = await prisma.product.findMany({ where: { id: { in: productIds }, vendorId }, select: { id: true } });
    if (owned.length !== productIds.length) {
      return { success: false, error: "One or more selected products aren't yours.", fieldErrors: { productIds: "Invalid product selection" } };
    }
  }

  // Diff attachments: STORE_WIDE clears all; SPECIFIC adds new + removes deleted.
  const current = new Set(existing.products.map((p) => p.productId));
  const next = new Set(d.scope === "SPECIFIC_PRODUCTS" ? productIds : []);
  const toAdd = [...next].filter((pid) => !current.has(pid));
  const toRemove = [...current].filter((pid) => !next.has(pid));

  const startsAt = new Date(Date.parse(d.startsAt));
  const expiresAt = new Date(Date.parse(d.expiresAt) + 86_399_999);
  const value = d.type === "FREE_SHIPPING" ? dec(0) : dec(d.value ?? 0);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id },
        data: {
          code: d.code,
          title: d.title,
          type: d.type,
          value,
          scope: d.scope,
          minSpend: d.minSpend != null ? dec(d.minSpend) : null,
          maxDiscount: d.type === "PERCENTAGE" && d.maxDiscount != null ? dec(d.maxDiscount) : null,
          usageLimit: d.usageLimit ?? null,
          usageLimitPerUser: d.usageLimitPerUser ?? null,
          startsAt,
          expiresAt,
          isActive: d.isActive,
        },
      });
      if (toRemove.length) {
        await tx.couponProduct.deleteMany({ where: { couponId: id, productId: { in: toRemove } } });
      }
      if (toAdd.length) {
        await tx.couponProduct.createMany({ data: toAdd.map((productId) => ({ couponId: id, productId })) });
      }
    });

    revalidatePath("/vendor/coupons");
    return { success: true, data: { id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, error: "You already have another coupon with this code.", fieldErrors: { code: "This code is already in use" } };
    }
    return { success: false, error: "Couldn't save the coupon. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Delete — session-scoped. If the coupon has been used (usedCount > 0) we DEACTIVATE
// to preserve order history; otherwise hard-delete (CouponProduct rows cascade).
// ─────────────────────────────────────────────────────────────
export async function deleteCoupon(id: string): Promise<ActionResult<{ softDeleted: boolean }>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const coupon = await prisma.coupon.findFirst({
    where: { id, vendorId: authed.vendorId }, // session-scoped
    select: { id: true, usedCount: true },
  });
  if (!coupon) return { success: false, error: "Coupon not found." };

  try {
    if (coupon.usedCount > 0) {
      await prisma.coupon.update({ where: { id }, data: { isActive: false } });
      revalidatePath("/vendor/coupons");
      return { success: true, data: { softDeleted: true } };
    }
    await prisma.coupon.delete({ where: { id } }); // CouponProduct cascades
    revalidatePath("/vendor/coupons");
    return { success: true, data: { softDeleted: false } };
  } catch {
    return { success: false, error: "Couldn't delete the coupon. Please try again." };
  }
}
