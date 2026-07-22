import type { Role, VendorStatus } from "@prisma/client";

/**
 * Where a user should land after login, and where the wrong-area guard
 * should bounce them back to. Single source of truth for role → home path.
 */
export function homePathForRole(
  role: Role | undefined,
  vendorStatus?: VendorStatus | null,
): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "VENDOR":
      return vendorStatus === "APPROVED" ? "/vendor/dashboard" : "/vendor/pending";
    case "CUSTOMER":
      return "/dashboard";
    default:
      return "/login";
  }
}

/** Login page a given protected area should redirect unauthenticated users to. */
export function loginPathForArea(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin/login";
  if (pathname.startsWith("/vendor")) return "/vendor/login";
  return "/login";
}
