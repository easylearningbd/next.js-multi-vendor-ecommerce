"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type BrandStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { brandCreateSchema, brandUpdateSchema } from "@/lib/brand-validation";
import {
  saveBrandImage,
  deleteBrandImage,
  ImageValidationError,
} from "@/lib/brand-upload";
import type {
  ActionResult,
  BrandDetail,
  BrandListItem,
  BrandListResult,
  BrandsQuery,
} from "@/lib/brand-types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Server-side ADMIN gate — enforced in EVERY action, never trusting the client.
 * Returns a data-less failure result (assignable to any ActionResult<T>) or null.
 */
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
      .slice(0, 60) || "brand"
  );
}

/** Generate a unique slug from the name, ignoring the brand being edited. */
async function uniqueBrandSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  // Bounded by real collisions, which are rare.
  while (true) {
    const existing = await prisma.brand.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

/**
 * How many products reference this brand. Always 0 until the Product model
 * exists (see prisma/schema.prisma TODO). Once it does, replace with:
 *   return prisma.product.count({ where: { brandId } });
 */
async function countBrandProducts(_brandId: string): Promise<number> {
  return 0;
}

// ─────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────
export async function createBrand(
  _prev: ActionResult<BrandListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<BrandListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = brandCreateSchema.safeParse({
    name: formData.get("name"),
    status: formData.get("status"),
    image: formData.get("image"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) fieldErrors[k] = v[0];
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const { name, status, image } = parsed.data;

  let imagePath: string | null = null;
  try {
    imagePath = await saveBrandImage(image);
  } catch (e) {
    if (e instanceof ImageValidationError) {
      return { success: false, fieldErrors: { image: e.message }, error: "Please fix the errors below." };
    }
    return { success: false, error: "Could not process the image. Please try again." };
  }

  try {
    const slug = await uniqueBrandSlug(name);
    const brand = await prisma.brand.create({
      data: { name, slug, status: status as BrandStatus, image: imagePath },
    });
    revalidatePath("/admin/brands");
    return { success: true, data: { ...brand, productCount: 0 } };
  } catch (e) {
    // Roll back the just-saved image so we don't leak an orphaned file.
    await deleteBrandImage(imagePath);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A brand with this name already exists" }, error: "A brand with this name already exists" };
    }
    return { success: false, error: "Something went wrong creating the brand. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────
export async function updateBrand(
  id: string,
  _prev: ActionResult<BrandListItem> | undefined,
  formData: FormData,
): Promise<ActionResult<BrandListItem>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "That brand no longer exists." };

  const parsed = brandUpdateSchema.safeParse({
    name: formData.get("name"),
    status: formData.get("status"),
    image: formData.get("image"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) fieldErrors[k] = v[0];
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const { name, status, image } = parsed.data;

  // Only touch the image if a new one was uploaded; otherwise keep the old one.
  let newImagePath: string | null = null;
  if (image) {
    try {
      newImagePath = await saveBrandImage(image);
    } catch (e) {
      if (e instanceof ImageValidationError) {
        return { success: false, fieldErrors: { image: e.message }, error: "Please fix the errors below." };
      }
      return { success: false, error: "Could not process the image. Please try again." };
    }
  }

  try {
    const slug =
      name === existing.name ? existing.slug : await uniqueBrandSlug(name, id);
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
        status: status as BrandStatus,
        ...(newImagePath ? { image: newImagePath } : {}),
      },
    });

    // Success: delete the replaced file only after the DB commit.
    if (newImagePath && existing.image) await deleteBrandImage(existing.image);

    revalidatePath("/admin/brands");
    revalidatePath(`/admin/brands/${id}`);
    return { success: true, data: { ...brand, productCount: await countBrandProducts(id) } };
  } catch (e) {
    // Roll back a newly uploaded image; keep the existing one intact.
    if (newImagePath) await deleteBrandImage(newImagePath);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, fieldErrors: { name: "A brand with this name already exists" }, error: "A brand with this name already exists" };
    }
    return { success: false, error: "Something went wrong updating the brand. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Delete (protected)
// ─────────────────────────────────────────────────────────────
export async function deleteBrand(id: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return { success: false, error: "That brand no longer exists." };

  const productCount = await countBrandProducts(id);
  if (productCount > 0) {
    return {
      success: false,
      error: `This brand is used by ${productCount} product${productCount === 1 ? "" : "s"}. Reassign or remove those products first, or deactivate the brand instead of deleting it.`,
    };
  }

  try {
    await prisma.brand.delete({ where: { id } });
    await deleteBrandImage(brand.image);
    revalidatePath("/admin/brands");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong deleting the brand. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Toggle status
// ─────────────────────────────────────────────────────────────
export async function toggleBrandStatus(
  id: string,
): Promise<ActionResult<{ status: BrandStatus }>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const brand = await prisma.brand.findUnique({ where: { id }, select: { status: true } });
  if (!brand) return { success: false, error: "That brand no longer exists." };

  const next: BrandStatus = brand.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  try {
    await prisma.brand.update({ where: { id }, data: { status: next } });
    revalidatePath("/admin/brands");
    revalidatePath(`/admin/brands/${id}`);
    return { success: true, data: { status: next } };
  } catch {
    return { success: false, error: "Couldn't update the status. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────
export async function getBrands(query: BrandsQuery = {}): Promise<ActionResult<BrandListResult>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const search = (query.search ?? "").trim();
  const statusFilter = query.status ?? "ALL";
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));

  const where: Prisma.BrandWhereInput = {
    ...(search ? { name: { contains: search } } : {}),
    ...(statusFilter !== "ALL" ? { status: statusFilter as BrandStatus } : {}),
  };

  try {
    const total = await prisma.brand.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    // Clamp so navigating past the last page never shows a false "empty" state.
    const safePage = Math.min(page, totalPages);

    const rows = await prisma.brand.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    });

    // productCount is 0 for every brand until the Product model exists.
    const brands: BrandListItem[] = rows.map((b) => ({ ...b, productCount: 0 }));

    return {
      success: true,
      data: { brands, total, page: safePage, pageSize, totalPages },
    };
  } catch {
    return { success: false, error: "Couldn't load brands. Please try again." };
  }
}

export async function getBrand(id: string): Promise<ActionResult<BrandDetail>> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return { success: false, error: "Brand not found." };

  // No Product model yet — counts are 0 and the product list is empty.
  const detail: BrandDetail = {
    ...brand,
    productCount: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    products: [],
  };
  return { success: true, data: detail };
}
