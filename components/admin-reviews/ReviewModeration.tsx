"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ReviewStatus } from "@prisma/client";
import { Icon } from "@/components/dashboard/Icon";
import { ReviewStatusBadge } from "@/components/admin-reviews/ReviewStatusBadge";
import { moderateReview, setReviewVisibility } from "@/app/(admin)/admin/reviews/actions";

/**
 * Admin moderation panel: approve/reject (status) + show/hide (isVisible, only for
 * an approved review). Storefront shows APPROVED AND isVisible; the product's
 * average rating recomputes on read, so a decision here reflects there after
 * revalidation.
 */
export function ReviewModeration({
  reviewId,
  status,
  isVisible,
}: {
  reviewId: string;
  status: ReviewStatus;
  isVisible: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(action: () => Promise<{ success: boolean; error?: string }>, okMsg: string) {
    start(async () => {
      const res = await action();
      if (res.success) {
        toast.success(okMsg);
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  }

  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const showsOnStore = isApproved && isVisible;

  return (
    <div className="rounded-[16px] border border-line-soft bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-[15px] font-bold text-ink">Moderation</span>
        <ReviewStatusBadge status={status} />
      </div>

      {/* Storefront visibility summary */}
      <div
        className={`mb-4 flex items-center gap-2.5 rounded-xl border px-3.5 py-3 font-sans text-[12.5px] ${
          showsOnStore
            ? "border-success-bg bg-success-bg/40 text-success"
            : "border-line bg-bg-subtle text-muted"
        }`}
      >
        <Icon name={showsOnStore ? "eye" : "eyeOff"} size={15} strokeWidth={2} className="flex-none" />
        <span>
          {showsOnStore
            ? "Live on the storefront (approved & visible)."
            : isApproved
              ? "Approved but hidden — not shown on the storefront."
              : "Not on the storefront (needs approval)."}
        </span>
      </div>

      {/* Approve / Reject */}
      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={pending || isApproved}
          onClick={() => run(() => moderateReview(reviewId, "APPROVED"), "Review approved")}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-success px-4 font-sans text-[13.5px] font-semibold text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="check" size={16} strokeWidth={2.4} />
          {isApproved ? "Approved" : "Approve"}
        </button>
        <button
          type="button"
          disabled={pending || isRejected}
          onClick={() => run(() => moderateReview(reviewId, "REJECTED"), "Review rejected")}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-error/40 bg-error-bg px-4 font-sans text-[13.5px] font-semibold text-error transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="x" size={16} strokeWidth={2.4} />
          {isRejected ? "Rejected" : "Reject"}
        </button>
      </div>

      {/* Visibility toggle (approved only) */}
      <div className="mt-4 border-t border-line-soft pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-sans text-[13px] font-semibold text-ink">Show on storefront</div>
            <div className="mt-0.5 font-sans text-[11.5px] text-muted">
              {isApproved
                ? "Hide an approved review without rejecting it."
                : "Available once the review is approved."}
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isApproved && isVisible}
            aria-label="Toggle storefront visibility"
            disabled={pending || !isApproved}
            onClick={() =>
              run(
                () => setReviewVisibility(reviewId, !isVisible),
                isVisible ? "Review hidden" : "Review shown",
              )
            }
            className={`relative h-6 w-11 flex-none rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isApproved && isVisible ? "bg-iris-500" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                isApproved && isVisible ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
