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

  // Pending queue counts → sidebar group badges. Orders use the same rule the list
  // filter will use: an order counts as "Pending" if ANY of its sub-orders is PENDING
  // (sub-order status is the live fulfillment truth; the parent Order.status is stale).
  const [pendingVendors, pendingProducts, pendingOrders, pendingReviews] = await Promise.all([
    prisma.vendor.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { approvalStatus: "PENDING" } }),
    prisma.order.count({ where: { subOrders: { some: { status: "PENDING" } } } }),
    prisma.review.count({ where: { status: "PENDING" } }),
  ]);

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
      badges={{
        "Vendor Manage": pendingVendors,
        "Product Manage": pendingProducts,
        "Order Manage": pendingOrders,
        "Review Manage": pendingReviews,
      }}
    >
      {children}
    </SellerShell>
  );
}
