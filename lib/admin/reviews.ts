import type { ReviewStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Admin (platform-wide) review moderation data layer — every review across all
 * products/vendors, no scoping. Moderation is by `status` (PENDING/APPROVED/
 * REJECTED); visibility of an approved review is a separate `isVisible` flag.
 * Read here; the moderation writes live in the details route's server actions.
 */

export const ADMIN_REVIEWS_PAGE_SIZE = 12;

const STATUS_BY_SLUG: Record<string, ReviewStatus> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};
export function reviewStatusFromSlug(slug?: string): ReviewStatus | undefined {
  return slug ? STATUS_BY_SLUG[slug] : undefined;
}

export type AdminReviewRow = {
  id: string;
  rating: number;
  excerpt: string;
  status: ReviewStatus;
  isVisible: boolean;
  createdAt: Date;
  productName: string;
  productThumbnail: string | null;
  productSlug: string;
  sellerName: string;
  customerName: string;
};

export type AdminReviewsResult = {
  rows: AdminReviewRow[];
  total: number;
  page: number;
  totalPages: number;
  status?: ReviewStatus;
  counts: { all: number; pending: number; approved: number; rejected: number };
};

/**
 * All reviews, newest first, filtered by moderation status and an optional search
 * over product name, customer name, or review id. Paginated. Also returns stable
 * per-status counts (platform-wide) for the filter pills.
 */
export async function getAdminReviews(
  opts: { statusSlug?: string; search?: string; page?: number } = {},
): Promise<AdminReviewsResult> {
  const page = Math.max(1, opts.page ?? 1);
  const status = reviewStatusFromSlug(opts.statusSlug);
  const q = opts.search?.trim();

  const where: Prisma.ReviewWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { id: { contains: q } },
            { comment: { contains: q } },
            { product: { name: { contains: q } } },
            { customer: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  const [total, rows, grouped] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_REVIEWS_PAGE_SIZE,
      take: ADMIN_REVIEWS_PAGE_SIZE,
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        isVisible: true,
        createdAt: true,
        product: {
          select: { name: true, thumbnail: true, slug: true, vendor: { select: { storeName: true } } },
        },
        customer: { select: { name: true } },
      },
    }),
    prisma.review.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };
  for (const g of grouped) {
    counts.all += g._count;
    if (g.status === "PENDING") counts.pending = g._count;
    else if (g.status === "APPROVED") counts.approved = g._count;
    else if (g.status === "REJECTED") counts.rejected = g._count;
  }

  return {
    rows: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      excerpt: r.comment,
      status: r.status,
      isVisible: r.isVisible,
      createdAt: r.createdAt,
      productName: r.product.name,
      productThumbnail: r.product.thumbnail,
      productSlug: r.product.slug,
      sellerName: r.product.vendor.storeName,
      customerName: r.customer.name ?? "Customer",
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_REVIEWS_PAGE_SIZE)),
    status,
    counts,
  };
}
