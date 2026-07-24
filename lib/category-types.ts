import type { Category, SubCategory, SubSubCategory } from "@prisma/client";

// Reuse the shared, generic action-result shape.
export type { ActionResult } from "@/lib/brand-types";

/** Category row + computed counts (product count is 0 until a Product model exists). */
export type CategoryListItem = Category & {
  subCategoryCount: number;
  productCount: number;
};

export type SubCategoryListItem = SubCategory & {
  categoryName: string;
  subSubCategoryCount: number;
  productCount: number;
};

export type SubSubCategoryListItem = SubSubCategory & {
  categoryName: string;
  subCategoryName: string;
  productCount: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CategoriesQuery = { search?: string; page?: number; pageSize?: number };
export type SubCategoriesQuery = CategoriesQuery & { categoryId?: string };
export type SubSubCategoriesQuery = CategoriesQuery & {
  categoryId?: string;
  subCategoryId?: string;
};

/** Minimal shape for the dependent Sub-Category dropdown. */
export type SubCategoryOption = { id: string; name: string };
export type CategoryOption = { id: string; name: string };
