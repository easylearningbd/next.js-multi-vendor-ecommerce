import { z } from "zod";
import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME } from "@/lib/brand-validation";

// Re-export image constants so the form and upload handler share one source.
export { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME, IMAGE_ACCEPT_ATTR } from "@/lib/brand-validation";

// ── TIN certificate constraints (PDF or image, larger cap than product images) ──
export const MAX_CERT_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_CERT_MIME = ["application/pdf", ...ACCEPTED_IMAGE_MIME] as const;
/** For the certificate file input's `accept` attribute. */
export const CERT_ACCEPT_ATTR = ACCEPTED_CERT_MIME.join(",");

// ── Helpers ──
// A cleared text input arrives as "" (or an absent field as null) — treat either as
// "no value" (undefined) so the action can null the column instead of storing "".
const blankToUndefined = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;
// An unset file input arrives as a zero-byte File (or absent as null) — treat either
// as "keep existing".
const emptyFileToUndefined = (v: unknown) =>
  v == null || (v instanceof File && v.size === 0) ? undefined : v;

// ── Group A: User fields ──
const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be 60 characters or fewer");

// Uniqueness is enforced server-side against the session user (needs DB + auth) —
// this only validates shape.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

// Optional; format-checked only when provided (design marks Phone as not required).
const phoneSchema = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .regex(/^[+(]?[\d][\d\s()./-]{4,29}$/, "Enter a valid phone number")
    .optional(),
);

// ── Group B: Vendor (store) fields ──
const storeNameSchema = z
  .string()
  .trim()
  .min(2, "Store name must be at least 2 characters")
  .max(80, "Store name must be 80 characters or fewer");

const addressSchema = z.preprocess(
  blankToUndefined,
  z.string().trim().max(255, "Address must be 255 characters or fewer").optional(),
);

// Optional; when present, a lenient alphanumeric TIN (letters, digits, space, dash).
const tinNumberSchema = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{3,29}$/, "Enter a valid TIN number")
    .optional(),
);

// Optional; when present, must be a valid date that is today or in the future.
const tinExpireDateSchema = z.preprocess(
  blankToUndefined,
  z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
    .refine((v) => {
      const parsed = Date.parse(v);
      if (Number.isNaN(parsed)) return true; // handled by the previous refine
      const day = new Date(parsed);
      day.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return day.getTime() >= today.getTime();
    }, "Expiry date must be today or in the future")
    .optional(),
);

// Optional image (logo / cover). Omit to keep the existing file.
// NOTE: `file.type` is the client-reported MIME and is only a first-pass guard —
// the upload handler additionally sniffs magic bytes server-side.
const optionalImage = z.preprocess(
  emptyFileToUndefined,
  z
    .instanceof(File, { message: "Please choose an image file" })
    .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 2MB or smaller")
    .refine(
      (f) => (ACCEPTED_IMAGE_MIME as readonly string[]).includes(f.type),
      "Only JPG, PNG or WebP images are allowed",
    )
    .optional(),
);

// Optional TIN certificate (PDF or image, ≤5MB). Omit to keep the existing file.
const optionalCertificate = z.preprocess(
  emptyFileToUndefined,
  z
    .instanceof(File, { message: "Please choose a file" })
    .refine((f) => f.size <= MAX_CERT_BYTES, "File must be 5MB or smaller")
    .refine(
      (f) => (ACCEPTED_CERT_MIME as readonly string[]).includes(f.type),
      "Only PDF, JPG, PNG or WebP files are allowed",
    )
    .optional(),
);

// ── Composed schema: both groups save together in one submit ──
export const vendorProfileSchema = z.object({
  // Group A → User table
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  // Group B → Vendor table
  storeName: storeNameSchema,
  address: addressSchema,
  tinNumber: tinNumberSchema,
  tinExpireDate: tinExpireDateSchema,
  logo: optionalImage,
  coverImage: optionalImage,
  tinCertificate: optionalCertificate,
});

export type VendorProfileInput = z.infer<typeof vendorProfileSchema>;
