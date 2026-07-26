import { z } from "zod";

// Shared by the client form (UX) and the server action (source of truth).
// NOTE: whether oldPassword is actually correct is verified server-side with
// bcrypt against the stored hash — this schema only checks shape + cross-field rules.
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(72, "New password is too long"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  // New password and its confirmation must match.
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  })
  // Reject "changing" to the same password (only meaningful when both are present).
  .refine((d) => !(d.oldPassword && d.newPassword) || d.newPassword !== d.oldPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
