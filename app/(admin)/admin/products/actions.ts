"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteProductFile } from "@/lib/product-upload";
import type {
  ActionResult,
  AdminProductDetail,
  AdminProductFilter,
  AdminProductListItem,
  AdminProductsQuery,
  Option,
  Paginated,
} from "@/lib/admin-product-types";

// ─────────────────────────────────────────────────────────────
// Admin gate — reused by every action in this module.
// ─────────────────────────────────────────────────────────────
async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  return null;
}

const money = (d: Prisma.Decimal) => `$${d.toFixed(2)}`;
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);

/** The DB filter for each of the five admin product lists. */
function filterWhere(filter: AdminProductFilter): Prisma.ProductWhereInput {
  switch (filter) {
    case "APPROVED":
      return { approvalStatus: "APPROVED" };
    case "REJECTED":
      return { approvalStatus: "REJECTED" };
    case "FEATURED":
      return { isFeatured: true };
    case "POPULAR":
      return { isPopular: true };
    case "PENDING":
    default:
      return { approvalStatus: "PENDING" };
  }
}

// ─────────────────────────────────────────────────────────────
// Products for an admin list — across ALL vendors (no vendor scoping; admin sees all).
// ─────────────────────────────────────────────────────────────
export async function getAdminProducts(
  filter: AdminProductFilter,
  query: AdminProductsQuery = {},
): Promise<ActionResult<Paginated<AdminProductListItem>>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const search = (query.search ?? "").trim();
  const categoryId = query.categoryId?.trim() || undefined;
  const page = Math.max(1, query.page ?? 1);
  const requested = query.pageSize ?? 10;
  const pageSize = [10, 20, 50].includes(requested) ? requested : 10;

  const where: Prisma.ProductWhereInput = {
    ...filterWhere(filter),
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { vendor: { storeName: { contains: search } } },
          ],
        }
      : {}),
  };

  try {
    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const rows = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: {
        vendor: { select: { storeName: true } },
        category: { select: { name: true } },
      },
    });

    const items: AdminProductListItem[] = rows.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      thumbnail: p.thumbnail,
      vendorName: p.vendor.storeName,
      categoryName: p.category.name,
      price: money(p.price),
      submittedLabel: fmtDate(p.createdAt),
      approvalStatus: p.approvalStatus,
      isFeatured: p.isFeatured,
      isPopular: p.isPopular,
    }));

    return { success: true, data: { items, total, page: safePage, pageSize, totalPages } };
  } catch {
    return { success: false, error: "Couldn't load products. Please try again." };
  }
}

/** Categories for the list filter dropdown. */
export async function getAdminProductCategories(): Promise<ActionResult<Option[]>> {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
    return { success: true, data: rows };
  } catch {
    return { success: false, error: "Couldn't load categories." };
  }
}

// ─────────────────────────────────────────────────────────────
// Details — full product for the admin review page (across all vendors).
// ─────────────────────────────────────────────────────────────
export async function getAdminProductDetail(id: string): Promise<ActionResult<AdminProductDetail>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, storeName: true, _count: { select: { products: true } } } },
      brand: { select: { name: true } },
      category: { select: { name: true } },
      subCategory: { select: { name: true } },
      subSubCategory: { select: { name: true } },
      variations: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!p) return { success: false, error: "Product not found." };

  const hasVariations = p.variations.length > 0;
  const totalStock = hasVariations ? p.variations.reduce((s, v) => s + v.stock, 0) : p.stock;

  return {
    success: true,
    data: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      shortDescription: p.shortDescription,
      vendorId: p.vendor.id,
      vendorName: p.vendor.storeName,
      vendorProductCount: p.vendor._count.products,
      brandName: p.brand?.name ?? null,
      categoryName: p.category.name,
      subCategoryName: p.subCategory?.name ?? null,
      subSubCategoryName: p.subSubCategory?.name ?? null,
      price: p.price.toString(),
      compareAtPrice: p.compareAtPrice?.toString() ?? null,
      discount: p.discount?.toString() ?? null,
      discountType: p.discountType,
      taxRate: p.taxRate?.toString() ?? null,
      stock: p.stock,
      thumbnail: p.thumbnail,
      gallery: (p.gallery as string[] | null) ?? [],
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      approvalStatus: p.approvalStatus,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isPopular: p.isPopular,
      hasVariations,
      variations: p.variations.map((v) => ({
        id: v.id,
        name: v.name,
        attributes: (v.attributes as Record<string, string>) ?? {},
        price: v.price.toString(),
        stock: v.stock,
        sku: v.sku,
        image: v.image,
      })),
      totalStock,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    },
  };
}

