"use client";

import { Icon } from "@/components/dashboard/Icon";

export default function VendorTransactionReportError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[18px] border border-line-soft bg-surface px-8 py-16 text-center">
      <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-error-bg text-error">
        <Icon name="alert" size={34} strokeWidth={1.7} />
      </span>
      <div className="font-display text-[20px] font-bold text-ink">Couldn&apos;t load report</div>
      <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
        Something went wrong while building your transaction report. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
      >
        <Icon name="refresh" size={16} strokeWidth={2} />
        Try again
      </button>
    </div>
  );
}
