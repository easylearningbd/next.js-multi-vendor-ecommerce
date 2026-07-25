"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type VendorStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { addVendorSchema } from "@/lib/vendor-validation";
import {
  saveVendorImage,
  saveVendorCertificate,
  deleteVendorFile,
  FileValidationError,
} from "@/lib/vendor-upload";
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
      logo: v.logo,
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
      logo: v.logo,
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

// ─────────────────────────────────────────────────────────────
// Admin-created vendor (pre-approved). One transaction: User(VENDOR) + Vendor(APPROVED).
// ─────────────────────────────────────────────────────────────

function firstFieldErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

function slugify(input: string): string {
  return (
    input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) ||
    "store"
  );
}

async function uniqueVendorSlug(storeName: string): Promise<string> {
  const base = slugify(storeName);
  let slug = base;
  let n = 1;
  while (await prisma.vendor.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function createVendorByAdmin(
  _prev: ActionResult<{ vendorId: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ vendorId: string }>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = addVendorSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    storeName: formData.get("storeName"),
    address: formData.get("address"),
    image: formData.get("image"),
    logo: formData.get("logo"),
    coverImage: formData.get("coverImage"),
    tinNumber: formData.get("tinNumber"),
    tinExpireDate: formData.get("tinExpireDate"),
    tinCertificate: formData.get("tinCertificate"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const d = parsed.data;

  // Reject a duplicate email early (friendly) before touching disk.
  const existing = await prisma.user.findUnique({ where: { email: d.email }, select: { id: true } });
  if (existing) {
    return { success: false, fieldErrors: { email: "An account with this email already exists" }, error: "An account with this email already exists" };
  }

  // Save uploads (magic-byte validated). Track for rollback on failure.
  const saved: string[] = [];
  let imagePath: string, logoPath: string, coverPath: string;
  let certPath: string | null = null;
  try {
    imagePath = await saveVendorImage(d.image);
    saved.push(imagePath);
    logoPath = await saveVendorImage(d.logo);
    saved.push(logoPath);
    coverPath = await saveVendorImage(d.coverImage);
    saved.push(coverPath);
    if (d.tinCertificate) {
      certPath = await saveVendorCertificate(d.tinCertificate);
      saved.push(certPath);
    }
  } catch (e) {
    await Promise.all(saved.map(deleteVendorFile));
    if (e instanceof FileValidationError) {
      return { success: false, error: e.message };
    }
    return { success: false, error: "Could not process the uploaded files. Please try again." };
  }

  const name = `${d.firstName} ${d.lastName}`.trim();
  const passwordHash = await bcrypt.hash(d.password, 12);
  const tinExpire =
    d.tinExpireDate && !Number.isNaN(new Date(d.tinExpireDate).getTime())
      ? new Date(d.tinExpireDate)
      : null;

  try {
    const slug = await uniqueVendorSlug(d.storeName);
    const vendor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email: d.email, passwordHash, phone: d.phone, role: "VENDOR" },
      });
      return tx.vendor.create({
        data: {
          userId: user.id,
          storeName: d.storeName,
          slug,
          status: "APPROVED", // admin-created vendors are pre-approved
          image: imagePath,
          logo: logoPath,
          coverImage: coverPath,
          address: d.address,
          tinNumber: d.tinNumber || null,
          tinExpireDate: tinExpire,
          tinCertificate: certPath,
        },
      });
    });

    revalidateVendor(vendor.id);
    return { success: true, data: { vendorId: vendor.id } };
  } catch (e) {
    await Promise.all(saved.map(deleteVendorFile));
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { email: "An account with this email already exists" }, error: "An account with this email already exists" };
    }
    return { success: false, error: "Something went wrong creating the vendor. Please try again." };
  }
}
