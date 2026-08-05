import type { ReviewStatus } from "@prisma/client";
import { Icon } from "@/components/dashboard/Icon";
import { getReviewableItems, type ReviewableItem } from "@/lib/shop/reviews";
import { ReviewForm } from "./ReviewForm";

const REVIEW_STATUS: Record<ReviewStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pending approval", cls: "bg-warning-bg text-warning" },
  APPROVED: { label: "Published", cls: "bg-success-bg text-success" },
  REJECTED: { label: "Not approved", cls: "bg-error-bg text-error" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="16"
          height="16"
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

function ReviewedCard({ item }: { item: ReviewableItem & { review: NonNullable<ReviewableItem["review"]> } }) {
  const meta = REVIEW_STATUS[item.review.status];
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line-soft bg-bg-subtle p-5">
      <div className="flex size-12 flex-none items-center justify-center overflow-hidden rounded-[10px] bg-field text-muted-soft">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <Icon name="image" size={18} strokeWidth={1.7} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 font-sans text-[13.5px] font-semibold text-ink">
          {item.productName}
        </div>
        <div className="mt-1.5">
          <Stars rating={item.review.rating} />
        </div>
      </div>
      <span
        className={`inline-flex flex-none items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[11.5px] font-semibold ${meta.cls}`}
      >
        <Icon name="check" size={13} strokeWidth={2.5} />
        {meta.label}
      </span>
    </div>
  );
}

export async function OrderReviewsPanel({
  orderNumber,
  customerId,
}: {
  orderNumber: string;
  customerId: string;
}) {
  const items = await getReviewableItems(orderNumber, customerId);
  if (!items) return null;

  // Reviews unlock PER SELLER: an item is reviewable once its sub-order is delivered.
  const reviewable = items.filter((i) => i.delivered);
  const pending = items.filter((i) => !i.delivered);

  if (reviewable.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-8 py-14 text-center">
        <span className="mb-[18px] flex size-16 items-center justify-center rounded-[18px] bg-iris-50 text-iris-400">
          <Icon name="star" size={30} strokeWidth={1.6} />
        </span>
        <div className="font-display text-[17px] font-bold text-ink">Reviews open after delivery</div>
        <p className="mx-auto mt-2.5 max-w-[340px] font-sans text-[13.5px] leading-[1.5] text-muted">
          You can rate and review the items in this order once it&apos;s been delivered.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-ink">Rate your items</h2>
        <p className="mt-1 font-sans text-[13px] text-muted">
          Reviews are checked before they appear on the product page.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {reviewable.map((item) =>
          item.review ? (
            <ReviewedCard
              key={item.orderItemId}
              item={item as ReviewableItem & { review: NonNullable<ReviewableItem["review"]> }}
            />
          ) : (
            <ReviewForm key={item.orderItemId} item={item} />
          ),
        )}
      </div>
      {pending.length > 0 && (
        <p className="mt-4 font-sans text-[12.5px] text-muted-soft">
          {pending.length} more {pending.length === 1 ? "item" : "items"} can be reviewed once
          delivered.
        </p>
      )}
    </div>
  );
}
