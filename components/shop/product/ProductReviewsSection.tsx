import { Icon } from "@/components/dashboard/Icon";
import type { ProductReview, ProductReviews } from "@/lib/shop/queries";

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={size} className={i < filled ? "text-star" : "text-line"} />
      ))}
    </span>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  const initials = review.author
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3.5 border-b border-line-soft pb-[18px] last:border-b-0">
      <div className="flex size-11 flex-none items-center justify-center overflow-hidden rounded-full bg-iris-100 font-display text-[15px] font-bold text-iris-700">
        {review.avatar ? (
          <img src={review.avatar} alt={review.author} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-semibold text-ink">{review.author}</span>
          <span className="font-sans text-[12px] text-muted-soft">{review.date}</span>
        </div>
        <div className="my-2">
          <Stars value={review.rating} />
        </div>
        <p className="m-0 font-sans text-[13.5px] leading-[1.6] text-muted">{review.text}</p>
        {review.photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {review.photos.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="size-16 rounded-lg border border-line-soft object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reviews tab: average score, star-distribution breakdown, and the reviews list.
 *
 * TODO(reviews): there is NO Review model in the schema yet, so getProductReviews
 * returns an empty summary and this renders the "No reviews yet" state. When a
 * Review model lands, the same data shape populates this UI unchanged; a review
 * submission form (gated to buyers) would be added below the list at that time.
 */
export function ProductReviewsSection({ data }: { data: ProductReviews }) {
  const isEmpty = data.count === 0;

  return (
    <div className="mx-auto max-w-[760px]">
      {/* Summary */}
      <div className="mb-7 grid gap-6 rounded-2xl border border-line-soft bg-bg-subtle p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex flex-col items-center sm:border-r sm:border-line-soft sm:pr-8">
          <div className="font-display text-[40px] font-extrabold leading-none text-ink">
            {data.average != null ? data.average.toFixed(1) : "—"}
          </div>
          <div className="my-2">
            <Stars value={data.average ?? 0} size={15} />
          </div>
          <div className="font-sans text-[12.5px] text-muted">
            {data.count > 0 ? `${data.count} reviews` : "No reviews yet"}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {data.distribution.map((row) => {
            const pct = data.count > 0 ? (row.count / data.count) * 100 : 0;
            return (
              <div key={row.stars} className="flex items-center gap-3">
                <span className="flex w-8 items-center gap-1 font-sans text-[12px] text-muted">
                  {row.stars}
                  <Icon name="star" size={11} className="text-star" />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <span className="block h-full rounded-full bg-star" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-6 text-right font-sans text-[12px] text-muted-soft">
                  {row.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* List */}
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2.5 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-field text-muted-soft">
            <Icon name="message" size={26} strokeWidth={1.75} />
          </span>
          <p className="font-display text-[16px] font-bold text-ink">No reviews yet</p>
          <p className="max-w-[340px] font-sans text-[13.5px] text-muted">
            This product hasn&apos;t been reviewed yet. Reviews from verified buyers
            will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[18px]">
          {data.reviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}
