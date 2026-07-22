import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { homePathForRole } from "@/lib/roles";

// Edge-safe instance: authConfig has no Prisma/bcrypt, so this runs on the edge.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const vendorStatus = session?.user?.vendorStatus ?? null;
  const path = nextUrl.pathname;

  const to = (p: string) => NextResponse.redirect(new URL(p, nextUrl));
  const home = () => to(homePathForRole(role, vendorStatus));

  // ── Customer area ──────────────────────────────
  if (path.startsWith("/dashboard")) {
    if (!isLoggedIn) return to("/login");
    if (role !== "CUSTOMER") return home();
  }

  // ── Vendor dashboard (VENDOR + APPROVED) ───────
  if (path.startsWith("/vendor/dashboard")) {
    if (!isLoggedIn) return to("/vendor/login");
    if (role !== "VENDOR") return home();
    if (vendorStatus !== "APPROVED") return to("/vendor/pending");
  }

  // ── Vendor pending screen (VENDOR, not yet approved) ──
  if (path === "/vendor/pending") {
    if (!isLoggedIn) return to("/vendor/login");
    if (role !== "VENDOR") return home();
    if (vendorStatus === "APPROVED") return to("/vendor/dashboard");
  }

  // ── Admin area (everything under /admin except the login) ──
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!isLoggedIn) return to("/admin/login");
    if (role !== "ADMIN") return home();
  }

  return NextResponse.next();
});

export const config = {
  // Run on protected areas only; skips /login, /register, api, and static assets.
  matcher: ["/dashboard/:path*", "/vendor/:path*", "/admin/:path*"],
};
