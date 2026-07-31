import type { CouponType, CouponScope } from "@prisma/client";

export type { ActionResult } from "@/lib/brand-types";
export type { Paginated } from "@/lib/category-types";

/** A product shown in the SPECIFIC_PRODUCTS picker (this vendor's products only). */
export type CouponPickerProduct = {
  id: string;
  name: string;
  thumbnail: string | null;
  price: string; // pre-formatted, e.g. "$40.00"
};

/** Derived from isActive + the date window (see deriveStatus in actions). */
export type CouponDerivedStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "INACTIVE";

export type CouponStatusFilter = "ALL" | CouponDerivedStatus;

/** A serializable coupon row for the list (Decimal/dates → strings). */
export type CouponListItem = {
  id: string;
  code: string;
  title: string;
  type: CouponType;
  typeLabel: string;
  valueLabel: string; // "10%" / "$5.00" / "Free shipping"
  scope: CouponScope;
  scopeLabel: string; // "Store-wide" / "Specific (3)"
  usedCount: number;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  usageLabel: string; // "3 / 100" or "3 / ∞"
  startLabel: string;
  expiryLabel: string;
  status: CouponDerivedStatus;
  isActive: boolean;
  // Extra fields the View modal shows:
  minSpendLabel: string;
  maxDiscountLabel: string;
  bigLabel: string; // "10%" / "$5" / "Free"
};

export type CouponsQuery = {
  status?: CouponStatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
};

/** Everything the shared coupon form needs to pre-fill in EDIT mode. */
export type CouponFormInitial = {
  id: string;
  code: string;
  title: string;
  type: CouponType;
  value: string;
  scope: CouponScope;
  minSpend: string;
  maxDiscount: string;
  usageLimit: string;
  usageLimitPerUser: string;
  startsAt: string; // yyyy-mm-dd
  expiresAt: string; // yyyy-mm-dd
  isActive: boolean;
  productIds: string[];
};
