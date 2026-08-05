import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { SellerShell } from "@/components/dashboard/SellerShell";

// Persistent shell for the APPROVED vendor dashboard. Renders the header +
// sidebar ONCE; child pages (dashboard, profile, …) swap only the main content.
// Pending/suspended vendors never reach here — they're sent to /vendor/pending,
// which lives OUTSIDE this group and stays shell-less.
export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("VENDOR", "/vendor/login");
  const user = session.user;
  if (user.vendorStatus !== "APPROVED") redirect("/vendor/pending");

  // Pending sub-orders needing this vendor's action → the "Order Manage" badge.
  const pendingOrders = await prisma.subOrder.count({
    where: { vendor: { userId: user.id }, status: "PENDING" },
  });

  return (
    <SellerShell
      variant="vendor"
      userName={user.name ?? "Seller"}
      userEmail={user.email ?? ""}
      signOutTo="/vendor/login"
      setupPercent={20}
      notifCount={1}
      profileHref="/vendor/profile"
      changePasswordHref="/vendor/change-password"
      badges={{ "Order Manage": pendingOrders }}
    >
      {children}
    </SellerShell>
  );
}
