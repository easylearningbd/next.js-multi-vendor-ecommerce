import type { ProductApprovalStatus } from "@prisma/client";

export type { ActionResult } from "@/lib/brand-types";
export type { Paginated } from "@/lib/category-types";

export type ProductStatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

/** A {id,name} option for a select dropdown. */
export type Option = { id: string; name: string };

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
