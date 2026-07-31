"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type {
  ActionResult,
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
