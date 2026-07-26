"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";
import { changePasswordSchema } from "@/lib/change-password-validation";
import type { ActionResult } from "@/lib/vendor-types";

/** Keep just the first zod message per field. */
function firstFieldErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

/**
 * Change the signed-in vendor's OWN password. The user id comes from the session
 * only — never from the form — so a vendor can only ever change their own password.
 * On success the current session is invalidated (server-side sign-out) so the new
 * password must be used to sign in again. No password is ever logged.
 */
export async function changeVendorPassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  // 1) Authn/authz — must be a signed-in VENDOR.
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const userId = session.user.id;

  // 2) Validate shape + cross-field rules.
  const parsed = changePasswordSchema.safeParse({
    oldPassword: formData.get("oldPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  const { oldPassword, newPassword } = parsed.data;

  // 3) Load the user and verify the CURRENT password against the stored hash.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    return { success: false, error: "Your account could not be found." };
  }

  const currentMatches = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!currentMatches) {
    // Reveal nothing beyond "the current password you typed is wrong".
    return {
      success: false,
      error: "Current password is incorrect.",
      fieldErrors: { oldPassword: "Current password is incorrect" },
    };
  }

  // 4) Hash and store the new password.
  const passwordHash = await bcrypt.hash(newPassword, 12);
  try {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  } catch {
    return { success: false, error: "Couldn't update your password. Please try again." };
  }

  // 5) Invalidate the session (server-side). The client redirects to /vendor/login.
  await signOut({ redirect: false });

  return { success: true };
}
