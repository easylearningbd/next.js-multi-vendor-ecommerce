import { z } from "zod";

/** Selectable countries (no data model for these — simple flat list). */
export const COUNTRIES = ["United States", "Canada", "United Kingdom"] as const;

export type ShippingMethodValue = "standard" | "express";

export const SHIPPING_METHODS: {
  value: ShippingMethodValue;
  label: string;
  eta: string;
  cents: number;
}[] = [
  { value: "standard", label: "Standard Delivery", eta: "3–5 business days", cents: 0 },
  { value: "express", label: "Express Delivery", eta: "1–2 business days", cents: 800 },
];

export function shippingCostCents(method: ShippingMethodValue): number {
  return SHIPPING_METHODS.find((m) => m.value === method)?.cents ?? 0;
}

/** One address (shipping or billing). Reused client-side (validate on advance)
 *  and server-side (placeOrder re-validates). */
export const addressSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(3, "Phone is required").max(40),
  email: z.string().trim().email("Enter a valid email"),
  country: z.string().trim().min(1, "Country is required").max(80),
  city: z.string().trim().min(1, "City is required").max(120),
  zip: z.string().trim().min(1, "Zip code is required").max(20),
  address: z.string().trim().min(1, "Address is required").max(500),
});

export type AddressInput = z.infer<typeof addressSchema>;

/** The full checkout details, validated server-side in placeOrder (Part 5). */
export const checkoutDetailsSchema = z
  .object({
    shipping: addressSchema,
    billingSame: z.boolean(),
    billing: addressSchema.nullish(),
    shippingMethod: z.enum(["standard", "express"]),
  })
  .superRefine((d, ctx) => {
    if (!d.billingSame) {
      const r = addressSchema.safeParse(d.billing);
      if (!r.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Complete the billing address",
          path: ["billing"],
        });
      }
    }
  });

export type CheckoutDetails = z.infer<typeof checkoutDetailsSchema>;

/** The client form shape (adds the display-only address type). */
export type CheckoutForm = {
  shipping: AddressInput;
  addressType: string;
  billingSame: boolean;
  billing: AddressInput;
  shippingMethod: ShippingMethodValue;
};

export function emptyAddress(): AddressInput {
  return {
    name: "",
    phone: "",
    email: "",
    country: COUNTRIES[0],
    city: "",
    zip: "",
    address: "",
  };
}

export function defaultCheckoutForm(contact?: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}): CheckoutForm {
  return {
    shipping: {
      ...emptyAddress(),
      name: contact?.name ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
    },
    addressType: "Home",
    billingSame: true,
    billing: emptyAddress(),
    shippingMethod: "standard",
  };
}
