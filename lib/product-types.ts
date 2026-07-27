import type { ProductApprovalStatus } from "@prisma/client";

export type { ActionResult } from "@/lib/brand-types";
export type { Paginated } from "@/lib/category-types";

export type ProductStatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

/** A {id,name} option for a select dropdown. */
export type Option = { id: string; name: string };

export type ProductDetailVariation = {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: string;
  stock: number;
  sku: string | null;
  image: string | null;
};

/** Full, serializable product for the details view (Decimal → string). */
export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  shortDescription: string | null;
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
  approvalStatus: import("@prisma/client").ProductApprovalStatus;
  isActive: boolean;
  hasVariations: boolean;
  variations: ProductDetailVariation[];
  totalStock: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductFormOptions = {
  categories: Option[];
  brands: Option[];
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  thumbnail: string | null;
  categoryName: string;
  price: string; // pre-formatted, e.g. "$40.00" (Decimal never crosses to the client)
  stock: number; // effective stock: sum of variation stock if any, else top-level stock
  hasVariations: boolean;
  approvalStatus: ProductApprovalStatus;
  isActive: boolean;
};

export type ProductsQuery = {
  status?: ProductStatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
};

/** A variation as the edit form consumes it (money as strings, image as a URL). */
export type ProductFormVariation = {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: string;
  stock: string;
  sku: string;
  image: string | null;
};

/** Everything the shared product form needs to pre-fill in EDIT mode. */
export type ProductFormInitial = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  sku: string;
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;
  brandId: string;
  price: string;
  compareAtPrice: string;
  discount: string;
  discountType: "AMOUNT" | "PERCENT";
  taxRate: string;
  stock: string;
  metaTitle: string;
  metaDescription: string;
  thumbnail: string | null;
  gallery: string[];
  hasVariations: boolean;
  variations: ProductFormVariation[];
  // Pre-fetched dependent options so the category dropdowns render already-populated.
  subOptions: Option[];
  subSubOptions: Option[];
};
