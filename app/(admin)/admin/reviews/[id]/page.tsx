import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { formatMoney } from "@/lib/shop/pricing";
import { getAdminReview } from "@/lib/admin/reviews";
import { Icon } from "@/components/dashboard/Icon";
import { ReviewModeration } from "@/components/admin-reviews/ReviewModeration";

export const metadata: Metadata = { title: "Review Details — Covet Admin" };
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={18} className={n <= rating ? "text-star" : "text-line"} />
      ))}
    </span>
  );
}

export default async function AdminReviewDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN", "/admin/login");

  const { id } = await params;
  const review = await getAdminReview(id);
  if (!review) notFound();

  const images = Array.isArray(review.images) ? (review.images as string[]) : [];
  const order = review.orderItem?.subOrder?.order ?? null;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-warning-bg text-warning">
            <Icon name="star" size={19} className="text-warning" />
          </span>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Review Details</h1>
        </div>
        <Link
          href="/admin/reviews"
          className="flex h-10 items-center gap-1.5 rounded-[11px] border border-line px-3.5 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
        >
          <Icon name="chevronLeft" size={14} strokeWidth={2.2} />
          All reviews
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_340px]">
        {/* Main */}
        <div className="flex flex-col gap-5">
          {/* Product */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 font-display text-[15px] font-bold text-ink">Product</div>
            <div className="flex items-center gap-4">
              <span className="flex size-16 flex-none items-center justify-center overflow-hidden rounded-xl bg-field text-muted-soft">
                {review.product.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={review.product.thumbnail} alt={review.product.name} className="h-full w-full object-cover" />
                ) : (
                  <Icon name="image" size={22} strokeWidth={1.7} />
                )}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/products/${review.product.slug}`}
                  className="line-clamp-2 font-sans text-sm font-semibold text-ink hover:text-iris-500"
                >
                  {review.product.name}
                </Link>
                <Link
                  href={`/sellers/${review.product.vendor.slug}`}
                  className="mt-1 block font-sans text-[12px] text-iris-500 hover:text-iris-600"
                >
                  Sold by {review.product.vendor.storeName}
                </Link>
              </div>
            </div>
          </div>

          {/* The review */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="font-display text-[15px] font-bold text-ink">Review</div>
              <span className="font-sans text-[12px] text-muted-soft">{DATE_FMT.format(review.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Stars rating={review.rating} />
              <span className="font-display text-[15px] font-bold text-ink">{review.rating}.0</span>
            </div>
            {review.title && (
              <div className="mt-3 font-display text-[15px] font-bold text-ink">{review.title}</div>
            )}
            <p className="mt-2 font-sans text-[13.5px] leading-[1.6] text-ink-soft">{review.comment}</p>

            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Review photo ${i + 1}`}
                    className="size-20 rounded-xl border border-line-soft object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Verified purchase */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <Icon name="check" size={16} strokeWidth={2.4} className="text-success" />
              Verified purchase
            </div>
            {order ? (
              <div className="flex flex-col gap-2.5 font-sans text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Order</span>
                  <Link
                    href={`/admin/orders/${order.orderNumber}`}
                    className="font-display text-[13px] font-bold text-iris-500 hover:text-iris-600"
                  >
                    {order.orderNumber}
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Purchased</span>
                  <span className="font-semibold text-ink">{DATE_FMT.format(order.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Item</span>
                  <span className="truncate font-semibold text-ink">
                    {review.orderItem?.productName}
                    {review.orderItem?.variantLabel ? ` · ${review.orderItem.variantLabel}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Paid</span>
                  <span className="font-semibold text-ink">
                    {review.orderItem ? `${formatMoney(review.orderItem.unitPrice)} × ${review.orderItem.qty}` : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="font-sans text-[13px] text-muted">Original order record is no longer available.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <ReviewModeration reviewId={review.id} status={review.status} isVisible={review.isVisible} />

          {/* Customer */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 font-display text-[15px] font-bold text-ink">Customer</div>
            <div className="flex items-center gap-3">
              <span className="flex size-11 flex-none items-center justify-center overflow-hidden rounded-full bg-iris-50 font-display text-[16px] font-bold text-iris-500">
                {review.customer.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={review.customer.image} alt={review.customer.name ?? "Customer"} className="h-full w-full object-cover" />
                ) : (
                  (review.customer.name ?? "C").charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <div className="truncate font-sans text-sm font-semibold text-ink">
                  {review.customer.name ?? "Customer"}
                </div>
                <div className="truncate font-sans text-[12px] text-muted">{review.customer.email}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 font-sans text-[12.5px]">
              <span className="text-muted">Member since</span>
              <span className="font-semibold text-ink">{DATE_FMT.format(review.customer.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
