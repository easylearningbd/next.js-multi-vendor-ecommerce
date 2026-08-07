"use server";

import { revalidatePath } from "next/cache";
import type { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { ActionResult } from "@/lib/admin-product-types";

// Admin gate — reused by every action here.
async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  return null;
}

// The product's public rating is COMPUTED on read from APPROVED + visible reviews
// (no cached rating column), so revalidating the affected pages is all that's
// needed for the storefront to reflect a moderation decision.
function revalidateReview(reviewId: string, productSlug: string) {
  revalidatePath(`/products/${productSlug}`); // storefront product page (reviews + avg rating)
  revalidatePath("/admin/reviews");
  revalidatePath(`/admin/reviews/${reviewId}`);
}

/**
 * Approve or reject a review (moderation decision → status). Approving makes it
 * eligible to show on the storefront (still gated by isVisible); rejecting hides
 * it everywhere. ADMIN-only.
 */
export async function moderateReview(
  reviewId: string,
  decision: Extract<ReviewStatus, "APPROVED" | "REJECTED">,
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { product: { select: { slug: true } } },
  });
  if (!review) return { success: false, error: "Review not found." };

  try {
    await prisma.review.update({ where: { id: reviewId }, data: { status: decision } });
  } catch {
    return { success: false, error: "Couldn't update the review. Please try again." };
  }

  revalidateReview(reviewId, review.product.slug);
  return { success: true };
}

/**
 * Show/hide an already-APPROVED review (isVisible). Distinct from moderation:
 * approval decides eligibility, visibility decides display. Only meaningful for
 * APPROVED reviews. ADMIN-only.
 */
export async function setReviewVisibility(
  reviewId: string,
  isVisible: boolean,
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { status: true, product: { select: { slug: true } } },
  });
  if (!review) return { success: false, error: "Review not found." };
  if (review.status !== "APPROVED") {
    return { success: false, error: "Only approved reviews can be shown or hidden." };
  }

  try {
    await prisma.review.update({ where: { id: reviewId }, data: { isVisible } });
  } catch {
    return { success: false, error: "Couldn't update visibility. Please try again." };
  }

  revalidateReview(reviewId, review.product.slug);
  return { success: true };
}
