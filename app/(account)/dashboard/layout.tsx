import { requireRole } from "@/lib/guard";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("CUSTOMER", "/login");
  return <>{children}</>;
}
