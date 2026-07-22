import { requireRole } from "@/lib/guard";

// Guards /admin/dashboard (NOT /admin/login, which lives in the (auth) group).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN", "/admin/login");
  return <>{children}</>;
}
