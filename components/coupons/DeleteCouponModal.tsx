"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteCoupon } from "@/app/(seller)/vendor/(dashboard)/coupons/actions";
import { Icon } from "@/components/dashboard/Icon";

export function DeleteCouponModal({
  coupon,
  onClose,
}: {
  coupon: { id: string; code: string } | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!coupon) return null;

  function confirm() {
    startTransition(async () => {
      const res = await deleteCoupon(coupon!.id);
      if (!res.success) {
        toast.error(res.error ?? "Couldn't delete the coupon.");
        return;
      }
      toast.success(
        res.data?.softDeleted
          ? `"${coupon!.code}" has been used — it was deactivated instead of deleted.`
          : `"${coupon!.code}" was deleted.`,
      );
      onClose();
      router.refresh();
    });
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,18,31,0.55)] p-6 backdrop-blur-[3px]">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] rounded-2xl bg-surface p-6 shadow-[0_40px_90px_-20px_rgba(20,18,31,.5)]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error">
          <Icon name="trash" size={22} strokeWidth={1.9} />
        </div>
        <div className="font-display text-[18px] font-bold text-ink">Delete coupon</div>
        <p className="mt-2 font-sans text-[13.5px] leading-[1.5] text-muted">
          Delete <span className="font-mono font-semibold text-ink">{coupon.code}</span>? This can&apos;t be undone. If the
          coupon has already been used, it will be deactivated instead so past orders stay intact.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-field disabled:opacity-60">
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={pending} className="flex h-11 items-center gap-2 rounded-md bg-error px-5 font-sans text-[13.5px] font-bold text-white transition-[filter] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70">
            {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
