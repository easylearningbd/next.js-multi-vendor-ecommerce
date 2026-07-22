"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteBrand, toggleBrandStatus } from "@/app/(admin)/admin/brands/actions";
import type { BrandListItem } from "@/lib/brand-types";
import { Icon } from "@/components/dashboard/Icon";
import { Dialog } from "./Dialog";

export function DeleteBrandDialog({
  open,
  onClose,
  brand,
  redirectTo,
}: {
  open: boolean;
  onClose: () => void;
  brand: BrandListItem;
  /** Where to go after a successful delete; defaults to refreshing in place. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const canDeactivate = brand.status === "ACTIVE";

  function onDelete() {
    setBlockedError(null);
    startTransition(async () => {
      const res = await deleteBrand(brand.id);
      if (res.success) {
        toast.success(`Deleted “${brand.name}”`);
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
          onClose();
        }
      } else {
        // Protection message (products reference it) stays in the dialog.
        setBlockedError(res.error ?? "Couldn't delete this brand.");
      }
    });
  }

  function onDeactivate() {
    startTransition(async () => {
      const res = await toggleBrandStatus(brand.id);
      if (res.success) {
        toast.success(`Deactivated “${brand.name}”`);
        router.refresh();
        onClose();
      } else {
        toast.error(res.error ?? "Couldn't deactivate this brand.");
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Delete brand" maxWidth="max-w-[480px]">
      <div className="flex flex-col">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-error-bg text-error">
            <Icon name="trash" size={22} strokeWidth={2} />
          </span>
          <div>
            <p className="font-sans text-[14.5px] leading-[1.5] text-ink">
              Delete <span className="font-semibold">“{brand.name}”</span>?
            </p>
            <p className="mt-1.5 font-sans text-[13px] leading-[1.6] text-muted">
              This permanently removes the brand and its image. This action can&apos;t be undone.
            </p>
          </div>
        </div>

        {blockedError && (
          <div className="mt-4 rounded-md border border-warning/30 bg-warning-bg px-4 py-3 font-sans text-[13px] leading-[1.5] text-warning">
            {blockedError}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[46px] rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-field"
          >
            Cancel
          </button>
          {blockedError && canDeactivate && (
            <button
              type="button"
              onClick={onDeactivate}
              disabled={pending}
              className="h-[46px] rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-field disabled:opacity-70"
            >
              Deactivate instead
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="flex h-[46px] items-center gap-2 rounded-md bg-error px-6 font-display text-[13.5px] font-bold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {pending ? "Deleting…" : "Delete brand"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
