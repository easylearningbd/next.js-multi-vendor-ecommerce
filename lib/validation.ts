import { z } from "zod";
import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME } from "@/lib/brand-validation";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password is too long");

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password,
});

export const vendorRegisterSchema = z
  .object({
    storeName: z.string().trim().min(2, "Store name is required").max(80),
    name: z.string().trim().min(2, "Please enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal("")),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

// An unset file input arrives as a zero-byte File (or absent as null) — treat
// either as "no new image" (keep the existing one).
const emptyImageToUndefined = (v: unknown) =>
  v == null || (v instanceof File && v.size === 0) ? undefined : v;

// Optional profile photo. `file.type` is the client-reported MIME and is only a
// first-pass guard — the upload handler additionally sniffs magic bytes.
const optionalProfileImage = z.preprocess(
  emptyImageToUndefined,
  z
    .instanceof(File, { message: "Please choose an image file" })
    .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 2MB or smaller")
    .refine(
      (f) => (ACCEPTED_IMAGE_MIME as readonly string[]).includes(f.type),
      "Only JPG, PNG or WebP images are allowed",
    )
    .optional(),
);

// Profile update (customer dashboard). Password is handled separately by the
// change-password flow. Email uniqueness is enforced server-side against the
// session user (needs DB + auth); this only checks shape.
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().max(60).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  image: optionalProfileImage,
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type VendorRegisterInput = z.infer<typeof vendorRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
