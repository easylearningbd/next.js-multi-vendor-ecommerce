import { z } from "zod";

// ── Image constraints (single source of truth for client + server) ──
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"] as const;
/** For the file input's `accept` attribute. */
export const IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_MIME.join(",");

// ── Field schemas ──
const nameSchema = z
  .string()
  .trim()
  .min(2, "Brand name must be at least 2 characters")
  .max(60, "Brand name must be 60 characters or fewer");

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);

/**
 * Validates an uploaded image File. NOTE: `file.type` is the client-reported
 * MIME and MUST NOT be trusted on its own — the server upload handler
 * additionally sniffs the file's magic bytes (see uploadBrandImage). This schema
 * is the first-pass guard shared by client and server.
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

// ── Composed schemas ──

/** Create: image is required. */
export const brandCreateSchema = z.object({
  name: nameSchema,
  status: statusSchema,
  image: z.preprocess(emptyFileToUndefined, imageFileSchema),
});

/** Edit: image is optional (omit to keep the existing one). */
export const brandUpdateSchema = z.object({
  name: nameSchema,
  status: statusSchema,
  image: z.preprocess(emptyFileToUndefined, imageFileSchema.optional()),
});

export type BrandCreateInput = z.infer<typeof brandCreateSchema>;
export type BrandUpdateInput = z.infer<typeof brandUpdateSchema>;
export type BrandStatusValue = z.infer<typeof statusSchema>;
