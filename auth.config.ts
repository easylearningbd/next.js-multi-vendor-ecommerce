import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config shared by the middleware instance and the full
 * server instance (auth.ts). It MUST NOT import Prisma or bcrypt — middleware
 * runs on the edge runtime where those are unavailable. The Credentials
 * provider (which needs Prisma + bcrypt) is added only in auth.ts.
 *
 * The jwt/session callbacks here only copy fields off the `user` object that
 * `authorize()` already resolved on sign-in, so they stay edge-safe.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // `user` is only present on sign-in (returned by authorize()).
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.vendorId = user.vendorId ?? null;
        token.vendorStatus = user.vendorStatus ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.vendorId = token.vendorId;
        session.user.vendorStatus = token.vendorStatus;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
