"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  categorySchema,
  subCategorySchema,
  subSubCategorySchema,
} from "@/lib/category-validation";
import {
  saveCategoryImage,
  deleteCategoryImage,
  ImageValidationError,
} from "@/lib/category-upload";
import type {
  ActionResult,
  CategoriesQuery,
  CategoryListItem,
  CategoryOption,
  Paginated,
  SubCategoriesQuery,
  SubCategoryListItem,
  SubCategoryOption,
  SubSubCategoriesQuery,
  SubSubCategoryListItem,
} from "@/lib/category-types";

// ─────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────

/** ADMIN gate — enforced in EVERY action. Data-less failure is assignable to any ActionResult<T>. */
async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  return null;
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

function firstFieldErrors(
  flat: Record<string, string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

function paginate(query: { page?: number; pageSize?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
  return { page, pageSize };
}

// Product counts are COMPUTED. No Product model yet → always 0. When Product lands,
// replace these with `_count.products` in the includes below. See schema TODO(product).
const PRODUCT_COUNT = 0;

// ═════════════════════════════════════════════════════════════
// CATEGORY
// ═════════════════════════════════════════════════════════════

async function uniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (true) {
    const found = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function createCategory(
  _prev: ActionResult<CategoryListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<CategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    image: formData.get("image"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const { name, image } = parsed.data;

  let imagePath: string | null = null;
  if (image) {
    try {
      imagePath = await saveCategoryImage(image);
    } catch (e) {
      if (e instanceof ImageValidationError) {
        return { success: false, fieldErrors: { image: e.message }, error: "Please fix the errors below." };
      }
      return { success: false, error: "Could not process the image. Please try again." };
    }
  }

  try {
    const slug = await uniqueCategorySlug(name);
    const category = await prisma.category.create({ data: { name, slug, image: imagePath } });
    revalidatePath("/admin/categories");
    return { success: true, data: { ...category, subCategoryCount: 0, productCount: 0 } };
  } catch (e) {
    await deleteCategoryImage(imagePath);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A category with this name already exists" }, error: "A category with this name already exists" };
    }
    return { success: false, error: "Something went wrong creating the category. Please try again." };
  }
}

export async function updateCategory(
  id: string,
  _prev: ActionResult<CategoryListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<CategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "That category no longer exists." };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    image: formData.get("image"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const { name, image } = parsed.data;

  let newImagePath: string | null = null;
  if (image) {
    try {
      newImagePath = await saveCategoryImage(image);
    } catch (e) {
      if (e instanceof ImageValidationError) {
        return { success: false, fieldErrors: { image: e.message }, error: "Please fix the errors below." };
      }
      return { success: false, error: "Could not process the image. Please try again." };
    }
  }

  try {
    const slug = name === existing.name ? existing.slug : await uniqueCategorySlug(name, id);
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, ...(newImagePath ? { image: newImagePath } : {}) },
    });
    if (newImagePath && existing.image) await deleteCategoryImage(existing.image);
    revalidatePath("/admin/categories");
    const count = await prisma.subCategory.count({ where: { categoryId: id } });
    return { success: true, data: { ...category, subCategoryCount: count, productCount: 0 } };
  } catch (e) {
    if (newImagePath) await deleteCategoryImage(newImagePath);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A category with this name already exists" }, error: "A category with this name already exists" };
    }
    return { success: false, error: "Something went wrong updating the category. Please try again." };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { subCategories: true } } },
  });
  if (!category) return { success: false, error: "That category no longer exists." };

  const subs = category._count.subCategories;
  if (subs > 0) {
    return {
      success: false,
      error: `This category has ${subs} sub-categor${subs === 1 ? "y" : "ies"}. Remove or reassign them first before deleting this category.`,
    };
  }
  if (PRODUCT_COUNT > 0) {
    return { success: false, error: "This category has products attached. Reassign them first." };
  }

  try {
    await prisma.category.delete({ where: { id } });
    await deleteCategoryImage(category.image);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong deleting the category. Please try again." };
  }
}

