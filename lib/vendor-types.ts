import type { VendorStatus } from "@prisma/client";

export type { ActionResult } from "@/lib/brand-types";
export type { Paginated } from "@/lib/category-types";

export type VendorStatusFilter = "ALL" | "PENDING" | "APPROVED" | "SUSPENDED";

export type VendorListItem = {
  id: string;
  storeName: string;
  slug: string;
  status: VendorStatus;
  ownerName: string;
  email: string;
  createdAt: Date;
  productCount: number;
};

export type VendorDetail = VendorListItem & {
  phone: string | null;
  ownerCreatedAt: Date;
  // Extension points for later analytics (kept 0 until a Product model exists).
  activeProductCount: number;
};

export type VendorsQuery = {
  status?: VendorStatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
};
