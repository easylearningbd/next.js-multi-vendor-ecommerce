"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { VendorStatus } from "@prisma/client";
import { approveVendor, suspendVendor } from "@/app/(admin)/admin/vendors/actions";
import { Icon } from "@/components/dashboard/Icon";
import { Dialog } from "@/components/brands/Dialog";

export function VendorDetailActions({
  vendorId,
  storeName,
  status,
}: {
  vendorId: string;
  storeName: string;
  status: VendorStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  function approve() {
    startTransition(async () => {
      const res = await approveVendor(vendorId);
      if (res.success) {
        toast.success(`${storeName} approved`);
        router.refresh();
      } else {
        toast.error(res.error ?? "Couldn't approve this vendor.");
      }
    });
  }

  function suspend() {
    startTransition(async () => {
      const res = await suspendVendor(vendorId);
      if (res.success) {
        toast.success(`${storeName} suspended`);
        router.refresh();
        setConfirmSuspend(false);
      } else {
        toast.error(res.error ?? "Couldn't suspend this vendor.");
      }
    });
  }

  // Approve = PENDING/SUSPENDED → APPROVED.  Suspend = APPROVED → SUSPENDED.
  const canApprove = status !== "APPROVED";
  const canSuspend = status === "APPROVED";

  return (
    <>
      <div className="flex flex-none flex-wrap items-center gap-2.5">
        {canApprove && (
          <button
            type="button"
            onClick={approve}
            disabled={pending}
            className="flex h-[44px] items-center gap-2 rounded-md bg-success px-5 font-display text-[13px] font-bold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Icon name="delivered" size={16} strokeWidth={2.4} />
            )}
            {status === "SUSPENDED" ? "Reactivate" : "Approve"}
          </button>
        )}
        {canSuspend && (
          <button
            type="button"
            onClick={() => setConfirmSuspend(true)}
            disabled={pending}
            className="flex h-[44px] items-center gap-2 rounded-md border border-[#f6d9da] bg-error-bg px-5 font-display text-[13px] font-bold text-error transition-[filter] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon name="canceled" size={16} strokeWidth={2} />
            Suspend
          </button>
        )}
      </div>

      {confirmSuspend && (
        <Dialog
          open
          onClose={() => setConfirmSuspend(false)}
          title="Suspend vendor"
          maxWidth="max-w-[480px]"
        >
          <div className="flex flex-col">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-error-bg text-error">
                <Icon name="canceled" size={22} strokeWidth={2} />
              </span>
              <div>
                <p className="font-sans text-[14.5px] leading-[1.5] text-ink">
                  Suspend <span className="font-semibold">“{storeName}”</span>?
                </p>
                <p className="mt-1.5 font-sans text-[13px] leading-[1.6] text-muted">
                  The vendor will be blocked from the seller dashboard until reactivated. You can
                  approve them again anytime.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmSuspend(false)}
                className="h-[46px] rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-field"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={suspend}
                disabled={pending}
                className="flex h-[46px] items-center gap-2 rounded-md bg-error px-6 font-display text-[13.5px] font-bold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {pending ? "Suspending…" : "Suspend vendor"}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