export async function getCategories(
  query: CategoriesQuery = {},
): Promise<ActionResult<Paginated<CategoryListItem>>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const search = (query.search ?? "").trim();
  const { page, pageSize } = paginate(query);
  const where: Prisma.CategoryWhereInput = search ? { name: { contains: search } } : {};

  try {
    const total = await prisma.category.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const rows = await prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { subCategories: true } } },
    });
    const items: CategoryListItem[] = rows.map(({ _count, ...c }) => ({
      ...c,
      subCategoryCount: _count.subCategories,
      productCount: 0,
    }));
    return { success: true, data: { items, total, page: safePage, pageSize, totalPages } };
  } catch {
    return { success: false, error: "Couldn't load categories. Please try again." };
  }
}

export async function getCategory(id: string): Promise<ActionResult<CategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const row = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { subCategories: true } } },
  });
  if (!row) return { success: false, error: "Category not found." };
  const { _count, ...c } = row;
  return { success: true, data: { ...c, subCategoryCount: _count.subCategories, productCount: 0 } };
}

// ═════════════════════════════════════════════════════════════
// SUB-CATEGORY
// ═════════════════════════════════════════════════════════════

async function uniqueSubCategorySlug(
  categoryId: string,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (true) {
    const found = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId, slug } },
      select: { id: true },
    });
    if (!found || found.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function createSubCategory(
  _prev: ActionResult<SubCategoryListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<SubCategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = subCategorySchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const { name, categoryId } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } });
  if (!category) {
    return { success: false, fieldErrors: { categoryId: "Selected category no longer exists" }, error: "Please fix the errors below." };
  }

  try {
    const slug = await uniqueSubCategorySlug(categoryId, name);
    const sub = await prisma.subCategory.create({ data: { name, slug, categoryId } });
    revalidatePath("/admin/categories/sub");
    revalidatePath("/admin/categories");
    return { success: true, data: { ...sub, categoryName: category.name, subSubCategoryCount: 0, productCount: 0 } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A sub-category with this name already exists in this category" }, error: "A sub-category with this name already exists in this category" };
    }
    return { success: false, error: "Something went wrong creating the sub-category. Please try again." };
  }
}

export async function updateSubCategory(
  id: string,
  _prev: ActionResult<SubCategoryListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<SubCategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const existing = await prisma.subCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "That sub-category no longer exists." };

  const parsed = subCategorySchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const { name, categoryId } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } });
  if (!category) {
    return { success: false, fieldErrors: { categoryId: "Selected category no longer exists" }, error: "Please fix the errors below." };
  }

  try {
    const slug =
      name === existing.name && categoryId === existing.categoryId
        ? existing.slug
        : await uniqueSubCategorySlug(categoryId, name, id);
    const sub = await prisma.subCategory.update({ where: { id }, data: { name, slug, categoryId } });
    revalidatePath("/admin/categories/sub");
    revalidatePath("/admin/categories");
    const count = await prisma.subSubCategory.count({ where: { subCategoryId: id } });
    return { success: true, data: { ...sub, categoryName: category.name, subSubCategoryCount: count, productCount: 0 } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A sub-category with this name already exists in this category" }, error: "A sub-category with this name already exists in this category" };
    }
    return { success: false, error: "Something went wrong updating the sub-category. Please try again." };
  }
}

export async function deleteSubCategory(id: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sub = await prisma.subCategory.findUnique({
    where: { id },
    include: { _count: { select: { subSubCategories: true } } },
  });
  if (!sub) return { success: false, error: "That sub-category no longer exists." };

  const subsubs = sub._count.subSubCategories;
  if (subsubs > 0) {
    return {
      success: false,
      error: `This sub-category has ${subsubs} sub-sub-categor${subsubs === 1 ? "y" : "ies"}. Remove or reassign them first before deleting.`,
    };
  }
  if (PRODUCT_COUNT > 0) {
    return { success: false, error: "This sub-category has products attached. Reassign them first." };
  }

  try {
    await prisma.subCategory.delete({ where: { id } });
    revalidatePath("/admin/categories/sub");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong deleting the sub-category. Please try again." };
  }
}

