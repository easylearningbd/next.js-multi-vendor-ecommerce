import { z } from "zod";

const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);

const optionalMoney = z.preprocess(
  emptyToUndef,
  z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Enter a valid amount")
    .refine((v) => v >= 0, "Must be 0 or more")
    .refine((v) => v <= 99999999.99, "Amount is too large")
    .optional(),
);

const optionalInt = z.preprocess(
  emptyToUndef,
  z.coerce
    .number()
    .refine((v) => Number.isInteger(v), "Must be a whole number")
    .refine((v) => v >= 1, "Must be at least 1")
    .refine((v) => v <= 1_000_000, "Too large")
    .optional(),
);

const dateStr = z
  .string()
  .min(1, "Date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date");

// `value` is optional at the field level (FREE_SHIPPING ignores it); superRefine below
// enforces it for PERCENTAGE/FIXED.
const optionalValue = z.preprocess(
  emptyToUndef,
  z.coerce.number().refine((v) => Number.isFinite(v), "Enter a valid value").optional(),
);

export const couponCoreSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(40, "Code is too long")
      .regex(/^[A-Za-z0-9._-]+$/, "Use letters, numbers, dot, dash or underscore only")
      .transform((s) => s.toUpperCase()),
    title: z.string().trim().min(2, "Title is required").max(120),
    type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
    value: optionalValue,
    scope: z.enum(["STORE_WIDE", "SPECIFIC_PRODUCTS"]),
    minSpend: optionalMoney,
    maxDiscount: optionalMoney,
    usageLimit: optionalInt,
    usageLimitPerUser: optionalInt,
    startsAt: dateStr,
    expiresAt: dateStr,
    isActive: z.boolean().default(true),
    productIds: z.array(z.string().min(1)).default([]),
  })
  .superRefine((d, ctx) => {
    // Value rules depend on the coupon type.
    if (d.type === "PERCENTAGE") {
      if (d.value == null || d.value <= 0)
        ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a percentage greater than 0" });
      else if (d.value > 100)
        ctx.addIssue({ code: "custom", path: ["value"], message: "Percentage can't exceed 100" });
    } else if (d.type === "FIXED") {
      if (d.value == null || d.value <= 0)
        ctx.addIssue({ code: "custom", path: ["value"], message: "Enter an amount greater than 0" });
    }
    // Expiry must be strictly after the start date.
    if (Date.parse(d.expiresAt) <= Date.parse(d.startsAt))
      ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiry must be after the start date" });
    // Specific-products coupons must attach at least one product.
    if (d.scope === "SPECIFIC_PRODUCTS" && d.productIds.length === 0)
      ctx.addIssue({ code: "custom", path: ["productIds"], message: "Select at least one product" });
  });

export type CouponCoreInput = z.infer<typeof couponCoreSchema>;
