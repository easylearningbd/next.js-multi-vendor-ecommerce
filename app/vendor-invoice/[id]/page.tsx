import { notFound, redirect } from "next/navigation";
import { formatMoney } from "@/lib/shop/pricing";
import { getSessionVendorId, getVendorSubOrder } from "@/lib/vendor/orders";
import { VendorInvoiceActions } from "./AutoPrint";

// Scoped to the signed-in vendor's OWN sub-order — this vendor's portion only.
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});
const num = (d: { toString(): string }) => Number(d.toString());

export default async function VendorInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendorId = await getSessionVendorId();
  if (!vendorId) redirect(`/vendor/login?next=/vendor-invoice/${id}`);

  const sub = await getVendorSubOrder(id, vendorId);
  if (!sub) notFound();

  const paymentLabel = sub.order.paymentMethod === "COD" ? "Cash on Delivery" : "Card";

  return (
    <div className="min-h-screen bg-bg py-8 print:bg-white print:py-0">
      <style>{`@media print { @page { margin: 16mm; } .no-print { display: none !important; } }`}</style>

      <VendorInvoiceActions subOrderId={sub.id} />

      <div className="mx-auto max-w-[820px] bg-surface px-10 py-9 text-ink shadow-[0_1px_3px_rgba(20,18,31,0.08)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-6">
          <div>
            <div className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-iris-500">
              Covet
            </div>
            <div className="mt-1 font-sans text-[12px] text-muted">Seller invoice</div>
          </div>
          <div className="text-right">
            <div className="font-display text-[18px] font-bold text-ink">Invoice</div>
            <div className="mt-1 font-sans text-[13px] font-semibold text-ink-soft">
              {sub.order.orderNumber}
            </div>
            <div className="mt-0.5 font-sans text-[12px] text-muted">
              {DATE_FMT.format(sub.order.createdAt)}
            </div>
          </div>
        </div>

        {/* Seller / ship-to / payment */}
        <div className="grid grid-cols-1 gap-6 border-b border-line py-6 sm:grid-cols-3">
          <div>
            <div className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
              Seller
            </div>
            <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
              <div className="font-semibold text-ink">{sub.vendor.storeName}</div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
              Ship to
            </div>
            <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
              <div className="font-semibold text-ink">{sub.order.shipName}</div>
              <div>{sub.order.shipAddress}</div>
              <div>
                {sub.order.shipCity} {sub.order.shipZip}
              </div>
              <div>{sub.order.shipCountry}</div>
              <div className="mt-1 text-muted">{sub.order.shipPhone}</div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
              Payment
            </div>
            <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
              <div className="font-semibold text-ink">{paymentLabel}</div>
              <div className="text-muted">{sub.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</div>
              <div className="mt-1 text-muted">Status: {sub.status}</div>
            </div>
          </div>
        </div>

        {/* This vendor's line items */}
        <div className="py-5">
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
                      <div className="mt-0.5 text-[12px] text-muted">{item.variantLabel}</div>
                    )}
                  </td>
                  <td className="py-2.5 text-right text-ink-soft">{formatMoney(item.unitPrice)}</td>
                  <td className="py-2.5 text-right text-ink-soft">{item.qty}</td>
                  <td className="py-2.5 text-right font-semibold text-ink">
                    {formatMoney(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* This vendor's totals (NOT the order grand total) */}
        <div className="flex justify-end border-t border-line pt-6">
          <div className="w-[280px] font-sans text-[13px]">
            <div className="flex justify-between py-1 text-ink-soft">
              <span>Subtotal</span>
              <span>{formatMoney(sub.subtotal)}</span>
            </div>
            {num(sub.discount) > 0 && (
              <div className="flex justify-between py-1 text-ink-soft">
                <span>Discount{sub.coupon ? ` (${sub.coupon.code})` : ""}</span>
                <span className="text-success">−{formatMoney(sub.discount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-line pt-3 font-display text-[16px] font-bold text-ink">
              <span>Total</span>
              <span>{formatMoney(sub.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-5 text-center font-sans text-[12px] text-muted">
          This invoice covers {sub.vendor.storeName}&apos;s items in order {sub.order.orderNumber}.
        </div>
      </div>
    </div>
  );
}