export async function getSubCategories(
  query: SubCategoriesQuery = {},
): Promise<ActionResult<Paginated<SubCategoryListItem>>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const search = (query.search ?? "").trim();
  const { page, pageSize } = paginate(query);
  const where: Prisma.SubCategoryWhereInput = {
    ...(search ? { name: { contains: search } } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  };

  try {
    const total = await prisma.subCategory.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const rows = await prisma.subCategory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        _count: { select: { subSubCategories: true } },
      },
    });
    const items: SubCategoryListItem[] = rows.map(({ _count, category, ...s }) => ({
      ...s,
      categoryName: category.name,
      subSubCategoryCount: _count.subSubCategories,
      productCount: 0,
    }));
    return { success: true, data: { items, total, page: safePage, pageSize, totalPages } };
  } catch {
    return { success: false, error: "Couldn't load sub-categories. Please try again." };
  }
}

export async function getSubCategory(id: string): Promise<ActionResult<SubCategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const row = await prisma.subCategory.findUnique({
    where: { id },
    include: { category: { select: { name: true } }, _count: { select: { subSubCategories: true } } },
  });
  if (!row) return { success: false, error: "Sub-category not found." };
  const { _count, category, ...s } = row;
  return { success: true, data: { ...s, categoryName: category.name, subSubCategoryCount: _count.subSubCategories, productCount: 0 } };
}

// ═════════════════════════════════════════════════════════════
// SUB-SUB-CATEGORY
// ═════════════════════════════════════════════════════════════

async function uniqueSubSubCategorySlug(
  subCategoryId: string,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (true) {
    const found = await prisma.subSubCategory.findUnique({
      where: { subCategoryId_slug: { subCategoryId, slug } },
      select: { id: true },
    });
    if (!found || found.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

/** Verify the sub-category exists AND belongs to the given category (server-side). */
async function resolveParents(
  categoryId: string,
  subCategoryId: string,
): Promise<
  | { ok: true; categoryName: string; subCategoryName: string }
  | { ok: false; fieldErrors: Record<string, string> }
> {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } });
  if (!category) return { ok: false, fieldErrors: { categoryId: "Selected category no longer exists" } };

  const sub = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
    select: { name: true, categoryId: true },
  });
  if (!sub) return { ok: false, fieldErrors: { subCategoryId: "Selected sub-category no longer exists" } };
  if (sub.categoryId !== categoryId) {
    return { ok: false, fieldErrors: { subCategoryId: "That sub-category doesn't belong to the selected category" } };
  }
  return { ok: true, categoryName: category.name, subCategoryName: sub.name };
}

