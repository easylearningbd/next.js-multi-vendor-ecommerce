"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { OrderStatus } from "@prisma/client";
import { Icon } from "@/components/dashboard/Icon";
import { ALLOWED_TRANSITIONS } from "@/lib/vendor/orders";
import { updateSubOrderStatus } from "@/app/(seller)/vendor/(dashboard)/orders/actions";

const LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKAGING: "Packaging",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
  RETURNED: "Returned",
  FAILED_TO_DELIVER: "Failed to deliver",
};

export function VendorStatusControl({
  subOrderId,
  currentStatus,
}: {
  subOrderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const nextOptions = ALLOWED_TRANSITIONS[currentStatus];
  const terminal = nextOptions.length === 0;
  const [selected, setSelected] = useState<OrderStatus>(currentStatus);
  const [pending, setPending] = useState(false);

  async function handleUpdate() {
    if (selected === currentStatus) return;
    setPending(true);
    const res = await updateSubOrderStatus({ subOrderId, status: selected });
    setPending(false);
    if (res.ok) {
      toast.success(`Status updated to ${LABEL[res.status]}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  if (terminal) {
    return (
      <div>
        <div className="mb-2 font-sans text-[12.5px] font-semibold text-ink-soft">Order Status</div>
        <div className="rounded-xl border border-line bg-bg-subtle px-3.5 py-3 font-sans text-[13px] text-muted">
          This order is <span className="font-semibold text-ink">{LABEL[currentStatus]}</span> — a
          terminal state, so no further status changes are possible.
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="order-status" className="mb-2 block font-sans text-[12.5px] font-semibold text-ink-soft">
        Change Order Status
      </label>
      <div className="relative">
        <select
          id="order-status"
          value={selected}
          onChange={(e) => setSelected(e.target.value as OrderStatus)}
          className="h-11 w-full appearance-none rounded-xl border border-line bg-bg-subtle py-0 pl-3.5 pr-10 font-sans text-[13.5px] text-ink outline-none focus:border-iris-500 focus:shadow-[0_0_0_3px_var(--color-iris-100)]"
        >
          <option value={currentStatus}>{LABEL[currentStatus]} (current)</option>
          {nextOptions.map((s) => (
            <option key={s} value={s}>
              {LABEL[s]}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-soft"
        />
      </div>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={pending || selected === currentStatus}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-iris-500 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Updating…" : "Update Status"}
      </button>
    </div>
  );
}
