"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@/components/dashboard/Icon";
import type { AdminReviewItem } from "@/lib/admin-product-types";
import { approveReview, rejectReview } from "@/app/(admin)/admin/products/actions";

const STATUS_META: Record<AdminReviewItem["status"], { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-warning-bg text-warning" },
  APPROVED: { label: "Approved", cls: "bg-success-bg text-success" },
  REJECTED: { label: "Rejected", cls: "bg-error-bg text-error" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={n <= rating ? "text-star" : "text-line"}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewModerationList({ reviews }: { reviews: AdminReviewItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function moderate(id: string, action: "approve" | "reject") {
    setBusy(id);
    const res = await (action === "approve" ? approveReview(id) : rejectReview(id));
    setBusy(null);
    if (res.success) {
      toast.success(action === "approve" ? "Review approved" : "Review rejected");
      router.refresh();
    } else {
      toast.error(res.error ?? "Couldn't update the review. Please try again.");
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-bg-subtle px-6 py-12 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-iris-50 text-iris-400">
          <Icon name="message" size={22} strokeWidth={1.7} />
        </span>
        <div className="font-display text-[15px] font-bold text-ink">No reviews yet</div>
        <p className="mx-auto mt-2 max-w-[360px] font-sans text-[13px] leading-[1.5] text-muted">
          Customer reviews for this product will appear here for moderation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => {
        const meta = STATUS_META[r.status];
        const pending = busy === r.id;
        return (
          <div key={r.id} className="rounded-xl border border-line-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full bg-iris-50 text-iris-500">
                  {r.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar} alt={r.author} className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="user" size={16} strokeWidth={1.9} />
                  )}
                </span>
                <div>
                  <div className="font-sans text-[13.5px] font-semibold text-ink">{r.author}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="font-sans text-[11.5px] text-muted-soft">{r.date}</span>
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex flex-none items-center rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${meta.cls}`}
              >
                {meta.label}
              </span>
            </div>

            {r.title && (
              <div className="mt-3 font-sans text-[13.5px] font-semibold text-ink">{r.title}</div>
            )}
            <p className="mt-1.5 font-sans text-[13px] leading-[1.6] text-muted">{r.comment}</p>

            {r.photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.photos.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt="Review photo"
                    className="h-16 w-16 rounded-lg border border-line-soft object-cover"
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => moderate(r.id, "approve")}
                disabled={pending || r.status === "APPROVED"}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-success px-3.5 font-sans text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="check" size={14} strokeWidth={2.5} />
                Approve
              </button>
              <button
                type="button"
                onClick={() => moderate(r.id, "reject")}
                disabled={pending || r.status === "REJECTED"}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 font-sans text-[12.5px] font-semibold text-error transition-colors hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="x" size={14} strokeWidth={2.5} />
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
