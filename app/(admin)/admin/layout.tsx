import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { SellerShell } from "@/components/dashboard/SellerShell";
import { adminNav } from "@/components/dashboard/navConfig";

// Persistent admin shell (icon-rail-less): header + sidebar render once here and
// stay mounted across navigation — only the page content in {children} swaps.
// Also guards the whole admin area (NOT /admin/login, which is in the (auth) group).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN", "/admin/login");
  const user = session.user;

  // Pending-vendor queue count → "Vendor Manage" sidebar badge.
  const pendingVendors = await prisma.vendor.count({ where: { status: "PENDING" } });

  return (
    <SellerShell
      variant="admin"
      userName={user.name ?? "Admin"}
      userEmail={user.email ?? ""}
      signOutTo="/admin/login"
      setupPercent={38}
      showSearch
      notifCount={12}
      nav={adminNav}
      showRail={false}
      badges={{ "Vendor Manage": pendingVendors }}
    >
      {children}
    </SellerShell>
  );
}
