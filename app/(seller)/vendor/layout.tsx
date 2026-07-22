import { requireRole } from "@/lib/guard";

// Guards /vendor/dashboard and /vendor/pending (NOT /vendor/login|register,
// which live in the (auth) group). Per-page checks handle APPROVED vs PENDING.
export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("VENDOR", "/vendor/login");
  return <>{children}</>;
}
