import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeCardPricing, formatMoney } from "@/lib/shop/pricing";

/**
 * Storefront data-fetching layer.
 *
 * EVERY product-returning query below applies the storefront visibility filter
 * (`STOREFRONT_VISIBILITY`: approvalStatus APPROVED + isActive true) so no
 * pending / denied / hidden product is ever shown. Money columns are Decimal and
 * are only exposed as formatted display strings (never raw Decimal to the client).
 *
 * Sales- and rating-ranked sections use documented PROXIES for now: there is no
 * Order model (→ TODO(orders)) and no Review model (→ TODO(reviews)) yet.
 */

/** Only APPROVED + active products are ever visible on the storefront. */
export const STOREFRONT_VISIBILITY = {
  approvalStatus: "APPROVED",
  isActive: true,
} satisfies Prisma.ProductWhereInput;

export type SubSubCategoryNode = {
  id: string;
  name: string;
  slug: string;
};

export type SubCategoryNode = {
  id: string;
  name: string;
  slug: string;
  children: SubSubCategoryNode[];
};

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  children: SubCategoryNode[];
};

/**
 * The full 3-level category tree (Category → SubCategory → SubSubCategory),
 * used by the storefront header mega-menu. Categories are navigation, not
 * products, so they are not visibility-filtered here — the product listing
 * pages apply product visibility. Ordered alphabetically at every level.
 */
export const getStorefrontCategoryTree = cache(async function getStorefrontCategoryTree(): Promise<
  CategoryNode[]
> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      subCategories: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          subSubCategories: {
            orderBy: { name: "asc" },
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    children: c.subCategories.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      children: s.subSubCategories.map((ss) => ({
        id: ss.id,
        name: ss.name,
        slug: ss.slug,
      })),
    })),
  }));
});

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/** Shared column set for product cards — keeps every list query consistent. */
const CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  thumbnail: true,
  price: true,
  compareAtPrice: true,
  discount: true,
  discountType: true,
  stock: true,
  isFeatured: true,
  isPopular: true,
  createdAt: true,
  vendor: { select: { storeName: true, slug: true } },
  brand: { select: { name: true, slug: true } },
  // Variation stock lets us compute in-stock without a second query (no N+1).
  variations: { select: { stock: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof CARD_SELECT }>;

/** The card shape every storefront product list returns. Money is display-ready. */
export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  seller: { storeName: string; slug: string };
  brand: { name: string; slug: string } | null;
  /** Final selling price, "$…". */
  price: string;
  /** Strikethrough price, or null when not on sale. */
  compareAt: string | null;
  /** Whole-percent discount badge, or null. */
  discountPercent: number | null;
  inStock: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  /** TODO(reviews): no Review model yet — always null / 0 for now. */
  rating: number | null;
  reviewCount: number;
  createdAt: string;
};

function toCard(p: CardRow): StorefrontProduct {
  const hasVariations = p.variations.length > 0;
  const variationStock = p.variations.reduce((sum, v) => sum + v.stock, 0);
  const inStock = hasVariations ? variationStock > 0 : p.stock > 0;
  const pricing = computeCardPricing(p);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnail: p.thumbnail,
    seller: { storeName: p.vendor.storeName, slug: p.vendor.slug },
    brand: p.brand ? { name: p.brand.name, slug: p.brand.slug } : null,
    price: pricing.price,
    compareAt: pricing.compareAt,
    discountPercent: pricing.discountPercent,
    inStock,
    isFeatured: p.isFeatured,
    isPopular: p.isPopular,
    rating: null,
    reviewCount: 0,
    createdAt: p.createdAt.toISOString(),
  };
}

/** Products a shopper can currently buy at a reduced price (has compare-at or a discount). */
async function findVisibleCards(
  where: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[],
  take: number,
): Promise<StorefrontProduct[]> {
  const rows = await prisma.product.findMany({
    where: { ...STOREFRONT_VISIBILITY, ...where },
    orderBy,
    take,
    select: CARD_SELECT,
  });
  return rows.map(toCard);
}

/** On-sale filter: an explicit discount OR a compare-at price above the price. */
const ON_SALE: Prisma.ProductWhereInput = {
  OR: [{ discount: { not: null } }, { compareAtPrice: { not: null } }],
};

/**
 * Flash Deal — on-sale products, newest first.
 * TODO(promotions): real time-boxed flash sales once a promotion model exists.
 */
export function getFlashDeals(take = 8): Promise<StorefrontProduct[]> {
  return findVisibleCards(ON_SALE, { createdAt: "desc" }, take);
}

/** Featured Products — admin-flagged `isFeatured`, most recently updated first. */
export function getFeaturedProducts(take = 10): Promise<StorefrontProduct[]> {
  return findVisibleCards({ isFeatured: true }, { updatedAt: "desc" }, take);
}

/**
 * Featured Deals — a curated strip of on-sale featured products.
 * TODO(promotions): replace with editorial/scheduled deals later.
 */
export function getFeaturedDeals(take = 4): Promise<StorefrontProduct[]> {
  return findVisibleCards(
    { AND: [{ isFeatured: true }, ON_SALE] },
    { updatedAt: "desc" },
    take,
  );
}

/** Latest Products — newest visible products. */
export function getLatestProducts(take = 10): Promise<StorefrontProduct[]> {
  return findVisibleCards({}, { createdAt: "desc" }, take);
}

/**
 * New Arrivals — newest visible products (same recency signal as Latest for now;
 * a distinct "arrived in the last N days" window can be added later).
 */
