import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatMoney } from "@/lib/shop/pricing";
import { Icon } from "@/components/dashboard/Icon";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/orders/OrderStatusBadge";
import { getSessionVendorId, getVendorSubOrder } from "@/lib/vendor/orders";
import { VendorStatusControl } from "@/components/vendor-orders/VendorStatusControl";

export const metadata: Metadata = { title: "Order Details — Covet Seller" };
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const num = (d: { toString(): string }) => Number(d.toString());

export default async function VendorOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendorId = await getSessionVendorId();
  if (!vendorId) redirect(`/vendor/login?next=/vendor/orders/${id}`);

  // Scoped to THIS vendor — another vendor's (or a missing) sub-order → 404.
  const sub = await getVendorSubOrder(id, vendorId);
  if (!sub) notFound();

  const itemCount = sub.items.reduce((n, i) => n + i.qty, 0);
  const paymentLabel = sub.order.paymentMethod === "COD" ? "Cash on Delivery" : "Card";

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
              Order {sub.order.orderNumber}
            </h1>
            <OrderStatusBadge status={sub.status} />
          </div>
          <div className="mt-2 font-sans text-[12.5px] text-muted-soft">
            {DATE_FMT.format(sub.order.createdAt)} · {itemCount} {itemCount === 1 ? "item" : "items"}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/vendor/orders"
            className="flex h-10 items-center gap-1.5 rounded-[11px] border border-line px-3.5 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
          >
            <Icon name="chevronLeft" size={14} strokeWidth={2.2} />
            All orders
          </Link>
          <a
            href={`/vendor-invoice/${sub.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-1.5 rounded-[11px] bg-iris-500 px-3.5 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            <Icon name="download" size={15} strokeWidth={2} />
            Invoice
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_340px]">
        {/* Items + totals (this vendor's portion only) */}
        <div className="overflow-hidden rounded-[16px] border border-line-soft bg-surface">
          <div className="border-b border-line-soft px-6 py-4 font-display text-[15px] font-bold text-ink">
            Your items ({itemCount})
          </div>
          <div className="px-6">
            {sub.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0"
              >
                <div className="flex size-16 flex-none items-center justify-center overflow-hidden rounded-xl bg-field text-muted-soft">
                  {item.product?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="image" size={20} strokeWidth={1.7} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {item.product?.slug ? (
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-2 font-sans text-sm font-medium leading-[1.35] text-ink hover:text-iris-500"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <span className="line-clamp-2 font-sans text-sm font-medium leading-[1.35] text-ink">
                      {item.productName}
                    </span>
                  )}
                  {item.variantLabel && (
                    <div className="mt-1 font-sans text-[12px] text-muted">{item.variantLabel}</div>
                  )}
                  <div className="mt-1 font-sans text-[12px] text-muted-soft">
                    {formatMoney(item.unitPrice)} × {item.qty}
                  </div>
                </div>
                <div className="flex-none font-display text-sm font-bold text-ink">
                  {formatMoney(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 border-t border-line-soft bg-bg-subtle px-6 py-4 font-sans text-[13px]">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="text-ink">{formatMoney(sub.subtotal)}</span>
            </div>
            {num(sub.discount) > 0 && (
              <div className="flex justify-between text-muted">
                <span>Discount{sub.coupon ? ` · ${sub.coupon.code}` : ""}</span>
                <span className="font-semibold text-success">−{formatMoney(sub.discount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-display text-sm font-bold text-ink">Your total</span>
              <span className="font-display text-lg font-extrabold text-iris-500">
                {formatMoney(sub.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Order & Shipping Info — status update */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 font-display text-[15px] font-bold text-ink">Order &amp; Shipping Info</div>

            <VendorStatusControl subOrderId={sub.id} currentStatus={sub.status} />

            <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-3.5 py-3">
              <span className="font-sans text-[13px] text-ink-soft">Payment</span>
              <span className="flex items-center gap-2 font-sans text-[12.5px] text-muted">
                {paymentLabel}
                <PaymentStatusBadge status={sub.order.paymentStatus} />
              </span>
            </div>

            <div className="mt-4 flex gap-2.5 rounded-xl border border-warning-bg bg-warning-bg/40 p-3.5">
              <Icon name="alert" size={15} strokeWidth={2} className="mt-0.5 flex-none text-warning" />
              <span className="font-sans text-[12px] leading-[1.5] text-warning">
                Deliver using the shipping option the customer selected at checkout.
              </span>
            </div>
          </div>

          {/* Customer information */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <Icon name="user" size={17} strokeWidth={2} className="text-iris-500" />
              Customer information
            </div>
            <div className="flex flex-col gap-2.5 font-sans text-[13px] text-muted">
              <div className="flex items-start gap-2.5">
                <Icon name="user" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span className="text-ink-soft">{sub.order.shipName}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="phone" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span>{sub.order.shipPhone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="mail" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span>{sub.order.shipEmail}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <Icon name="pin" size={17} strokeWidth={2} className="text-iris-500" />
              Shipping address
            </div>
            <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
              {sub.order.shipAddress}, {sub.order.shipCity} {sub.order.shipZip}, {sub.order.shipCountry}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
