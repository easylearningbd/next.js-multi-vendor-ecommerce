import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { getAdminOrder } from "@/lib/admin/orders";
import { OrderInvoice } from "@/components/invoice/OrderInvoice";
import { InvoiceActions } from "@/app/invoice/[orderNumber]/AutoPrint";

// Full-order invoice for admins — unscoped (oversight), ADMIN-guarded. Reuses the
// same OrderInvoice generator + print controls as the customer invoice.
export const dynamic = "force-dynamic";

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  await requireRole("ADMIN", "/admin/login");

  const order = await getAdminOrder(orderNumber);
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-bg py-8 print:bg-white print:py-0">
      <style>{`@media print { @page { margin: 16mm; } .no-print { display: none !important; } }`}</style>

      <InvoiceActions
        orderNumber={order.orderNumber}
        backHref={`/admin/orders/${order.orderNumber}`}
        backLabel="Back to order"
      />

      <OrderInvoice order={order} />
    </div>
  );
}
