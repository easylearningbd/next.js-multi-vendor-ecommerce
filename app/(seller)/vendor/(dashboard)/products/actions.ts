"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type ProductApprovalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { productCoreSchema } from "@/lib/product-validation";
import { saveProductImage, deleteProductFile, FileValidationError } from "@/lib/product-upload";
import type {
  ActionResult,
  Option,
  Paginated,
  ProductDetail,
  ProductFormInitial,
  ProductFormOptions,
  ProductListItem,
  ProductsQuery,
} from "@/lib/product-types";

// ─────────────────────────────────────────────────────────────
// Session → vendor. Every product query is scoped to THIS vendorId, so a vendor
// can only ever see/mutate their own products (never trust a client-supplied id).
// ─────────────────────────────────────────────────────────────
async function requireVendor(): Promise<{ vendorId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { error: "You are not authorized to perform this action." };
  }
  let vendorId = session.user.vendorId ?? null;
  if (!vendorId) {
    const v = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    vendorId = v?.id ?? null;
  }
  if (!vendorId) return { error: "Your store profile could not be found." };
  return { vendorId };
}

function paginate(query: { page?: number; pageSize?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const requested = query.pageSize ?? 10;
  const pageSize = [10, 20, 50].includes(requested) ? requested : 10;
  return { page, pageSize };
}

const money = (d: Prisma.Decimal) => `$${d.toFixed(2)}`;

// ─────────────────────────────────────────────────────────────
// Read — this vendor's products (filter by approvalStatus + search + paginate)
// ─────────────────────────────────────────────────────────────
export async function getProducts(
  query: ProductsQuery = {},
): Promise<ActionResult<Paginated<ProductListItem>>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const search = (query.search ?? "").trim();
  const status = query.status ?? "ALL";
  const { page, pageSize } = paginate(query);

  const where: Prisma.ProductWhereInput = {
    vendorId: authed.vendorId, // session-scoped
    ...(status !== "ALL" ? { approvalStatus: status as ProductApprovalStatus } : {}),
    ...(search
      ? { OR: [{ name: { contains: search } }, { sku: { contains: search } }] }
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
        category: { select: { name: true } },
        variations: { select: { stock: true } },
      },
    });

    const items: ProductListItem[] = rows.map((p) => {
      const hasVariations = p.variations.length > 0;
      const stock = hasVariations
        ? p.variations.reduce((sum, v) => sum + v.stock, 0)
        : p.stock;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        thumbnail: p.thumbnail,
        categoryName: p.category.name,
        price: money(p.price),
        stock,
        hasVariations,
        approvalStatus: p.approvalStatus,
        isActive: p.isActive,
      };
    });

    return { success: true, data: { items, total, page: safePage, pageSize, totalPages } };
  } catch {
    return { success: false, error: "Couldn't load products. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Vendor's own show/hide toggle (isActive) — session-scoped
// ─────────────────────────────────────────────────────────────
export async function toggleProductActive(
  id: string,
): Promise<ActionResult<{ isActive: boolean }>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  // Scope the lookup to this vendor — a vendor cannot toggle another's product.
  const product = await prisma.product.findFirst({
    where: { id, vendorId: authed.vendorId },
    select: { isActive: true },
  });
  if (!product) return { success: false, error: "Product not found." };

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      select: { isActive: true },
    });
    revalidatePath("/vendor/products");
    return { success: true, data: { isActive: updated.isActive } };
  } catch {
    return { success: false, error: "Couldn't update the product. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Taxonomy options for the product form. Category taxonomy + brands are GLOBAL
// (not vendor-owned) but we still require an authenticated vendor to read them.
// Sub / sub-sub are fetched on demand (never ship the whole tree to the client).
// ─────────────────────────────────────────────────────────────
export async function getProductFormOptions(): Promise<ActionResult<ProductFormOptions>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };
  try {
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.brand.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
    return { success: true, data: { categories, brands } };
  } catch {
    return { success: false, error: "Couldn't load form options." };
  }
}

export async function getSubcategoryOptions(categoryId: string): Promise<ActionResult<Option[]>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };
  if (!categoryId) return { success: true, data: [] };
  try {
    const rows = await prisma.subCategory.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return { success: true, data: rows };
  } catch {
    return { success: false, error: "Couldn't load sub-categories." };
  }
}

