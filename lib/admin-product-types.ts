import type { ProductApprovalStatus } from "@prisma/client";

export type { ActionResult } from "@/lib/brand-types";
export type { Paginated } from "@/lib/category-types";
export type { Option } from "@/lib/product-types";

/** The five admin product lists — four by approvalStatus, two by boolean flag. */
export type AdminProductFilter = "PENDING" | "APPROVED" | "REJECTED" | "FEATURED" | "POPULAR";

/** A serializable product row for the admin lists — ALWAYS carries the vendor (marketplace). */
export type AdminProductListItem = {
  id: string;
  name: string;
  sku: string | null;
  thumbnail: string | null;
  vendorName: string; // the seller's store name
  categoryName: string;
  price: string; // pre-formatted, e.g. "$40.00"
  submittedLabel: string; // formatted createdAt
  approvalStatus: ProductApprovalStatus;
  isFeatured: boolean;
  isPopular: boolean;
};

export type AdminProductsQuery = {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
};