export async function createSubSubCategory(
  _prev: ActionResult<SubSubCategoryListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<SubSubCategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = subSubCategorySchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    subCategoryId: formData.get("subCategoryId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const { name, categoryId, subCategoryId } = parsed.data;

  const parents = await resolveParents(categoryId, subCategoryId);
  if (!parents.ok) return { success: false, fieldErrors: parents.fieldErrors, error: "Please fix the errors below." };

  try {
    const slug = await uniqueSubSubCategorySlug(subCategoryId, name);
    const item = await prisma.subSubCategory.create({ data: { name, slug, categoryId, subCategoryId } });
    revalidatePath("/admin/categories/sub-sub");
    revalidatePath("/admin/categories/sub");
    return { success: true, data: { ...item, categoryName: parents.categoryName, subCategoryName: parents.subCategoryName, productCount: 0 } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A sub-sub-category with this name already exists in this sub-category" }, error: "A sub-sub-category with this name already exists in this sub-category" };
    }
    return { success: false, error: "Something went wrong creating the sub-sub-category. Please try again." };
  }
}

export async function updateSubSubCategory(
  id: string,
  _prev: ActionResult<SubSubCategoryListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<SubSubCategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const existing = await prisma.subSubCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "That sub-sub-category no longer exists." };

  const parsed = subSubCategorySchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    subCategoryId: formData.get("subCategoryId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const { name, categoryId, subCategoryId } = parsed.data;

  const parents = await resolveParents(categoryId, subCategoryId);
  if (!parents.ok) return { success: false, fieldErrors: parents.fieldErrors, error: "Please fix the errors below." };

  try {
    const slug =
      name === existing.name && subCategoryId === existing.subCategoryId
        ? existing.slug
        : await uniqueSubSubCategorySlug(subCategoryId, name, id);
    const item = await prisma.subSubCategory.update({
      where: { id },
      data: { name, slug, categoryId, subCategoryId },
    });
    revalidatePath("/admin/categories/sub-sub");
    revalidatePath("/admin/categories/sub");
    return { success: true, data: { ...item, categoryName: parents.categoryName, subCategoryName: parents.subCategoryName, productCount: 0 } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A sub-sub-category with this name already exists in this sub-category" }, error: "A sub-sub-category with this name already exists in this sub-category" };
    }
    return { success: false, error: "Something went wrong updating the sub-sub-category. Please try again." };
  }
}

export async function deleteSubSubCategory(id: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const item = await prisma.subSubCategory.findUnique({ where: { id } });
  if (!item) return { success: false, error: "That sub-sub-category no longer exists." };

  if (PRODUCT_COUNT > 0) {
    return { success: false, error: "This sub-sub-category has products attached. Reassign them first." };
  }

  try {
    await prisma.subSubCategory.delete({ where: { id } });
    revalidatePath("/admin/categories/sub-sub");
    revalidatePath("/admin/categories/sub");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong deleting the sub-sub-category. Please try again." };
  }
}

export async function getSubSubCategories(
  query: SubSubCategoriesQuery = {},
): Promise<ActionResult<Paginated<SubSubCategoryListItem>>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const search = (query.search ?? "").trim();
  const { page, pageSize } = paginate(query);
  const where: Prisma.SubSubCategoryWhereInput = {
    ...(search ? { name: { contains: search } } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.subCategoryId ? { subCategoryId: query.subCategoryId } : {}),
  };

  try {
    const total = await prisma.subSubCategory.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const rows = await prisma.subSubCategory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
      },
    });
    const items: SubSubCategoryListItem[] = rows.map(({ category, subCategory, ...s }) => ({
      ...s,
      categoryName: category.name,
      subCategoryName: subCategory.name,
      productCount: 0,
    }));
    return { success: true, data: { items, total, page: safePage, pageSize, totalPages } };
  } catch {
    return { success: false, error: "Couldn't load sub-sub-categories. Please try again." };
  }
}

export async function getSubSubCategory(id: string): Promise<ActionResult<SubSubCategoryListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const row = await prisma.subSubCategory.findUnique({
    where: { id },
    include: { category: { select: { name: true } }, subCategory: { select: { name: true } } },
  });
  if (!row) return { success: false, error: "Sub-sub-category not found." };
  const { category, subCategory, ...s } = row;
  return { success: true, data: { ...s, categoryName: category.name, subCategoryName: subCategory.name, productCount: 0 } };
}

// ═════════════════════════════════════════════════════════════
// Helpers for dependent dropdowns
// ═════════════════════════════════════════════════════════════

/** All categories (for the first dropdown). */
export async function getCategoryOptions(): Promise<ActionResult<CategoryOption[]>> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return { success: true, data: rows };
}

/** Sub-categories for a chosen category — powers the dependent Sub-Category dropdown.
 *  Server-side (we never ship every sub-category to the client). */
export async function getSubCategoriesByCategory(
  categoryId: string,
): Promise<ActionResult<SubCategoryOption[]>> {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!categoryId) return { success: true, data: [] };

  const rows = await prisma.subCategory.findMany({
    where: { categoryId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return { success: true, data: rows };
}
