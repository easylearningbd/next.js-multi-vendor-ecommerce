import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { formatMoney } from "@/lib/shop/pricing";
import { getConfirmationOrder } from "@/lib/shop/order";
import { InvoiceActions } from "./AutoPrint";

// Read per-request, scoped to the signed-in customer.
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

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

  const billingSame = !order.billName;
  const paymentLabel = order.paymentMethod === "COD" ? "Cash on Delivery" : "Card";

  return (
    <div className="min-h-screen bg-bg py-8 print:bg-white print:py-0">
      {/* Print-only page setup: no browser header/footer margins, clean sheet. */}
      <style>{`@media print { @page { margin: 16mm; } .no-print { display: none !important; } }`}</style>

      <InvoiceActions orderNumber={order.orderNumber} />

      <div className="mx-auto max-w-[820px] bg-surface px-10 py-9 text-ink shadow-[0_1px_3px_rgba(20,18,31,0.08)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-6">
          <div>
            <div className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-iris-500">
              Covet
            </div>
            <div className="mt-1 font-sans text-[12px] text-muted">
              Multi-vendor marketplace
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-[18px] font-bold text-ink">Invoice</div>
            <div className="mt-1 font-sans text-[13px] font-semibold text-ink-soft">
              {order.orderNumber}
            </div>
            <div className="mt-0.5 font-sans text-[12px] text-muted">
              {DATE_FMT.format(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Addresses + payment */}
        <div className="grid grid-cols-1 gap-6 border-b border-line py-6 sm:grid-cols-3">
          <div>
            <div className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
              Ship to
            </div>
            <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
              <div className="font-semibold text-ink">{order.shipName}</div>
              <div>{order.shipAddress}</div>
              <div>
                {order.shipCity} {order.shipZip}
              </div>
              <div>{order.shipCountry}</div>
              <div className="mt-1 text-muted">{order.shipPhone}</div>
              <div className="text-muted">{order.shipEmail}</div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
              Bill to
            </div>
            <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
              {billingSame ? (
                <div className="text-muted">Same as shipping address</div>
              ) : (
                <>
                  <div className="font-semibold text-ink">{order.billName}</div>
                  <div>{order.billAddress}</div>
                  <div>
                    {order.billCity} {order.billZip}
                  </div>
                  <div>{order.billCountry}</div>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
              Payment
            </div>
            <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
              <div className="font-semibold text-ink">{paymentLabel}</div>
              <div className="text-muted">
                {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
              </div>
              <div className="mt-1 text-muted">Status: {order.status}</div>
            </div>
          </div>
        </div>

        {/* Line items, grouped by seller */}
        {order.subOrders.map((sub) => (
          <div key={sub.id} className="border-b border-line py-5">
            <div className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-iris-500">
              Sold by {sub.vendor.storeName}
            </div>
            <table className="w-full border-collapse font-sans text-[13px]">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted">
                  <th className="pb-2 font-semibold">Item</th>
                  <th className="pb-2 text-right font-semibold">Unit</th>
                  <th className="pb-2 text-right font-semibold">Qty</th>
                  <th className="pb-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {sub.items.map((item) => (
                  <tr key={item.id} className="border-t border-line-soft align-top">
                    <td className="py-2.5 pr-3 text-ink">
                      <div className="font-medium">{item.productName}</div>
                      {item.variantLabel && (
                        <div className="mt-0.5 text-[12px] text-muted">
                          {item.variantLabel}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-ink-soft">
                      {formatMoney(item.unitPrice)}
                    </td>
                    <td className="py-2.5 text-right text-ink-soft">{item.qty}</td>
                    <td className="py-2.5 text-right font-semibold text-ink">
                      {formatMoney(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex flex-col items-end gap-1 font-sans text-[13px]">
              <div className="flex w-[220px] justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink">{formatMoney(sub.subtotal)}</span>
              </div>
              {Number(sub.discount) > 0 && (
                <div className="flex w-[220px] justify-between text-muted">
                  <span>Discount{sub.coupon ? ` (${sub.coupon.code})` : ""}</span>
                  <span className="text-success">−{formatMoney(sub.discount)}</span>
                </div>
              )}
              <div className="flex w-[220px] justify-between font-semibold text-ink">
                <span>Seller total</span>
                <span>{formatMoney(sub.total)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Grand totals */}
        <div className="flex justify-end pt-6">
          <div className="w-[280px] font-sans text-[13px]">
            <div className="flex justify-between py-1 text-ink-soft">
              <span>Sub total</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between py-1 text-ink-soft">
                <span>Discount</span>
                <span className="text-success">−{formatMoney(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 text-ink-soft">
              <span>Shipping</span>
              <span>
                {Number(order.shipping) === 0 ? "Free" : formatMoney(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-ink-soft">
              <span>Tax (15%)</span>
              <span>{formatMoney(order.tax)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-3 font-display text-[16px] font-bold text-ink">
              <span>Total</span>
              <span>{formatMoney(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-5 text-center font-sans text-[12px] text-muted">
          Thank you for shopping with Covet. This invoice was generated for order{" "}
          {order.orderNumber}.
        </div>
      </div>
    </div>
  );
}
