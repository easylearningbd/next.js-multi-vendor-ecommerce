import type { Role, VendorStatus } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /** Shape returned by `authorize()` and carried onto the session. */
  interface User {
    role: Role;
    vendorId?: string | null;
    vendorStatus?: VendorStatus | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      vendorId: string | null;
      vendorStatus: VendorStatus | null;
    } & DefaultSession["user"];
  }
}

// JWT is declared in @auth/core/jwt and only re-exported by next-auth/jwt,
// so the augmentation must target the source module to merge correctly.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    vendorId: string | null;
    vendorStatus: VendorStatus | null;
  }
}
