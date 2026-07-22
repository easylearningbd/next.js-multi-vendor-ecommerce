import { z } from "zod";

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

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().max(60).optional().or(z.literal("")),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    newPassword: z.string().max(72).optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine((d) => !d.newPassword || d.newPassword.length >= 8, {
    message: "Password must be at least 8 characters long",
    path: ["newPassword"],
  })
  .refine((d) => !d.newPassword || d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type VendorRegisterInput = z.infer<typeof vendorRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
