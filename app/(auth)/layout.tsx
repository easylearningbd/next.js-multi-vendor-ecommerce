import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePathForRole } from "@/lib/roles";

// Any authenticated user landing on an auth page is sent to their own area.
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(homePathForRole(session.user.role, session.user.vendorStatus));
  }
  return <>{children}</>;
}
