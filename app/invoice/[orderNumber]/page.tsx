import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getConfirmationOrder } from "@/lib/shop/order";
import { OrderInvoice } from "@/components/invoice/OrderInvoice";
import { InvoiceActions } from "./AutoPrint";

// Read per-request, scoped to the signed-in customer.
export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=/invoice/${orderNumber}`);
  }

  const order = await getConfirmationOrder(orderNumber, session.user.id);
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-bg py-8 print:bg-white print:py-0">
      {/* Print-only page setup: no browser header/footer margins, clean sheet. */}
      <style>{`@media print { @page { margin: 16mm; } .no-print { display: none !important; } }`}</style>

      <InvoiceActions orderNumber={order.orderNumber} />

      <OrderInvoice order={order} />
    </div>
  );
}
