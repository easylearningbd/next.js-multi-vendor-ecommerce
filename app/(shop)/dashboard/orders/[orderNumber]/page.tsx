import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/dashboard/Icon";
import { formatMoney } from "@/lib/shop/pricing";
import { getConfirmationOrder } from "@/lib/shop/order";
import { isCancellable } from "@/lib/shop/customer-orders";
import { deriveOrderStatus } from "@/lib/shop/tracking";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/orders/OrderStatusBadge";
import { OrderTabs } from "@/components/dashboard/orders/OrderTabs";
import { OrderTimeline } from "@/components/dashboard/orders/OrderTimeline";
import { CancelOrderButton } from "@/components/dashboard/orders/CancelOrderButton";
import { OrderReviewsPanel } from "@/components/dashboard/orders/OrderReviewsPanel";

export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const num = (d: { toString(): string }) => Number(d.toString());

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/dashboard/orders/${orderNumber}`);

  // Scoped to this customer — someone else's (or a missing) order → 404.
  const order = await getConfirmationOrder(orderNumber, session.user.id);
  if (!order) notFound();

  const billingSame = !order.billName;
  const paymentLabel = order.paymentMethod === "COD" ? "Cash on Delivery" : "Card — Stripe";
  const itemCount = order.subOrders.reduce(
    (sum, s) => sum + s.items.reduce((n, i) => n + i.qty, 0),
    0,
  );
  const cancellable = isCancellable(order.status);
  // The order-level status shown to the customer is derived from the vendors'
  // sub-order statuses (the shared field vendors write), so their updates surface
  // here — the parent Order.status alone would be stale.
  const overallStatus = deriveOrderStatus(order.subOrders.map((s) => s.status));

  const infoRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between gap-4 py-2 font-sans text-[13.5px]">
      <span className="text-muted-soft">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );

  const summaryPanel = (
    <div className="flex flex-col gap-5">
      {/* Order info + shipping/billing */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line-soft bg-bg-subtle p-6">
          <div className="mb-2 font-display text-[15px] font-bold text-ink">Order Info</div>
          {infoRow("Payment status", <PaymentStatusBadge status={order.paymentStatus} />)}
          {infoRow("Payment method", paymentLabel)}
          {infoRow("Order status", <OrderStatusBadge status={overallStatus} />)}
        </div>
        <div className="rounded-2xl border border-line-soft p-6">
          <div className="mb-4 font-display text-sm font-bold text-ink">Shipping Address</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 font-sans text-[13.5px]">
            <span className="text-muted-soft">Name</span>
            <span className="text-ink">{order.shipName}</span>
            <span className="text-muted-soft">Phone</span>
            <span className="text-ink">{order.shipPhone}</span>
            <span className="text-muted-soft">City / Zip</span>
            <span className="text-ink">
              {order.shipCity}, {order.shipZip}
            </span>
            <span className="text-muted-soft">Address</span>
            <span className="text-ink">
              {order.shipAddress}, {order.shipCountry}
            </span>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="rounded-2xl border border-line-soft p-6">
        <div className="mb-4 font-display text-sm font-bold text-ink">Billing Address</div>
        {billingSame ? (
          <div className="flex min-h-[64px] items-center justify-center rounded-xl border border-dashed border-line font-sans text-[13px] font-medium text-muted-soft">
            Same as shipping address
          </div>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 font-sans text-[13.5px]">
            <span className="text-muted-soft">Name</span>
            <span className="text-ink">{order.billName}</span>
            <span className="text-muted-soft">City / Zip</span>
            <span className="text-ink">
              {order.billCity}, {order.billZip}
            </span>
            <span className="text-muted-soft">Address</span>
            <span className="text-ink">
              {order.billAddress}, {order.billCountry}
            </span>
          </div>
        )}
      </div>

      {/* Items grouped by seller + totals */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {order.subOrders.map((sub) => (
            <div
              key={sub.id}
              className="overflow-hidden rounded-2xl border border-line-soft"
            >
              {/* Vendor header */}
              <div className="flex items-center justify-between gap-3 border-b border-line-soft bg-field px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface text-iris-500">
                    {sub.vendor.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sub.vendor.logo}
                        alt={sub.vendor.storeName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Icon name="store" size={16} strokeWidth={1.9} />
                    )}
                  </span>
                  <div>
                    <div className="font-sans text-[9.5px] font-semibold uppercase tracking-[0.07em] text-muted">
                      Sold by
                    </div>
                    <Link
                      href={`/sellers/${sub.vendor.slug}`}
                      className="font-display text-[13.5px] font-bold text-ink hover:text-iris-500"
                    >
                      {sub.vendor.storeName}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <OrderStatusBadge status={sub.status} />
                  <Link
                    href={`/sellers/${sub.vendor.slug}`}
                    className="flex h-9 items-center rounded-[10px] bg-surface px-3.5 font-sans text-[12.5px] font-semibold text-ink-soft transition-colors hover:bg-iris-100 hover:text-accent-fg"
                  >
                    Visit store
                  </Link>
                </div>
              </div>

              {/* Items */}
              <div className="px-5">
                {sub.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 border-b border-line-soft py-3.5 last:border-b-0"
                  >
                    <div className="flex size-13 flex-none items-center justify-center overflow-hidden rounded-[10px] bg-field text-muted-soft">
                      {item.product?.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.thumbnail}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon name="image" size={18} strokeWidth={1.7} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.product?.slug ? (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="line-clamp-2 font-sans text-[13.5px] font-medium leading-[1.3] text-ink hover:text-iris-500"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <span className="line-clamp-2 font-sans text-[13.5px] font-medium leading-[1.3] text-ink">
                          {item.productName}
                        </span>
                      )}
                      {item.variantLabel && (
                        <div className="mt-1 font-sans text-[12px] text-muted">
                          {item.variantLabel}
                        </div>
                      )}
                      <div className="mt-1 font-sans text-[12px] text-muted-soft">
                        Unit {formatMoney(item.unitPrice)} · Qty {item.qty}
                      </div>
                    </div>
                    <div className="flex-none font-display text-[13.5px] font-bold text-ink">
                      {formatMoney(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-vendor subtotal */}
              <div className="flex flex-col gap-1 border-t border-line-soft bg-bg-subtle px-5 py-3 font-sans text-[13px]">
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
                <div className="flex justify-between pt-0.5">
                  <span className="font-semibold text-ink">Seller total</span>
                  <span className="font-display text-[13.5px] font-bold text-ink">
                    {formatMoney(sub.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order totals */}
        <div className="rounded-2xl border border-line-soft p-6 lg:sticky lg:top-24">
          {infoRow("Total items", itemCount)}
          <div className="flex justify-between border-t border-line-soft py-2 font-sans text-[13.5px]">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-ink">{formatMoney(order.subtotal)}</span>
          </div>
          {num(order.discount) > 0 && (
            <div className="flex justify-between py-2 font-sans text-[13.5px]">
              <span className="text-muted">Discount</span>
              <span className="text-success">−{formatMoney(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 font-sans text-[13.5px]">
            <span className="text-muted">Tax</span>
            <span className="text-ink">{formatMoney(order.tax)}</span>
          </div>
          <div className="flex justify-between py-2 font-sans text-[13.5px]">
            <span className="text-muted">Shipping</span>
            <span className="text-ink">
              {num(order.shipping) === 0 ? "Free" : formatMoney(order.shipping)}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between border-t border-line-soft pt-3.5">
            <span className="font-display text-[15px] font-bold text-ink">Total</span>
            <span className="font-display text-xl font-extrabold text-iris-500">
              {formatMoney(order.grandTotal)}
            </span>
          </div>
          {cancellable && <CancelOrderButton orderNumber={order.orderNumber} />}
        </div>
      </div>
    </div>
  );

  const trackPanel = <OrderTimeline status={overallStatus} createdAt={order.createdAt} />;

  const reviewsPanel = (
    <OrderReviewsPanel orderNumber={order.orderNumber} customerId={session.user.id} />
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
              Order {order.orderNumber}
            </h1>
            <OrderStatusBadge status={overallStatus} />
          </div>
          <div className="mt-2.5 font-sans text-[12.5px] text-muted-soft">
            {DATE_FMT.format(order.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/orders"
            className="flex h-10 items-center gap-1.5 rounded-[11px] border border-line px-3.5 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
          >
            <Icon name="chevronLeft" size={14} strokeWidth={2.2} />
            All orders
          </Link>
          <Link
            href={`/dashboard/track-order?order=${order.orderNumber}`}
            className="flex h-10 items-center gap-1.5 rounded-[11px] border border-line px-3.5 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
          >
            <Icon name="truck" size={15} strokeWidth={2} />
            Track order
          </Link>
          <a
            href={`/invoice/${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download invoice"
            className="flex size-10 items-center justify-center rounded-[11px] bg-iris-500 text-white transition-colors hover:bg-iris-600"
          >
            <Icon name="download" size={18} strokeWidth={2} />
          </a>
        </div>
      </div>

      <OrderTabs
        tabs={[
          { key: "summary", label: "Order summary" },
          { key: "track", label: "Track order" },
          { key: "reviews", label: "Reviews" },
        ]}
        panels={{ summary: summaryPanel, track: trackPanel, reviews: reviewsPanel }}
      />
    </div>
  );
}
