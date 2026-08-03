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

export type AdminProductDetailVariation = {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: string;
  stock: number;
  sku: string | null;
  image: string | null;
};

/** Full, serializable product for the admin review/details page. */
export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  shortDescription: string | null;
  vendorId: string;
  vendorName: string;
  vendorProductCount: number;
  brandName: string | null;
  categoryName: string;
  subCategoryName: string | null;
  subSubCategoryName: string | null;
  price: string;
  compareAtPrice: string | null;
  discount: string | null;
  discountType: "AMOUNT" | "PERCENT";
  taxRate: string | null;
  stock: number;
  thumbnail: string | null;
  gallery: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  approvalStatus: ProductApprovalStatus;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  hasVariations: boolean;
  variations: AdminProductDetailVariation[];
  totalStock: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminReviewItem = {
  id: string;
  author: string;
  avatar: string | null;
  rating: number;
  title: string | null;
  comment: string;
  photos: string[];
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};
