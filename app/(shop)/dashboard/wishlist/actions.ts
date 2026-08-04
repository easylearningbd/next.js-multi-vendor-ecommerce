"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type WishlistToggleResult =
  | { ok: true; wished: boolean }
  | { ok: false; error: string; code?: "AUTH" };

const productIdSchema = z.string().trim().min(1);

/**
 * Toggle a product in the signed-in customer's wishlist: add if absent, remove
 * if present (idempotent). The customer id comes from the SESSION only. Returns
 * the NEW state (`wished`). Login-required — a logged-out caller gets code AUTH
 * (the client turns that into a sign-in prompt, never an error).
 */
export async function toggleWishlist(productId: string): Promise<WishlistToggleResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return { ok: false, error: "Please sign in to save items to your wishlist.", code: "AUTH" };
  }
  const uid = session.user.id;

  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return { ok: false, error: "Invalid product." };
  const pid = parsed.data;

  const existing = await prisma.wishlist.findUnique({
    where: { customerId_productId: { customerId: uid, productId: pid } },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/wishlist");
    return { ok: true, wished: false };
  }

  try {
    await prisma.wishlist.create({ data: { customerId: uid, productId: pid } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // Added concurrently (unique race) — already wishlisted, treat as success.
      if (e.code === "P2002") return { ok: true, wished: true };
      // FK violation — the product doesn't exist.
      if (e.code === "P2003") return { ok: false, error: "That product is no longer available." };
    }
    return { ok: false, error: "Couldn't update your wishlist. Please try again." };
  }

  revalidatePath("/dashboard/wishlist");
  return { ok: true, wished: true };
}

/**
 * Remove a product from the customer's wishlist (used by the wishlist page's
 * Remove button). Idempotent — a no-op if it wasn't there. Session-scoped.
 */
export async function removeFromWishlist(productId: string): Promise<WishlistToggleResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return { ok: false, error: "Please sign in to manage your wishlist.", code: "AUTH" };
  }
  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return { ok: false, error: "Invalid product." };

  await prisma.wishlist.deleteMany({
    where: { customerId: session.user.id, productId: parsed.data },
  });
  revalidatePath("/dashboard/wishlist");
  return { ok: true, wished: false };
}