export async function getSubSubcategoryOptions(
  subCategoryId: string,
): Promise<ActionResult<Option[]>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };
  if (!subCategoryId) return { success: true, data: [] };
  try {
    const rows = await prisma.subSubCategory.findMany({
      where: { subCategoryId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return { success: true, data: rows };
  } catch {
    return { success: false, error: "Couldn't load sub-sub-categories." };
  }
}

// ─────────────────────────────────────────────────────────────
// Create product — session-scoped, Zod-validated, one transaction, PENDING default.
// ─────────────────────────────────────────────────────────────
function slugify(input: string): string {
  return (
    input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) ||
    "product"
  );
}

async function uniqueProductSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function firstFieldErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

const dec = (n: number) => new Prisma.Decimal(n.toFixed(2));

export async function createProduct(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };
  const { vendorId } = authed;

  // Variations arrive as a JSON string; parse before Zod.
  let variationsRaw: unknown = [];
  try {
    variationsRaw = JSON.parse((formData.get("variations") as string) || "[]");
  } catch {
    return { success: false, error: "Invalid variation data." };
  }

  const parsed = productCoreSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    subCategoryId: formData.get("subCategoryId"),
    subSubCategoryId: formData.get("subSubCategoryId"),
    brandId: formData.get("brandId"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    discount: formData.get("discount"),
    discountType: formData.get("discountType") || "AMOUNT",
    taxRate: formData.get("taxRate"),
    stock: formData.get("stock") ?? 0,
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    hasVariations: formData.get("hasVariations") === "true",
    variations: variationsRaw,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  const d = parsed.data;

  // Verify the taxonomy/brand ids are real + consistent — never trust the client.
  const category = await prisma.category.findUnique({ where: { id: d.categoryId }, select: { id: true } });
  if (!category)
    return { success: false, error: "Please choose a valid category.", fieldErrors: { categoryId: "Choose a valid category" } };
  if (d.subCategoryId) {
    const sc = await prisma.subCategory.findFirst({ where: { id: d.subCategoryId, categoryId: d.categoryId }, select: { id: true } });
    if (!sc)
      return { success: false, error: "That sub-category doesn't belong to the category.", fieldErrors: { subCategoryId: "Invalid sub-category" } };
  }
  if (d.subSubCategoryId) {
    const ssc = await prisma.subSubCategory.findFirst({ where: { id: d.subSubCategoryId, subCategoryId: d.subCategoryId || undefined }, select: { id: true } });
    if (!ssc)
      return { success: false, error: "That sub-sub-category doesn't belong to the sub-category.", fieldErrors: { subSubCategoryId: "Invalid sub-sub-category" } };
  }
  if (d.brandId) {
    const b = await prisma.brand.findUnique({ where: { id: d.brandId }, select: { id: true } });
    if (!b) return { success: false, error: "Please choose a valid brand.", fieldErrors: { brandId: "Invalid brand" } };
  }

  // Save images (thumbnail required). Track for rollback on any later failure.
  const saved: string[] = [];
  let thumbnail: string;
  const galleryPaths: string[] = [];
  const variationImagePaths: (string | null)[] = d.variations.map(() => null);
  try {
    const thumbFile = formData.get("thumbnail");
    if (!(thumbFile instanceof File) || thumbFile.size === 0) {
      return { success: false, error: "A product thumbnail is required.", fieldErrors: { thumbnail: "Upload a thumbnail" } };
    }
    thumbnail = await saveProductImage(thumbFile);
    saved.push(thumbnail);

    for (const g of formData.getAll("gallery")) {
      if (g instanceof File && g.size > 0) {
        const p = await saveProductImage(g);
        saved.push(p);
        galleryPaths.push(p);
      }
    }

    for (let i = 0; i < d.variations.length; i++) {
      const idx = d.variations[i].imageIndex;
      if (idx == null || idx < 0) continue;
      const vf = formData.get(`varImage_${idx}`);
      if (vf instanceof File && vf.size > 0) {
        const p = await saveProductImage(vf);
        saved.push(p);
        variationImagePaths[i] = p;
      }
    }
  } catch (e) {
    await Promise.all(saved.map(deleteProductFile));
    if (e instanceof FileValidationError) return { success: false, error: e.message };
    return { success: false, error: "Could not process the uploaded images. Please try again." };
  }

  try {
    const slug = await uniqueProductSlug(d.name);
    const created = await prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          vendorId, // session-scoped
          name: d.name,
          slug,
          sku: d.sku || null,
          shortDescription: d.shortDescription || null,
          description: d.description,
          categoryId: d.categoryId,
          subCategoryId: d.subCategoryId || null,
          subSubCategoryId: d.subSubCategoryId || null,
          brandId: d.brandId || null,
          price: dec(d.price),
          compareAtPrice: d.compareAtPrice != null ? dec(d.compareAtPrice) : null,
          discount: d.discount != null ? dec(d.discount) : null,
          discountType: d.discountType,
          taxRate: d.taxRate != null ? new Prisma.Decimal(d.taxRate.toFixed(2)) : null,
          // If variations exist, per-variation stock is source of truth → top-level 0.
          stock: d.hasVariations ? 0 : d.stock,
          thumbnail,
          gallery: galleryPaths,
          metaTitle: d.metaTitle || null,
          metaDescription: d.metaDescription || null,
          approvalStatus: "PENDING", // new vendor products always start PENDING
          isActive: true,
          ...(d.hasVariations && d.variations.length
            ? {
                variations: {
                  create: d.variations.map((v, i) => ({
                    name: v.name,
                    sku: v.sku || null,
                    price: dec(v.price),
                    stock: v.stock,
                    image: variationImagePaths[i],
                    attributes: v.attributes,
                  })),
                },
              }
            : {}),
        },
        select: { id: true },
      });
    });

    revalidatePath("/vendor/products");
    return { success: true, data: { id: created.id } };
  } catch (e) {
    await Promise.all(saved.map(deleteProductFile));
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, error: "A product with a similar name already exists. Try a different name." };
    }
    return { success: false, error: "Something went wrong creating the product. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Load a vendor's OWN product for editing (session-scoped → 404 for other vendors).
// ─────────────────────────────────────────────────────────────
export async function getProductForEdit(id: string): Promise<ActionResult<ProductFormInitial>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const p = await prisma.product.findFirst({
    where: { id, vendorId: authed.vendorId },
    include: { variations: { orderBy: { createdAt: "asc" } } },
  });
  if (!p) return { success: false, error: "Product not found." };

  const [subOptions, subSubOptions] = await Promise.all([
    p.categoryId
      ? prisma.subCategory.findMany({ where: { categoryId: p.categoryId }, orderBy: { name: "asc" }, select: { id: true, name: true } })
      : Promise.resolve([]),
    p.subCategoryId
      ? prisma.subSubCategory.findMany({ where: { subCategoryId: p.subCategoryId }, orderBy: { name: "asc" }, select: { id: true, name: true } })
      : Promise.resolve([]),
  ]);

  return {
    success: true,
    data: {
      id: p.id,
      name: p.name,
      shortDescription: p.shortDescription ?? "",
      description: p.description,
      sku: p.sku ?? "",
      categoryId: p.categoryId,
      subCategoryId: p.subCategoryId ?? "",
      subSubCategoryId: p.subSubCategoryId ?? "",
      brandId: p.brandId ?? "",
      price: p.price.toString(),
      compareAtPrice: p.compareAtPrice?.toString() ?? "",
      discount: p.discount?.toString() ?? "",
      discountType: p.discountType,
      taxRate: p.taxRate?.toString() ?? "",
      stock: String(p.stock),
      metaTitle: p.metaTitle ?? "",
      metaDescription: p.metaDescription ?? "",
      thumbnail: p.thumbnail,
      gallery: (p.gallery as string[] | null) ?? [],
      hasVariations: p.variations.length > 0,
      variations: p.variations.map((v) => ({
        id: v.id,
        name: v.name,
        attributes: (v.attributes as Record<string, string>) ?? {},
        price: v.price.toString(),
        stock: String(v.stock),
        sku: v.sku ?? "",
        image: v.image,
      })),
      subOptions,
      subSubOptions,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Update — session-scoped, one transaction. Diffs variations (add/update/remove),
// replaces images cleanly, and RESETS approvalStatus→PENDING when a critical field
// (name, price, description, category) changed, so admins re-review material edits.
// ─────────────────────────────────────────────────────────────
type RawVariation = { id?: string | null; imageIndex?: number; keepImage?: boolean };

export async function updateProduct(
  id: string,
  _prev: ActionResult<{ id: string; approvalReset: boolean }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string; approvalReset: boolean }>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const existing = await prisma.product.findFirst({
    where: { id, vendorId: authed.vendorId }, // session-scoped
    include: { variations: true },
  });
  if (!existing) return { success: false, error: "Product not found." };

  let variationsRaw: unknown = [];
  try {
    variationsRaw = JSON.parse((formData.get("variations") as string) || "[]");
  } catch {
    return { success: false, error: "Invalid variation data." };
  }

  const parsed = productCoreSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    subCategoryId: formData.get("subCategoryId"),
    subSubCategoryId: formData.get("subSubCategoryId"),
    brandId: formData.get("brandId"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    discount: formData.get("discount"),
    discountType: formData.get("discountType") || "AMOUNT",
    taxRate: formData.get("taxRate"),
    stock: formData.get("stock") ?? 0,
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    hasVariations: formData.get("hasVariations") === "true",
    variations: variationsRaw,
  });
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors below.", fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const d = parsed.data;
  const rawAll = Array.isArray(variationsRaw) ? (variationsRaw as RawVariation[]) : [];

  // Same taxonomy/brand integrity checks as create.
  const category = await prisma.category.findUnique({ where: { id: d.categoryId }, select: { id: true } });
  if (!category) return { success: false, error: "Please choose a valid category.", fieldErrors: { categoryId: "Choose a valid category" } };
  if (d.subCategoryId) {
    const sc = await prisma.subCategory.findFirst({ where: { id: d.subCategoryId, categoryId: d.categoryId }, select: { id: true } });
    if (!sc) return { success: false, error: "That sub-category doesn't belong to the category.", fieldErrors: { subCategoryId: "Invalid sub-category" } };
  }
  if (d.subSubCategoryId) {
    const ssc = await prisma.subSubCategory.findFirst({ where: { id: d.subSubCategoryId, subCategoryId: d.subCategoryId || undefined }, select: { id: true } });
    if (!ssc) return { success: false, error: "That sub-sub-category doesn't belong to the sub-category.", fieldErrors: { subSubCategoryId: "Invalid sub-sub-category" } };
  }
  if (d.brandId) {
    const b = await prisma.brand.findUnique({ where: { id: d.brandId }, select: { id: true } });
    if (!b) return { success: false, error: "Please choose a valid brand.", fieldErrors: { brandId: "Invalid brand" } };
  }

  // Variations to keep (ignored entirely if the vendor turned variations off).
  const vlist = d.hasVariations ? d.variations : [];
  const rlist = d.hasVariations ? rawAll : [];

  // Save any NEW files first (rollback on later failure).
  const savedNew: string[] = [];
  let newThumb: string | undefined;
  const newGalleryPaths: string[] = [];
  const variationImage: (string | null)[] = vlist.map(() => null);
  try {
    const thumbFile = formData.get("thumbnail");
    if (thumbFile instanceof File && thumbFile.size > 0) {
      newThumb = await saveProductImage(thumbFile);
      savedNew.push(newThumb);
    }
    for (const g of formData.getAll("gallery")) {
      if (g instanceof File && g.size > 0) {
        const p = await saveProductImage(g);
        savedNew.push(p);
        newGalleryPaths.push(p);
      }
    }
    for (let i = 0; i < vlist.length; i++) {
      const rv = rlist[i] ?? {};
      if (typeof rv.imageIndex === "number" && rv.imageIndex >= 0) {
        const vf = formData.get(`varImage_${rv.imageIndex}`);
        if (vf instanceof File && vf.size > 0) {
          const p = await saveProductImage(vf);
          savedNew.push(p);
          variationImage[i] = p;
          continue;
        }
      }
      if (rv.keepImage && rv.id) {
        variationImage[i] = existing.variations.find((v) => v.id === rv.id)?.image ?? null;
      }
    }
  } catch (e) {
    await Promise.all(savedNew.map(deleteProductFile));
    if (e instanceof FileValidationError) return { success: false, error: e.message };
    return { success: false, error: "Could not process the uploaded images. Please try again." };
  }

  // Gallery: kept existing URLs + newly uploaded ones; removed ones deleted after commit.
  let keptGallery: string[] = [];
  try {
    keptGallery = JSON.parse((formData.get("keptGallery") as string) || "[]");
  } catch {
    keptGallery = [];
  }
  const existingGallery = (existing.gallery as string[] | null) ?? [];
  keptGallery = keptGallery.filter((g) => existingGallery.includes(g));
  const finalGallery = [...keptGallery, ...newGalleryPaths];
  const removedGallery = existingGallery.filter((g) => !keptGallery.includes(g));

  // Variation diff: existing rows whose id isn't resubmitted are deleted.
  const submittedIds = new Set(rlist.map((r) => r.id).filter(Boolean) as string[]);
  const toDeleteVars = existing.variations.filter((v) => !submittedIds.has(v.id));

  // Re-review trigger.
  const criticalChanged =
    existing.name !== d.name ||
    existing.description !== d.description ||
    existing.categoryId !== d.categoryId ||
    existing.price.toString() !== dec(d.price).toString();
  const approvalStatus = criticalChanged ? "PENDING" : existing.approvalStatus;

  try {
    await prisma.$transaction(async (tx) => {
      if (toDeleteVars.length) {
        await tx.productVariation.deleteMany({ where: { id: { in: toDeleteVars.map((v) => v.id) } } });
      }
      await tx.product.update({
        where: { id },
        data: {
          name: d.name,
          sku: d.sku || null,
          shortDescription: d.shortDescription || null,
          description: d.description,
          categoryId: d.categoryId,
          subCategoryId: d.subCategoryId || null,
          subSubCategoryId: d.subSubCategoryId || null,
          brandId: d.brandId || null,
          price: dec(d.price),
          compareAtPrice: d.compareAtPrice != null ? dec(d.compareAtPrice) : null,
          discount: d.discount != null ? dec(d.discount) : null,
          discountType: d.discountType,
          taxRate: d.taxRate != null ? new Prisma.Decimal(d.taxRate.toFixed(2)) : null,
          stock: d.hasVariations ? 0 : d.stock,
          gallery: finalGallery,
          metaTitle: d.metaTitle || null,
          metaDescription: d.metaDescription || null,
          approvalStatus,
          ...(newThumb ? { thumbnail: newThumb } : {}),
        },
      });
      for (let i = 0; i < vlist.length; i++) {
        const v = vlist[i];
        const rv = rlist[i] ?? {};
        const data = {
          name: v.name,
          sku: v.sku || null,
          price: dec(v.price),
          stock: v.stock,
          image: variationImage[i],
          attributes: v.attributes,
        };
        if (rv.id && existing.variations.some((e) => e.id === rv.id)) {
          await tx.productVariation.update({ where: { id: rv.id }, data });
        } else {
          await tx.productVariation.create({ data: { ...data, productId: id } });
        }
      }
    });

    // Post-commit file cleanup: replaced thumbnail, removed gallery, deleted variations,
    // and variation images that were replaced by a new upload.
    const stale: (string | null)[] = [];
    if (newThumb) stale.push(existing.thumbnail);
    removedGallery.forEach((g) => stale.push(g));
    toDeleteVars.forEach((v) => stale.push(v.image));
    for (let i = 0; i < vlist.length; i++) {
      const rv = rlist[i] ?? {};
      if (rv.id) {
        const ex = existing.variations.find((v) => v.id === rv.id);
        if (ex?.image && ex.image !== variationImage[i]) stale.push(ex.image);
      }
    }
    await Promise.all(stale.map(deleteProductFile));

    revalidatePath("/vendor/products");
    revalidatePath(`/vendor/products/${id}`);
    return { success: true, data: { id, approvalReset: criticalChanged } };
  } catch (e) {
    await Promise.all(savedNew.map(deleteProductFile));
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, error: "A product with a similar name already exists." };
    }
    return { success: false, error: "Couldn't save the product. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Delete — session-scoped. If the product is referenced by orders we must NOT orphan
// order history, so we DEACTIVATE (isActive=false) instead of hard-deleting. Otherwise
// hard-delete (variations cascade) and remove the image files from disk.
//
// TODO(order): there is no Order model yet, so `orderCount` is always 0 and delete is
// always a hard delete. When Orders land, count OrderItem rows referencing this product
// here — the soft-delete branch below is already wired.
// ─────────────────────────────────────────────────────────────
export async function deleteProduct(
  id: string,
): Promise<ActionResult<{ softDeleted: boolean }>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const product = await prisma.product.findFirst({
    where: { id, vendorId: authed.vendorId }, // session-scoped
    include: { variations: { select: { image: true } } },
  });
  if (!product) return { success: false, error: "Product not found." };

  const orderCount = 0; // TODO(order): count order references once an Order model exists.

  try {
    if (orderCount > 0) {
      // Preserve order history: deactivate rather than delete.
      await prisma.product.update({ where: { id }, data: { isActive: false } });
      revalidatePath("/vendor/products");
      return { success: true, data: { softDeleted: true } };
    }

    const files = [product.thumbnail, ...((product.gallery as string[] | null) ?? []), ...product.variations.map((v) => v.image)];
    await prisma.product.delete({ where: { id } }); // variations cascade
    await Promise.all(files.map(deleteProductFile));

    revalidatePath("/vendor/products");
    return { success: true, data: { softDeleted: false } };
  } catch {
    return { success: false, error: "Couldn't delete the product. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Full product for the details view — session-scoped (→ 404 for other vendors).
// ─────────────────────────────────────────────────────────────
export async function getProductDetail(id: string): Promise<ActionResult<ProductDetail>> {
  const authed = await requireVendor();
  if ("error" in authed) return { success: false, error: authed.error };

  const p = await prisma.product.findFirst({
    where: { id, vendorId: authed.vendorId }, // session-scoped
    include: {
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
