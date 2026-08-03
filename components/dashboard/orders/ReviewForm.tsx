"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon } from "@/components/dashboard/Icon";
import { IMAGE_ACCEPT_ATTR } from "@/lib/brand-validation";
import { submitReview, type SubmitReviewResult } from "@/app/(shop)/dashboard/orders/review-actions";
import type { ReviewableItem } from "@/lib/shop/reviews";

function StarRating({ rating, setRating }: { rating: number; setRating: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || rating;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => setRating(n)}
          className={n <= shown ? "text-star" : "text-line"}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ item }: { item: ReviewableItem }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SubmitReviewResult | undefined, FormData>(
    submitReview,
    undefined,
  );
  const [rating, setRating] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Review submitted — pending approval");
      router.refresh();
    } else {
      toast.error(state.error);
    }
  }, [state, router]);

  const errs = (state && !state.ok ? state.fieldErrors : undefined) ?? {};

  return (
    <form action={formAction} className="rounded-2xl border border-line-soft p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 flex-none items-center justify-center overflow-hidden rounded-[10px] bg-field text-muted-soft">
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
          ) : (
            <Icon name="image" size={18} strokeWidth={1.7} />
          )}
        </div>
        <div className="min-w-0">
          <div className="line-clamp-1 font-sans text-[13.5px] font-semibold text-ink">
            {item.productName}
          </div>
          <div className="font-sans text-[12px] text-muted-soft">
            {item.variantLabel ? `${item.variantLabel} · ` : ""}Sold by {item.sellerName}
          </div>
        </div>
      </div>

      <input type="hidden" name="orderItemId" value={item.orderItemId} />
      <input type="hidden" name="productId" value={item.productId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="mb-4">
        <StarRating rating={rating} setRating={setRating} />
        {errs.rating && <p className="mt-1.5 font-sans text-[12px] text-error">{errs.rating}</p>}
      </div>

      <input
        name="title"
        placeholder="Add a title (optional)"
        maxLength={120}
        className="mb-3 h-11 w-full rounded-[11px] border border-line bg-bg-subtle px-3.5 font-sans text-[13.5px] text-ink outline-none focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]"
      />

      <textarea
        name="comment"
        placeholder="Share what you liked or didn't…"
        rows={3}
        maxLength={2000}
        className="w-full resize-y rounded-[11px] border border-line bg-bg-subtle px-3.5 py-2.5 font-sans text-[13.5px] leading-[1.5] text-ink outline-none focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]"
      />
      {errs.comment && <p className="mt-1.5 font-sans text-[12px] text-error">{errs.comment}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex h-9 items-center gap-2 rounded-[10px] border border-line px-3 font-sans text-[12.5px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
          >
            <Icon name="camera" size={15} strokeWidth={1.9} />
            {fileName ? "Change photo" : "Add photo"}
          </button>
          <input
            ref={fileInput}
            type="file"
            name="image"
            accept={IMAGE_ACCEPT_ATTR}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="hidden"
          />
          {fileName && <span className="ml-2 font-sans text-[12px] text-muted">{fileName}</span>}
          {errs.image && <p className="mt-1.5 font-sans text-[12px] text-error">{errs.image}</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center justify-center rounded-xl bg-iris-500 px-6 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}
