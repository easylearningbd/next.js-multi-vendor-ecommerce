"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { vendorProfileSchema } from "@/lib/vendor-profile-validation";
import {
  saveProfileImage,
  saveTinCertificate,
  deleteProfileFile,
  FileValidationError,
} from "@/lib/vendor-profile-upload";
import type { ActionResult } from "@/lib/vendor-types";

export type VendorProfileSaveResult = {
  logo: string | null;
  coverImage: string | null;
  hasTinCertificate: boolean;
};

/** Keep just the first zod message per field. */
function firstFieldErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

/**
 * Update the signed-in vendor's own profile: Group A → User, Group B → Vendor,
 * committed together in ONE transaction. The user id and vendor id come from the
 * SESSION only — never from the form — so a vendor can only ever edit their own row.
 */
export async function updateVendorProfile(
  _prev: ActionResult<VendorProfileSaveResult> | undefined,
  formData: FormData,
): Promise<ActionResult<VendorProfileSaveResult>> {
  // 1) Authn/authz — must be a signed-in VENDOR.
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  const userId = session.user.id;

  // 2) Resolve THIS vendor from the session's user id (never a hidden field).
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true, logo: true, coverImage: true, tinCertificate: true },
  });
  if (!vendor) {
    return { success: false, error: "Your store profile could not be found." };
  }

  // 3) Validate everything server-side.
  const parsed = vendorProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    storeName: formData.get("storeName"),
    address: formData.get("address"),
    tinNumber: formData.get("tinNumber"),
    tinExpireDate: formData.get("tinExpireDate"),
    logo: formData.get("logo"),
    coverImage: formData.get("coverImage"),
    tinCertificate: formData.get("tinCertificate"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  const d = parsed.data;

  // 4) Email must not collide with ANOTHER user's account.
  const clash = await prisma.user.findFirst({
    where: { email: d.email, NOT: { id: userId } },
    select: { id: true },
  });
  if (clash) {
    return {
      success: false,
      error: "That email is already in use.",
      fieldErrors: { email: "That email is already in use" },
    };
  }

  // 5) Persist any new files BEFORE the DB write. Track them so we can clean up on
  //    any later failure. Old files are deleted only AFTER a successful commit.
  const newlySaved: string[] = [];
  let newLogo: string | undefined;
  let newCover: string | undefined;
  let newCert: string | undefined;
  try {
    if (d.logo) {
      newLogo = await saveProfileImage(d.logo);
      newlySaved.push(newLogo);
    }
    if (d.coverImage) {
      newCover = await saveProfileImage(d.coverImage);
      newlySaved.push(newCover);
    }
    if (d.tinCertificate) {
      newCert = await saveTinCertificate(d.tinCertificate);
      newlySaved.push(newCert);
    }
  } catch (e) {
    await Promise.all(newlySaved.map(deleteProfileFile));
    if (e instanceof FileValidationError) return { success: false, error: e.message };
    return { success: false, error: "Could not process the uploaded files. Please try again." };
  }

  // Explicit image removal. A new upload always takes precedence over a remove flag.
  const removeLogo = !newLogo && formData.get("removeLogo") === "true";
  const removeCover = !newCover && formData.get("removeCoverImage") === "true";

  const userData: Prisma.UserUpdateInput = {
    name: d.name,
    email: d.email,
    phone: d.phone ?? null,
  };
  const vendorData: Prisma.VendorUpdateInput = {
    storeName: d.storeName,
    address: d.address ?? null,
    tinNumber: d.tinNumber ?? null,
    tinExpireDate: d.tinExpireDate ? new Date(d.tinExpireDate) : null,
    // File columns: a new upload overwrites, a remove flag clears, otherwise the
    // column is omitted (keep existing).
    ...(newLogo ? { logo: newLogo } : removeLogo ? { logo: null } : {}),
    ...(newCover ? { coverImage: newCover } : removeCover ? { coverImage: null } : {}),
    ...(newCert ? { tinCertificate: newCert } : {}),
  };

  // 6) Both tables update atomically — Group A can't commit if Group B fails.
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: userData });
      await tx.vendor.update({ where: { id: vendor.id }, data: vendorData });
    });
  } catch (e) {
    // Roll back the files we just wrote — the DB did not commit.
    await Promise.all(newlySaved.map(deleteProfileFile));
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        success: false,
        error: "That email is already in use.",
        fieldErrors: { email: "That email is already in use" },
      };
    }
    return { success: false, error: "Couldn't save your profile. Please try again." };
  }

  // 7) Commit succeeded — delete the PREVIOUS files that were just replaced/removed.
  const stale: (string | null)[] = [];
  if (newLogo || removeLogo) stale.push(vendor.logo);
  if (newCover || removeCover) stale.push(vendor.coverImage);
  if (newCert) stale.push(vendor.tinCertificate);
  await Promise.all(stale.map(deleteProfileFile));

  revalidatePath("/vendor/profile");
  return {
    success: true,
    data: {
      logo: newLogo ?? (removeLogo ? null : vendor.logo),
      coverImage: newCover ?? (removeCover ? null : vendor.coverImage),
      hasTinCertificate: Boolean(newCert ?? vendor.tinCertificate),
    },
  };
}
