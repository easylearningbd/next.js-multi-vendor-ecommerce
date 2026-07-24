import { z } from "zod";
import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME } from "@/lib/brand-validation";

// Re-export the shared image constants so category UI/actions import from one place.
export { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME, IMAGE_ACCEPT_ATTR } from "@/lib/brand-validation";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be 60 characters or fewer");

const requiredId = (label: string) =>
  z.string().trim().min(1, `Please select a ${label}`);

/**
 * Category image (OPTIONAL at both create and edit). `file.type` is the
 * client-reported MIME and is only a first-pass guard — the server upload
 * handler additionally sniffs magic bytes (see Step 4 / brand-upload pattern).
 */
const imageFileSchema = z
  .instanceof(File, { message: "Please choose an image file" })
  .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 2MB or smaller")
  .refine(
    (f) => (ACCEPTED_IMAGE_MIME as readonly string[]).includes(f.type),
    "Only JPG, PNG or WebP images are allowed",
  );

// An unset file input arrives as a zero-byte File — treat that as "no image".
const emptyFileToUndefined = (v: unknown) =>
  v instanceof File && v.size === 0 ? undefined : v;

const optionalImage = z.preprocess(emptyFileToUndefined, imageFileSchema.optional());

// ── Category: name + optional image ──
export const categorySchema = z.object({
  name: nameSchema,
  image: optionalImage,
});

// ── Sub-Category: name + required parent category ──
export const subCategorySchema = z.object({
  name: nameSchema,
  categoryId: requiredId("category"),
});

// ── Sub-Sub-Category: name + required category + required sub-category ──
// (subCategoryId must actually belong to categoryId — enforced server-side.)
export const subSubCategorySchema = z.object({
  name: nameSchema,
  categoryId: requiredId("category"),
  subCategoryId: requiredId("sub-category"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type SubCategoryInput = z.infer<typeof subCategorySchema>;
export type SubSubCategoryInput = z.infer<typeof subSubCategorySchema>;