export function getNewArrivals(take = 10): Promise<StorefrontProduct[]> {
  return findVisibleCards({}, { createdAt: "desc" }, take);
}

/**
 * Best Selling — PROXY ranked by the admin `isPopular` flag, then recency.
 * TODO(orders): rank by real units sold once an Order model exists.
 */
export function getBestSelling(take = 10): Promise<StorefrontProduct[]> {
  return findVisibleCards({}, [{ isPopular: "desc" }, { createdAt: "desc" }], take);
}

/**
 * Top Rated — PROXY ranked by `isPopular` then `isFeatured`, then recency.
 * TODO(reviews): rank by real average rating once a Review model exists.
 */
export function getTopRated(take = 10): Promise<StorefrontProduct[]> {
  return findVisibleCards(
    {},
    [{ isPopular: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take,
  );
}

/** Products in a category (by slug). Returns [] if the category has none / is missing. */
export function getProductsByCategory(
  slug: string,
  take = 8,
): Promise<StorefrontProduct[]> {
  return findVisibleCards({ category: { slug } }, { createdAt: "desc" }, take);
}

/* ------------------------------------------------------------------ */
/* Categories, sellers, brands                                        */
/* ------------------------------------------------------------------ */

export type CategoryTile = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
};

/**
 * Shop by Category — every category with its count of currently-visible products.
 * One groupBy + one findMany (no per-category query). Ordered by count desc.
 */
export async function getCategoriesWithCount(): Promise<CategoryTile[]> {
  const [categories, grouped] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, image: true },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: STOREFRONT_VISIBILITY,
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(grouped.map((g) => [g.categoryId, g._count._all]));
  return categories
    .map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
}

export type TopSeller = {
  id: string;
  storeName: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  productCount: number;
};

/**
 * Top Sellers — PROXY ranked by number of currently-visible products per vendor.
 * TODO(orders): rank by real sales volume once an Order model exists.
 */
export async function getTopSellers(take = 8): Promise<TopSeller[]> {
  const grouped = await prisma.product.groupBy({
    by: ["vendorId"],
    where: STOREFRONT_VISIBILITY,
    _count: { _all: true },
    orderBy: { _count: { vendorId: "desc" } },
    take,
  });

  const ids = grouped.map((g) => g.vendorId);
  if (ids.length === 0) return [];

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: ids } },
    select: { id: true, storeName: true, slug: true, logo: true, coverImage: true },
  });
  const byId = new Map(vendors.map((v) => [v.id, v]));

  // Preserve the ranked order from the groupBy.
  return grouped
    .map((g) => {
      const v = byId.get(g.vendorId);
      return v ? { ...v, productCount: g._count._all } : null;
    })
    .filter((v): v is TopSeller => v !== null);
}

export type BrandTile = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
};

/**
 * Shop by Brand — active brands that have at least one visible product,
 * ranked by that product count.
 */
export async function getBrands(take = 12): Promise<BrandTile[]> {
  const grouped = await prisma.product.groupBy({
    by: ["brandId"],
    where: { ...STOREFRONT_VISIBILITY, brandId: { not: null } },
    _count: { _all: true },
  });

  const counts = new Map(
    grouped
      .filter((g): g is typeof g & { brandId: string } => g.brandId !== null)
      .map((g) => [g.brandId, g._count._all]),
  );
  if (counts.size === 0) return [];

  const brands = await prisma.brand.findMany({
    where: { status: "ACTIVE", id: { in: [...counts.keys()] } },
    select: { id: true, name: true, slug: true, image: true },
  });

  return brands
    .map((b) => ({ ...b, productCount: counts.get(b.id) ?? 0 }))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
    .slice(0, take);
}

/* ------------------------------------------------------------------ */
/* Quick view (Part 6)                                                */
/* ------------------------------------------------------------------ */

export type QuickViewVariation = {
  id: string;
  name: string;
  price: string;
  inStock: boolean;
  image: string | null;
  attributes: Record<string, string>;
};

export type QuickViewProduct = StorefrontProduct & {
  shortDescription: string | null;
  description: string;
  gallery: string[];
  categoryName: string;
  variations: QuickViewVariation[];
};

function parseGallery(gallery: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(gallery)) return [];
  return gallery.filter((g): g is string => typeof g === "string");
}

/**
 * Full product detail for the quick-view modal. Returns null when the product
 * does not exist or is not currently visible on the storefront.
 */
export async function getQuickViewProduct(
  id: string,
): Promise<QuickViewProduct | null> {
  const p = await prisma.product.findFirst({
    where: { id, ...STOREFRONT_VISIBILITY },
    select: {
      ...CARD_SELECT,
      shortDescription: true,
      description: true,
      gallery: true,
      category: { select: { name: true } },
      variations: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          image: true,
          attributes: true,
        },
      },
    },
  });
  if (!p) return null;

  const card = toCard({
    ...p,
    // toCard needs only variation stock; map the richer variations down to it.
    variations: p.variations.map((v) => ({ stock: v.stock })),
  });

  return {
    ...card,
    shortDescription: p.shortDescription,
    description: p.description,
    gallery: parseGallery(p.gallery),
    categoryName: p.category.name,
    variations: p.variations.map((v) => ({
      id: v.id,
      name: v.name,
      price: formatMoney(v.price),
      inStock: v.stock > 0,
      image: v.image,
      attributes:
        v.attributes && typeof v.attributes === "object" && !Array.isArray(v.attributes)
          ? (v.attributes as Record<string, string>)
          : {},
    })),
  };
}
