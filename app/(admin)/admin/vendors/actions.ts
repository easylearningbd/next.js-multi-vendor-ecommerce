"use server";

import { revalidatePath } from "next/cache";
import type { Prisma, VendorStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type {
  ActionResult,
  Paginated,
  VendorDetail,
  VendorListItem,
  VendorsQuery,
} from "@/lib/vendor-types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "You are not authorized to perform this action." };
  }
  return null;
}

function paginate(query: { page?: number; pageSize?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
  return { page, pageSize };
}

/** Refresh the vendor list/approval/details routes (and the sidebar pending badge). */
function revalidateVendor(id?: string) {
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/vendors/approval");
  if (id) revalidatePath(`/admin/vendors/${id}`);
}

// Product counts are COMPUTED. No Product model yet → 0. When Product exists, use
// `_count.products` on the Vendor include below. See schema TODO(product).
const PRODUCT_COUNT = 0;

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export async function getVendors(
  query: VendorsQuery = {},
): Promise<ActionResult<Paginated<VendorListItem>>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const search = (query.search ?? "").trim();
  const status = query.status ?? "ALL";
  const { page, pageSize } = paginate(query);

  const where: Prisma.VendorWhereInput = {
    ...(status !== "ALL" ? { status: status as VendorStatus } : {}),
    ...(search
      ? {
          OR: [
            { storeName: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
          ],
        }
      : {}),
  };

  try {
    const total = await prisma.vendor.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const rows = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    });
    const items: VendorListItem[] = rows.map((v) => ({
      id: v.id,
      storeName: v.storeName,
      slug: v.slug,
      status: v.status,
      ownerName: v.user.name,
      email: v.user.email,
      createdAt: v.createdAt,
      productCount: PRODUCT_COUNT,
    }));
    return { success: true, data: { items, total, page: safePage, pageSize, totalPages } };
  } catch {
    return { success: false, error: "Couldn't load vendors. Please try again." };
  }
}

export async function getVendor(id: string): Promise<ActionResult<VendorDetail>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const v = await prisma.vendor.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, phone: true, createdAt: true } } },
  });
  if (!v) return { success: false, error: "Vendor not found." };

  return {
    success: true,
    data: {
      id: v.id,
      storeName: v.storeName,
      slug: v.slug,
      status: v.status,
      ownerName: v.user.name,
      email: v.user.email,
      phone: v.user.phone,
      createdAt: v.createdAt,
      ownerCreatedAt: v.user.createdAt,
      productCount: PRODUCT_COUNT,
      activeProductCount: PRODUCT_COUNT,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Status transitions (Approve = PENDING/SUSPENDED → APPROVED, Suspend = APPROVED → SUSPENDED)
// ─────────────────────────────────────────────────────────────

async function setStatus(
  id: string,
  next: VendorStatus,
): Promise<ActionResult<{ status: VendorStatus }>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { id: true } });
  if (!vendor) return { success: false, error: "That vendor no longer exists." };

  try {
    await prisma.vendor.update({ where: { id }, data: { status: next } });
    revalidateVendor(id);
    return { success: true, data: { status: next } };
  } catch {
    return { success: false, error: "Couldn't update the vendor status. Please try again." };
  }
}

export async function approveVendor(id: string) {
  return setStatus(id, "APPROVED");
}

export async function suspendVendor(id: string) {
  return setStatus(id, "SUSPENDED");
}
