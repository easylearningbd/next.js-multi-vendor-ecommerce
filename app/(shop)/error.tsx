"use client";

import { useEffect } from "react";
import { Icon } from "@/components/dashboard/Icon";

export default function ShopError({
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
    <div className="mx-auto flex max-w-[var(--container-max)] flex-col items-center justify-center gap-4 px-[var(--cpad)] py-28 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-error-bg text-error">
        <Icon name="alert" size={28} strokeWidth={1.9} />
      </span>
      <h1 className="font-display text-[22px] font-bold text-ink">
        Something went wrong.
      </h1>
      <p className="max-w-[420px] font-sans text-sm text-muted">
        We couldn&apos;t load the storefront just now. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="flex h-11 items-center gap-2 rounded-xl bg-iris-500 px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-iris-600"
      >
        <Icon name="refresh" size={16} strokeWidth={2} />
        Try again
      </button>
    </div>
  );
}
