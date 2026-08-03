"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME } from "@/lib/brand-validation";
import { saveReviewImage, deleteReviewImage, ReviewFileError } from "@/lib/shop/review-upload";

export type SubmitReviewResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function firstErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

const emptyFileToUndefined = (v: unknown) =>
  v == null || (v instanceof File && v.size === 0) ? undefined : v;

const reviewSchema = z.object({
  orderItemId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Please select a rating").max(5, "Rating must be 1–5"),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  comment: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Review is too long"),
  image: z.preprocess(
    emptyFileToUndefined,
    z
      .instanceof(File, { message: "Please choose an image file" })
      .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 2MB or smaller")
      .refine(
        (f) => (ACCEPTED_IMAGE_MIME as readonly string[]).includes(f.type),
        "Only JPG, PNG or WebP images are allowed",
      )
      .optional(),
  ),
});

/**
 * Create a verified-buyer product review (status PENDING). Enforced server-side:
 *  • must be the signed-in customer
 *  • the order item must belong to THIS customer, reference the claimed product,
 *    and sit in a DELIVERED order (verified-buyer + received rule)
 *  • one review per order item (DB unique + explicit check)
 * Image is server-validated (magic bytes). Never trusts the client.
 */
export async function submitReview(
  _prev: SubmitReviewResult | undefined,
  formData: FormData,
): Promise<SubmitReviewResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return { ok: false, error: "Please sign in to write a review." };
  }
  const uid = session.user.id;

  const parsed = reviewSchema.safeParse({
    orderItemId: formData.get("orderItemId"),
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    comment: formData.get("comment"),
    image: formData.get("image"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: firstErrors(parsed.error.flatten().fieldErrors),
    };
  }
  const d = parsed.data;

  // Verified-buyer + product-match + DELIVERED, all enforced by this scoped lookup.
  const item = await prisma.orderItem.findFirst({
    where: {
      id: d.orderItemId,
      productId: d.productId,
      subOrder: { order: { customerId: uid, status: "DELIVERED" } },
    },
    select: { id: true, subOrder: { select: { order: { select: { orderNumber: true } } } } },
  });
  if (!item) {
    return {
      ok: false,
      error: "You can only review an item you purchased in a delivered order.",
    };
  }

  // One review per order item.
  const existing = await prisma.review.findUnique({
    where: { customerId_orderItemId: { customerId: uid, orderItemId: d.orderItemId } },
    select: { id: true },
  });
  if (existing) return { ok: false, error: "You've already reviewed this item." };

  // Optional photo — saved before the DB write, rolled back if the write fails.
  let imagePath: string | undefined;
  try {
    if (d.image) imagePath = await saveReviewImage(d.image);
  } catch (e) {
    if (e instanceof ReviewFileError) return { ok: false, error: e.message, fieldErrors: { image: e.message } };
    return { ok: false, error: "Could not process the image. Please try again." };
  }

  try {
    await prisma.review.create({
      data: {
        productId: d.productId,
        customerId: uid,
        orderItemId: d.orderItemId,
        rating: d.rating,
        title: d.title ? d.title : null,
        comment: d.comment,
        images: imagePath ? [imagePath] : undefined,
        status: "PENDING",
      },
    });
  } catch (e) {
    if (imagePath) await deleteReviewImage(imagePath);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "You've already reviewed this item." };
    }
    return { ok: false, error: "Couldn't submit your review. Please try again." };
  }

  revalidatePath(`/dashboard/orders/${item.subOrder.order.orderNumber}`);
  return { ok: true };
}
