"use client";

import { Icon } from "@/components/dashboard/Icon";

/**
 * Payment step. v1 offers a single method — Cash on Delivery. The schema's
 * paymentMethod enum (COD | STRIPE) leaves a seam for a Stripe card option here
 * later; for now COD is the only, pre-selected method.
 */
export function PaymentStep({
  note,
  onNoteChange,
  onBack,
}: {
  note: string;
  onNoteChange: (v: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-line-soft bg-surface p-7 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <div className="mb-[22px] flex items-center justify-between border-b border-line-soft pb-5">
        <h2 className="m-0 font-display text-[20px] font-bold text-ink">Payment method</h2>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 font-sans text-[13.5px] font-semibold text-iris-500 hover:text-iris-700"
        >
          <Icon name="chevronLeft" size={15} strokeWidth={2} />
          Go back
        </button>
      </div>

      {/* COD — the only method for now (pre-selected). */}
      <div className="flex items-center gap-3.5 rounded-xl border border-iris-500 bg-iris-50 p-4">
        <span className="flex size-[18px] flex-none items-center justify-center rounded-full border-2 border-iris-500">
          <span className="size-2 rounded-full bg-iris-500" />
        </span>
        <span className="flex size-10 flex-none items-center justify-center rounded-lg bg-surface text-iris-500">
          <Icon name="cash" size={20} strokeWidth={1.9} />
        </span>
        <div className="flex-1">
          <div className="font-sans text-sm font-semibold text-ink">Cash on Delivery</div>
          <div className="mt-1 font-sans text-[12.5px] text-muted">
            Pay in cash when your order is delivered to your doorstep.
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 font-sans text-[12.5px] leading-[1.5] text-muted">
        <Icon name="alert" size={15} strokeWidth={2} className="flex-none text-warning" />
        Please have the exact amount ready for the delivery agent.
      </div>

      <div className="mt-6">
        <label className="mb-2 block font-sans text-[13px] font-medium text-ink-soft">
          Order note <span className="font-normal text-muted-soft">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Delivery instructions, change to bring, etc."
          maxLength={1000}
          className="min-h-[80px] w-full resize-y rounded-[11px] border border-line px-3.5 py-3 font-sans text-sm leading-[1.5] text-ink outline-none focus:border-iris-500 focus:shadow-[0_0_0_3px_var(--color-iris-100)]"
        />
      </div>
    </div>
  );
}
