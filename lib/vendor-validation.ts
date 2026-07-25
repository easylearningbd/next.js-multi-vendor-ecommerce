import { z } from "zod";
import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME } from "@/lib/brand-validation";

export { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME, IMAGE_ACCEPT_ATTR } from "@/lib/brand-validation";

// TIN certificate accepts PDF in addition to images (server sniffs magic bytes).
export const CERT_ACCEPT_ATTR = ["application/pdf", ...ACCEPTED_IMAGE_MIME].join(",");

const requiredImage = z
  .instanceof(File, { message: "Please choose an image" })
  .refine((f) => f.size > 0, "Please choose an image")
  .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 2MB or smaller")
  .refine(
    (f) => (ACCEPTED_IMAGE_MIME as readonly string[]).includes(f.type),
    "Only JPG, PNG or WebP images are allowed",
  );

const emptyFileToUndefined = (v: unknown) =>
  v instanceof File && v.size === 0 ? undefined : v;

const optionalCertificate = z.preprocess(
  emptyFileToUndefined,
  z
    .instanceof(File, { message: "Please choose a file" })
    .refine((f) => f.size <= MAX_IMAGE_BYTES, "File must be 2MB or smaller")
    .refine(
      (f) => f.type === "application/pdf" || (ACCEPTED_IMAGE_MIME as readonly string[]).includes(f.type),
      "Only PDF, JPG, PNG or WebP files are allowed",
    )
    .optional(),
);

export const addVendorSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(40),
    lastName: z.string().trim().min(1, "Last name is required").max(40),
    phone: z.string().trim().min(5, "Enter a valid phone number").max(30),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long").max(72),
    confirmPassword: z.string(),
    storeName: z.string().trim().min(2, "Shop name is required").max(60),
    address: z.string().trim().min(1, "Shop address is required").max(100),
    image: requiredImage,
    logo: requiredImage,
    coverImage: requiredImage,
    // Optional Business TIN section
    tinNumber: z.string().trim().max(60).optional().or(z.literal("")),
    tinExpireDate: z.string().trim().optional().or(z.literal("")),
    tinCertificate: optionalCertificate,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AddVendorInput = z.infer<typeof addVendorSchema>;
