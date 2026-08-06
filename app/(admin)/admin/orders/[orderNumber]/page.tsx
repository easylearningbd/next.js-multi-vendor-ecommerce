import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { formatMoney } from "@/lib/shop/pricing";
import { deriveOrderStatus } from "@/lib/shop/tracking";
import { getAdminOrder } from "@/lib/admin/orders";
import { Icon } from "@/components/dashboard/Icon";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/orders/OrderStatusBadge";

export const metadata: Metadata = { title: "Order Details — Covet Admin" };
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const num = (d: { toString(): string }) => Number(d.toString());

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await requireRole("ADMIN", "/admin/login");

  const { orderNumber } = await params;
  const order = await getAdminOrder(orderNumber);
  if (!order) notFound();

  // Overall status is derived from the sub-orders (least-advanced seller) — the
  // parent Order.status is stale. Each vendor block shows its OWN live status.
  const overallStatus = deriveOrderStatus(order.subOrders.map((s) => s.status));
  const itemCount = order.subOrders.reduce(
    (n, s) => n + s.items.reduce((m, i) => m + i.qty, 0),
    0,
  );
  const paymentLabel = order.paymentMethod === "COD" ? "Cash on Delivery" : "Card";
  const customerEmail = order.customer?.email ?? order.shipEmail;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
              Order {order.orderNumber}
            </h1>
            <OrderStatusBadge status={overallStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          <div className="mt-2 font-sans text-[12.5px] text-muted-soft">
            {DATE_FMT.format(order.createdAt)} · {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
            {order.subOrders.length} {order.subOrders.length === 1 ? "seller" : "sellers"}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/orders"
            className="flex h-10 items-center gap-1.5 rounded-[11px] border border-line px-3.5 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
          >
            <Icon name="chevronLeft" size={14} strokeWidth={2.2} />
            All orders
          </Link>
          <a
            href={`/admin-invoice/${order.orderNumber}`}
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
        {/* Main: per-vendor sub-orders + totals */}
        <div className="flex flex-col gap-5">
          {order.subOrders.map((sub) => {
            const subItems = sub.items.reduce((n, i) => n + i.qty, 0);
            return (
              <div
                key={sub.id}
                className="overflow-hidden rounded-[16px] border border-line-soft bg-surface"
              >
                {/* Vendor header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft bg-bg-subtle px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 flex-none items-center justify-center overflow-hidden rounded-[11px] bg-iris-50 font-display text-[15px] font-bold text-iris-500">
                      {sub.vendor.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sub.vendor.logo} alt={sub.vendor.storeName} className="h-full w-full object-cover" />
                      ) : (
                        sub.vendor.storeName.charAt(0).toUpperCase()
                      )}
                    </span>
                    <div>
                      <Link
                        href={`/sellers/${sub.vendor.slug}`}
                        className="font-display text-[15px] font-bold text-ink hover:text-iris-500"
                      >
                        {sub.vendor.storeName}
                      </Link>
                      <div className="mt-0.5 font-sans text-[11.5px] text-muted-soft">
                        {subItems} {subItems === 1 ? "item" : "items"}
                        {sub.coupon ? ` · Coupon ${sub.coupon.code}` : ""}
                      </div>
                    </div>
                  </div>
                  <OrderStatusBadge status={sub.status} />
                </div>

                {/* Items */}
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

                {/* Sub-order totals */}
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
                    <span className="font-display text-sm font-bold text-ink">Seller total</span>
                    <span className="font-display text-base font-extrabold text-iris-500">
                      {formatMoney(sub.total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Order totals */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 font-display text-[15px] font-bold text-ink">Order Totals</div>
            <div className="flex flex-col gap-2 font-sans text-[13px]">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink">{formatMoney(order.subtotal)}</span>
              </div>
              {num(order.discount) > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Discount</span>
                  <span className="font-semibold text-success">−{formatMoney(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-ink">
                  {num(order.shipping) === 0 ? "Free" : formatMoney(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Tax</span>
                <span className="text-ink">{formatMoney(order.tax)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-line-soft pt-3">
                <span className="font-display text-[15px] font-bold text-ink">Grand Total</span>
                <span className="font-display text-[20px] font-extrabold text-iris-500">
                  {formatMoney(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Order info */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 font-display text-[15px] font-bold text-ink">Order Info</div>
            <div className="flex flex-col gap-3 font-sans text-[13px]">
              <InfoRow label="Order number" value={order.orderNumber} />
              <InfoRow label="Placed" value={DATE_FMT.format(order.createdAt)} />
              <div className="flex items-center justify-between">
                <span className="text-muted">Order status</span>
                <OrderStatusBadge status={overallStatus} />
              </div>
              <InfoRow label="Payment method" value={paymentLabel} />
              <div className="flex items-center justify-between">
                <span className="text-muted">Payment status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex items-baseline justify-between border-t border-line-soft pt-3">
                <span className="text-muted">Grand total</span>
                <span className="font-display text-[15px] font-bold text-ink">
                  {formatMoney(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <Icon name="user" size={17} strokeWidth={2} className="text-iris-500" />
              Customer
            </div>
            <div className="flex flex-col gap-2.5 font-sans text-[13px] text-muted">
              <div className="flex items-start gap-2.5">
                <Icon name="user" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span className="text-ink-soft">{order.customer?.name ?? order.shipName}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="mail" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span className="break-all">{customerEmail}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="phone" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span>{order.shipPhone}</span>
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
              <div className="font-semibold text-ink">{order.shipName}</div>
              <div>{order.shipAddress}</div>
              <div>
                {order.shipCity} {order.shipZip}
              </div>
              <div>{order.shipCountry}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="truncate font-semibold text-ink">{value}</span>
    </div>
  );
}
