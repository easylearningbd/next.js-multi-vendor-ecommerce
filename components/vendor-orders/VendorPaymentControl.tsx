"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { PaymentStatusBadge } from "@/components/dashboard/orders/OrderStatusBadge";
import { updateSubOrderPayment } from "@/app/(seller)/vendor/(dashboard)/orders/actions";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

/**
 * Per-vendor payment control. Marking Paid is only offered once the sub-order is
 * DELIVERED; while paid, the vendor's `total` is their realized earning.
 */
export function VendorPaymentControl({
  subOrderId,
  status,
  paymentStatus,
  paidAt,
}: {
  subOrderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const paid = paymentStatus === "PAID";
  const canMarkPaid = status === "DELIVERED";

  async function set(next: boolean) {
    setPending(true);
    const res = await updateSubOrderPayment({ subOrderId, paid: next });
    setPending(false);
    if (res.ok) {
      toast.success(next ? "Payment marked as paid" : "Payment marked as unpaid");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="rounded-xl border border-line px-3.5 py-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[13px] text-ink-soft">Payment status</span>
        <PaymentStatusBadge status={paymentStatus} />
      </div>

      {paid ? (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="font-sans text-[12px] text-muted-soft">
            {paidAt ? `Paid on ${DATE_FMT.format(new Date(paidAt))}` : "Marked paid"}
          </span>
          <button
            type="button"
            onClick={() => set(false)}
            disabled={pending}
            className="font-sans text-[12px] font-semibold text-muted transition-colors hover:text-error disabled:opacity-60"
          >
            Mark unpaid
          </button>
        </div>
      ) : canMarkPaid ? (
        <button
          type="button"
          onClick={() => set(true)}
          disabled={pending}
          className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-iris-500 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Mark as paid"}
        </button>
      ) : (
        <p className="mt-2 font-sans text-[12px] leading-[1.5] text-muted-soft">
          You can mark this paid once the order is delivered.
        </p>
      )}
    </div>
  );
}
