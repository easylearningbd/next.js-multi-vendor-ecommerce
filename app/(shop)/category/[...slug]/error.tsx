"use client";

import { useEffect } from "react";
import { Icon } from "@/components/dashboard/Icon";

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] py-16">
      <div className="flex flex-col items-center rounded-[18px] border border-error/30 bg-surface px-8 py-[72px] text-center">
        <span className="mb-[22px] flex size-[78px] items-center justify-center rounded-[22px] bg-error-bg text-error">
          <Icon name="alert" size={36} strokeWidth={1.7} />
        </span>
        <div className="font-display text-[20px] font-bold text-ink">
          Couldn&apos;t load products
        </div>
        <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
          We couldn&apos;t load products right now. Check your connection and try
          again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 flex h-[46px] items-center gap-2 rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="refresh" size={16} strokeWidth={2} />
          Try again
        </button>
      </div>
    </div>
  );
}
