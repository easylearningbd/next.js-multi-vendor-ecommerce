import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/dashboard/Icon";
import { formatMoney } from "@/lib/shop/pricing";
import { getConfirmationOrder } from "@/lib/shop/order";
import { ClearCart } from "./ClearCart";
import { ConfirmationActions } from "./ConfirmationActions";

// The order is read per-request and scoped to the signed-in customer.
export const dynamic = "force-dynamic";

const NEXT_STEPS = [
  {
    icon: "check" as const,
    title: "Order confirmed",
    body: "We've received your order and emailed you a confirmation.",
  },
  {
    icon: "box" as const,
    title: "Packed by each seller",
    body: "Every seller prepares and ships their part of your order separately.",
  },
  {
    icon: "truck" as const,
    title: "Out for delivery",
    body: "Have the exact cash amount ready — you pay when it arrives.",
  },
];

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=/order/confirmation/${orderNumber}`);
  }

  const order = await getConfirmationOrder(orderNumber, session.user.id);
  if (!order) notFound();

  const billingSame = !order.billName;

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] py-10 lg:py-14">
      <ClearCart />

      {/* ── Success hero ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-[560px] rounded-[22px] border border-line-soft bg-surface px-8 py-10 text-center shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
        <span className="mx-auto mb-[22px] flex size-20 items-center justify-center rounded-full bg-success-bg">
          <span className="flex size-[58px] items-center justify-center rounded-full bg-success text-white">
            <Icon name="check" size={30} strokeWidth={3} />
          </span>
        </span>
        <h1 className="font-display text-[26px] font-bold tracking-[-0.01em] text-ink">
          Thank you for your purchase!
        </h1>
        <p className="mx-auto mb-7 mt-3.5 max-w-[400px] font-sans text-sm leading-[1.6] text-muted">
          We&apos;ve received your order and will process it shortly. Track it any time
          from your order details — we&apos;ve also emailed your confirmation.
        </p>
        <ConfirmationActions orderNumber={order.orderNumber} />
      </div>

      {/* ── Body: items by seller + summary ──────────────────────── */}
      <div className="mx-auto mt-8 grid max-w-[1000px] grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {/* Per-seller breakdown — one card per vendor sub-order */}
          {order.subOrders.map((sub) => (
            <div
              key={sub.id}
              className="overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-[0_1px_2px_rgba(20,18,31,0.05)]"
            >
              <div className="flex items-center gap-3 border-b border-line-soft bg-field px-6 py-4">
                <span className="flex size-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface text-iris-500">
                  {sub.vendor.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sub.vendor.logo}
                      alt={sub.vendor.storeName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name="store" size={17} strokeWidth={1.9} />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
                    Sold by
                  </div>
                  <Link
                    href={`/sellers/${sub.vendor.slug}`}
                    className="font-display text-sm font-bold text-ink hover:text-iris-500"
                  >
                    {sub.vendor.storeName}
                  </Link>
                </div>
              </div>

              <div className="px-6">
                {sub.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0"
                  >
                    <div className="flex size-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-field text-muted-soft">
                      {item.product?.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.thumbnail}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
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
                        <div className="mt-1 font-sans text-[12px] text-muted">
                          {item.variantLabel}
                        </div>
                      )}
                      <div className="mt-1 font-sans text-[12px] text-muted">
                        {formatMoney(item.unitPrice)} × {item.qty}
                      </div>
                    </div>
                    <div className="flex-none font-display text-sm font-bold text-ink">
                      {formatMoney(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 border-t border-line-soft bg-field/60 px-6 py-3.5 font-sans text-[13px]">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatMoney(sub.subtotal)}</span>
                </div>
                {Number(sub.discount) > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>
                      Discount{sub.coupon ? ` · ${sub.coupon.code}` : ""}
                    </span>
                    <span className="font-semibold text-success">
                      −{formatMoney(sub.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-0.5">
                  <span className="font-semibold text-ink">Seller total</span>
                  <span className="font-display text-sm font-bold text-ink">
                    {formatMoney(sub.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* What happens next */}
          <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
            <h2 className="mb-4 font-display text-base font-bold text-ink">
              What happens next
            </h2>
            <ol className="flex flex-col gap-4">
              {NEXT_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3.5">
                  <span className="relative flex size-9 flex-none items-center justify-center rounded-full bg-iris-50 text-iris-500">
                    <Icon name={s.icon} size={17} strokeWidth={1.9} />
                    {i < NEXT_STEPS.length - 1 && (
                      <span className="absolute left-1/2 top-full h-4 w-px -translate-x-1/2 bg-line" />
                    )}
                  </span>
                  <div>
                    <div className="font-sans text-sm font-semibold text-ink">
                      {s.title}
                    </div>
                    <div className="mt-0.5 font-sans text-[13px] leading-[1.5] text-muted">
                      {s.body}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Summary rail ───────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
            <h2 className="mb-5 font-display text-[18px] font-bold text-ink">
              Order Summary
            </h2>
            <div className="flex flex-col gap-3 border-b border-line-soft pb-4 font-sans text-sm text-ink-soft">
              <div className="flex justify-between">
                <span>Sub total</span>
                <span className="font-semibold text-ink">{formatMoney(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-semibold text-success">
                    −{formatMoney(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-ink">
                  {Number(order.shipping) === 0 ? "Free" : formatMoney(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%)</span>
                <span className="font-semibold text-ink">{formatMoney(order.tax)}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between py-[18px]">
              <span className="font-display text-base font-semibold text-ink">Total</span>
              <span className="font-display text-[24px] font-extrabold text-iris-500">
                {formatMoney(order.grandTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-field px-4 py-3">
              <span className="flex items-center gap-2 font-sans text-[13px] font-medium text-ink-soft">
                <Icon name="cash" size={16} strokeWidth={1.9} className="text-iris-500" />
                Cash on Delivery
              </span>
              <span className="rounded-full bg-warning-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-warning">
                Unpaid
              </span>
            </div>
          </div>

          {/* Shipping details */}
          <div className="rounded-[18px] border border-line-soft bg-surface p-6 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
            <h2 className="mb-4 font-display text-base font-bold text-ink">
              Delivery details
            </h2>
            <div className="flex flex-col gap-2.5 font-sans text-[13px] leading-[1.5] text-muted">
              <div className="flex items-start gap-2.5">
                <Icon name="user" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span className="text-ink-soft">{order.shipName}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="pin" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span>
                  {order.shipAddress}, {order.shipCity} {order.shipZip}, {order.shipCountry}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="phone" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span>{order.shipPhone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="mail" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span>{order.shipEmail}</span>
              </div>
              {!billingSame && (
                <div className="mt-1 border-t border-line-soft pt-2.5 text-[12px]">
                  <span className="font-semibold text-ink-soft">Billing: </span>
                  {order.billName}, {order.billAddress}, {order.billCity} {order.billZip},{" "}
                  {order.billCountry}
                </div>
              )}
            </div>
          </div>

          <Link
            href="/"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface font-display text-sm font-bold text-ink transition-colors hover:border-iris-500 hover:text-iris-500"
          >
            <Icon name="chevronLeft" size={16} strokeWidth={2.2} />
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
