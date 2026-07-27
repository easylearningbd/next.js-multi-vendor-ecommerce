import { z } from "zod";

// Product images reuse the shared image constants (jpg/png/webp, ≤2MB). Files are
// validated in the upload handler (magic bytes); this schema covers scalars + variations.
export { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_MIME, IMAGE_ACCEPT_ATTR } from "@/lib/brand-validation";

const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);

// ── Money / number helpers (all money persists as Decimal; here we validate shape) ──
const requiredPrice = z.coerce
  .number()
  .refine((v) => Number.isFinite(v), "Enter a valid price")
  .refine((v) => v >= 0.01, "Price must be greater than 0")
  .refine((v) => v <= 99999999.99, "Price is too large");

const optionalAmount = z.preprocess(
  emptyToUndef,
  z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Enter a valid amount")
    .refine((v) => v >= 0, "Amount can't be negative")
    .refine((v) => v <= 99999999.99, "Amount is too large")
    .optional(),
);

const optionalPercent = z.preprocess(
  emptyToUndef,
  z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Enter a valid number")
    .refine((v) => v >= 0 && v <= 100, "Must be between 0 and 100")
    .optional(),
);

const stockInt = z.coerce
  .number()
  .refine((v) => Number.isInteger(v), "Stock must be a whole number")
  .refine((v) => v >= 0, "Stock can't be negative")
  .refine((v) => v <= 1_000_000, "Stock is too large");

const optionalText = (max: number) =>
  z.preprocess(emptyToUndef, z.string().trim().max(max).optional());

// ── Variation (one generated attribute-combination row) ──
export const variationSchema = z.object({
  name: z.string().trim().min(1, "Variation name is required").max(120),
  attributes: z.record(z.string(), z.string()), // { Color: "Red", Size: "M" }
  price: requiredPrice,
  stock: stockInt,
  sku: optionalText(60),
  // A client index into the FormData variation-image files (varImage_<i>); the file
  // itself is validated + saved server-side. -1 / undefined = no image.
  imageIndex: z.coerce.number().int().optional(),
});

// ── Product core (scalars + variation array). Images handled separately. ──
export const productCoreSchema = z
  .object({
    name: z.string().trim().min(2, "Product name is required").max(150),
    shortDescription: optionalText(300),
    description: z.string().trim().min(1, "Description is required").max(20000),
    sku: optionalText(60),

    categoryId: z.string().min(1, "Category is required"),
    subCategoryId: optionalText(191),
    subSubCategoryId: optionalText(191),
    brandId: optionalText(191),

    price: requiredPrice,
    compareAtPrice: optionalAmount,
    discount: optionalAmount,
    discountType: z.enum(["AMOUNT", "PERCENT"]).default("AMOUNT"),
    taxRate: optionalPercent,
    stock: stockInt,

    metaTitle: optionalText(200),
    metaDescription: optionalText(500),

    hasVariations: z.boolean().default(false),
    variations: z.array(variationSchema).default([]),
  })
  .refine((d) => !d.hasVariations || d.variations.length > 0, {
    message: "Add at least one variation, or turn variations off.",
    path: ["variations"],
  })
  .refine(
    (d) => !d.compareAtPrice || d.compareAtPrice > d.price,
    { message: "Compare-at price should be higher than the price.", path: ["compareAtPrice"] },
  );

export type ProductCoreInput = z.infer<typeof productCoreSchema>;
export type VariationInput = z.infer<typeof variationSchema>;
