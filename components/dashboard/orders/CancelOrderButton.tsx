"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@/components/dashboard/Icon";
import { cancelOrder } from "@/app/(shop)/dashboard/orders/actions";

/**
 * "Cancel Order" button for the details page — shown only when the order is
 * still cancellable. Opens a confirmation modal, calls the shared cancelOrder
 * action, then refreshes so the page reflects the CANCELED status.
 */
export function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  async function doCancel() {
    setPending(true);
    const res = await cancelOrder({ orderNumber });
    setPending(false);
    if (res.ok) {
      toast.success(`Order ${orderNumber} canceled`);
      setConfirm(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-[18px] h-[46px] w-full rounded-xl border border-[color:var(--color-error)]/25 bg-error-bg font-sans text-[13.5px] font-semibold text-error transition-[filter] hover:brightness-95"
      >
        Cancel Order
      </button>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,18,31,0.55)] p-6">
          <div className="w-full max-w-[420px] rounded-[20px] bg-surface p-7 text-center shadow-[0_40px_90px_-20px_rgba(20,18,31,0.5)]">
            <span className="mx-auto mb-5 flex size-[62px] items-center justify-center rounded-full bg-error-bg text-error">
              <Icon name="alert" size={28} strokeWidth={2} />
            </span>
            <h2 className="font-display text-[19px] font-bold text-ink">Cancel this order?</h2>
            <p className="mx-auto mt-2.5 max-w-[320px] font-sans text-sm leading-[1.5] text-muted">
              Order {orderNumber} will be canceled for every seller in it. This can&apos;t be
              undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirm(false)}
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
    </>
  );
}
