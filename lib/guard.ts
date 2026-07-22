import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { homePathForRole } from "@/lib/roles";

/**
 * Server-side role gate for protected layouts (defense in depth alongside
 * middleware). Redirects unauthenticated users to `loginPath` and users with
 * the wrong role to their own home, then returns the authenticated session.
 */
export async function requireRole(role: Role, loginPath: string) {
  const session = await auth();
  if (!session?.user) redirect(loginPath);
  if (session.user.role !== role) {
    redirect(homePathForRole(session.user.role, session.user.vendorStatus));
  }
  return session;
}
