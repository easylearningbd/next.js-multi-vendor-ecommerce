"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@/components/dashboard/Icon";
import { formatMoney } from "@/lib/shop/pricing";
import type { CustomerOrderSummary } from "@/lib/shop/customer-orders";
import { cancelOrder, hideOrder } from "@/app/(shop)/dashboard/orders/actions";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function sellerLine(names: string[]): string {
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

export function OrderCard({ order }: { order: CustomerOrderSummary }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [pending, setPending] = useState(false);

  async function doCancel() {
    setPending(true);
    const res = await cancelOrder({ orderNumber: order.orderNumber });
    setPending(false);
    if (res.ok) {
      toast.success(`Order ${order.orderNumber} canceled`);
      setConfirmCancel(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function doHide() {
    setMenuOpen(false);
    const res = await hideOrder({ orderNumber: order.orderNumber });
    if (res.ok) {
      toast.success("Order hidden from your list");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  const detailsHref = `/dashboard/orders/${order.orderNumber}`;

  return (
    <div className="relative rounded-2xl border border-line-soft bg-surface p-5 transition-shadow hover:shadow-[0_12px_30px_-16px_rgba(20,18,31,0.20)]">
      <div className="flex items-start gap-4">
        <span className="flex size-[60px] flex-none items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
          <Icon name="bag" size={28} strokeWidth={1.7} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <Link
              href={detailsHref}
              className="font-display text-base font-bold text-ink hover:text-iris-500"
            >
              Order {order.orderNumber}
            </Link>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>

          <div className="mt-2.5 font-sans text-[13px] text-ink-soft">
            <span className="font-bold text-iris-500">{order.itemCount}</span>{" "}
            {order.itemCount === 1 ? "Product" : "Products"}
          </div>
          <div className="mt-2 font-sans text-[12.5px] text-muted-soft">
            {DATE_FMT.format(order.createdAt)}
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-line-soft pt-3 font-sans text-[12px] text-muted">
            <Icon name="store" size={14} strokeWidth={2} className="flex-none text-iris-400" />
            Sold by <span className="font-semibold text-ink">{sellerLine(order.sellerNames)}</span>
          </div>
        </div>

        <div className="flex-none text-right">
          <div className="font-display text-lg font-extrabold text-ink">
            {formatMoney(order.grandTotal)}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Order actions"
            aria-expanded={menuOpen}
            className="mt-3 inline-flex size-[34px] items-center justify-center rounded-[9px] bg-field text-muted transition-colors hover:bg-iris-100 hover:text-accent-fg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Actions dropdown */}
      {menuOpen && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-5 top-[58px] z-20 w-[236px] rounded-[14px] border border-line-soft bg-surface p-1.5 shadow-[0_20px_48px_-14px_rgba(20,18,31,0.28)]">
            <a
              href={`/invoice/${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between gap-4 rounded-[10px] px-4 py-2.5 font-sans text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-iris-50 hover:text-iris-500"
            >
              Download Invoice
              <Icon name="download" size={16} strokeWidth={2} />
            </a>
            <Link
              href={detailsHref}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between gap-4 rounded-[10px] px-4 py-2.5 font-sans text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-iris-50 hover:text-iris-500"
            >
              View Order Details
              <Icon name="eye" size={16} strokeWidth={2} className="text-iris-500" />
            </Link>
            {order.cancellable && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmCancel(true);
                }}
                className="flex w-full items-center justify-between gap-4 rounded-[10px] px-4 py-2.5 font-sans text-[13.5px] font-medium text-error transition-colors hover:bg-error-bg"
              >
                Cancel Order
                <Icon name="x" size={16} strokeWidth={2.2} />
              </button>
            )}
            <button
              type="button"
              onClick={doHide}
              className="flex w-full items-center justify-between gap-4 rounded-[10px] px-4 py-2.5 font-sans text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-field"
            >
              Hide from my list
              <Icon name="eyeOff" size={16} strokeWidth={2} />
            </button>
          </div>
        </>
      )}

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,18,31,0.55)] p-6">
          <div className="w-full max-w-[420px] rounded-[20px] bg-surface p-7 text-center shadow-[0_40px_90px_-20px_rgba(20,18,31,0.5)]">
            <span className="mx-auto mb-5 flex size-[62px] items-center justify-center rounded-full bg-error-bg text-error">
              <Icon name="alert" size={28} strokeWidth={2} />
            </span>
            <h2 className="font-display text-[19px] font-bold text-ink">Cancel this order?</h2>
            <p className="mx-auto mt-2.5 max-w-[320px] font-sans text-sm leading-[1.5] text-muted">
              Order {order.orderNumber} will be canceled for every seller in it. This can&apos;t
              be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                disabled={pending}
                className="h-11 flex-1 rounded-xl border border-line bg-surface font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-field disabled:opacity-60"
              >
                Keep order
              </button>
              <button
                type="button"
                onClick={doCancel}
                disabled={pending}
                className="h-11 flex-1 rounded-xl bg-error font-sans text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Canceling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