/** Revalidate the details page + every list that could show/hide this product. */
function revalidateProduct(id: string) {
  revalidatePath(`/admin/products/${id}`);
  for (const s of ["pending", "approved", "denied", "featured", "popular"]) {
    revalidatePath(`/admin/products/${s}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Review actions — write to the EXISTING approvalStatus field (one enum, shared with
// the vendor pages). Each is ADMIN-gated + revalidates.
// ─────────────────────────────────────────────────────────────
export async function approveProduct(id: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { success: false, error: "Product not found." };
  try {
    await prisma.product.update({ where: { id }, data: { approvalStatus: "APPROVED" } });
    revalidateProduct(id);
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't approve the product. Please try again." };
  }
}

export async function denyProduct(id: string, reason?: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  // `reason` is validated for shape but NOT persisted — the Product model has no
  // rejectionReason field. TODO(moderation): store it once a moderation log/field exists.
  if (reason != null && reason.length > 500) {
    return { success: false, error: "Reason is too long (max 500 characters)." };
  }
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { success: false, error: "Product not found." };
  try {
    await prisma.product.update({ where: { id }, data: { approvalStatus: "REJECTED" } });
    revalidateProduct(id);
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't deny the product. Please try again." };
  }
}

export async function setProductFeatured(id: string, value: boolean): Promise<ActionResult<{ isFeatured: boolean }>> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { success: false, error: "Product not found." };
  try {
    const updated = await prisma.product.update({ where: { id }, data: { isFeatured: value }, select: { isFeatured: true } });
    revalidateProduct(id);
    return { success: true, data: { isFeatured: updated.isFeatured } };
  } catch {
    return { success: false, error: "Couldn't update the product. Please try again." };
  }
}

export async function setProductPopular(id: string, value: boolean): Promise<ActionResult<{ isPopular: boolean }>> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { success: false, error: "Product not found." };
  try {
    const updated = await prisma.product.update({ where: { id }, data: { isPopular: value }, select: { isPopular: true } });
    revalidateProduct(id);
    return { success: true, data: { isPopular: updated.isPopular } };
  } catch {
    return { success: false, error: "Couldn't update the product. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Delete (admin) — order-aware: if orders reference the product, DEACTIVATE to preserve
// order history; else hard-delete (variations cascade) + remove image files.
// TODO(order): no Order model yet, so orderCount is always 0 (always a hard delete).
// The deactivate branch is wired for when Orders land.
// ─────────────────────────────────────────────────────────────
export async function deleteAdminProduct(id: string): Promise<ActionResult<{ softDeleted: boolean }>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variations: { select: { image: true } } },
  });
  if (!product) return { success: false, error: "Product not found." };

  const orderCount = 0; // TODO(order): count order references once an Order model exists.
  try {
    if (orderCount > 0) {
      await prisma.product.update({ where: { id }, data: { isActive: false } });
      revalidateProduct(id);
      return { success: true, data: { softDeleted: true } };
    }
    const files = [product.thumbnail, ...((product.gallery as string[] | null) ?? []), ...product.variations.map((v) => v.image)];
    await prisma.product.delete({ where: { id } }); // variations cascade
    await Promise.all(files.map(deleteProductFile));
    revalidateProduct(id);
    return { success: true, data: { softDeleted: false } };
  } catch {
    return { success: false, error: "Couldn't delete the product. Please try again." };
  }
}
