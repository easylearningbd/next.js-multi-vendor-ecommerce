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
export const CARD_SELECT = {
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

export type CardRow = Prisma.ProductGetPayload<{ select: typeof CARD_SELECT }>;

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
  /** Final selling price in integer cents (cart math / qty totals — no float). */
  priceCents: number;
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

export function toCard(p: CardRow): StorefrontProduct {
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
    priceCents: pricing.priceCents,
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
      attributes: toAttributes(v.attributes),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Product detail page (/products/[slug])                             */
/* ------------------------------------------------------------------ */

/** JSON attributes → a plain string map (e.g. { Color: "Red", Size: "M" }). */
function toAttributes(json: Prisma.JsonValue | null): Record<string, string> {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(json)) {
    if (typeof v === "string") out[k] = v;
    else if (v != null) out[k] = String(v);
  }
  return out;
}

/** Primary thumbnail + gallery images, de-duped, nulls dropped. */
function buildGallery(thumbnail: string | null, gallery: Prisma.JsonValue | null): string[] {
  return [...new Set([thumbnail, ...parseGallery(gallery)].filter((x): x is string => !!x))];
}

export type DetailVariation = {
  id: string;
  name: string;
  /** This variation's own price, display + integer cents (cart math). */
  price: string;
  priceCents: number;
  /** This variation's stock (for the qty stepper + out-of-stock). */
  stock: number;
  image: string | null;
  attributes: Record<string, string>;
};

export type CategoryPath = {
  category: { name: string; slug: string };
  subCategory: { name: string; slug: string } | null;
  subSubCategory: { name: string; slug: string } | null;
};

export type ProductDetail = StorefrontProduct & {
  vendorId: string;
  categoryId: string;
  sku: string | null;
  shortDescription: string | null;
  description: string;
  /** Full image list (thumbnail first). */
  gallery: string[];
  /** Base-product stock (used when there are no variations). */
  stock: number;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryPath: CategoryPath;
  vendor: { id: string; storeName: string; slug: string; logo: string | null };
  variations: DetailVariation[];
};

/**
 * Full product for the detail page — visibility-filtered. Returns null if the
 * slug is unknown or the product is not APPROVED+active (caller → notFound()).
 * One query with includes (no N+1); the vendor's product count / similar rails
 * are separate, intentional queries.
 */
export const getProductBySlug = cache(async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const p = await prisma.product.findFirst({
    where: { slug, ...STOREFRONT_VISIBILITY },
    select: {
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
      categoryId: true,
      sku: true,
      shortDescription: true,
      description: true,
      gallery: true,
      metaTitle: true,
      metaDescription: true,
      brand: { select: { name: true, slug: true } },
      vendor: { select: { id: true, storeName: true, slug: true, logo: true } },
      category: { select: { name: true, slug: true } },
      subCategory: { select: { name: true, slug: true } },
      subSubCategory: { select: { name: true, slug: true } },
      variations: {
        orderBy: { createdAt: "asc" },
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

  const card = toCard(p);

  return {
    ...card,
    vendorId: p.vendor.id,
    categoryId: p.categoryId,
    sku: p.sku,
    shortDescription: p.shortDescription,
    description: p.description,
    gallery: buildGallery(p.thumbnail, p.gallery),
    stock: p.stock,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    categoryPath: {
      category: p.category,
      subCategory: p.subCategory,
      subSubCategory: p.subSubCategory,
    },
    vendor: {
      id: p.vendor.id,
      storeName: p.vendor.storeName,
      slug: p.vendor.slug,
      logo: p.vendor.logo,
    },
    variations: p.variations.map((v) => {
      const pricing = computeCardPricing({
        price: v.price,
        compareAtPrice: null,
        discount: null,
        discountType: "AMOUNT",
      });
      return {
        id: v.id,
        name: v.name,
        price: pricing.price,
        priceCents: pricing.priceCents,
        stock: v.stock,
        image: v.image,
        attributes: toAttributes(v.attributes),
      };
    }),
  };
});

export type VendorSummary = {
  id: string;
  storeName: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  productCount: number;
  /** TODO(reviews): no Review model yet. */
  rating: number | null;
};

/** Vendor card data for the detail page: store info + its visible-product count. */
export async function getVendorForProduct(
  vendorId: string,
): Promise<VendorSummary | null> {
  const [vendor, productCount] = await Promise.all([
    prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true, slug: true, logo: true, coverImage: true },
    }),
    prisma.product.count({ where: { vendorId, ...STOREFRONT_VISIBILITY } }),
  ]);
  if (!vendor) return null;
  return { ...vendor, productCount, rating: null };
}

/** Other visible products from the same vendor (excludes the current product). */
export function getMoreFromVendor(
  vendorId: string,
  excludeProductId: string,
  take = 6,
): Promise<StorefrontProduct[]> {
  return findVisibleCards(
    { vendorId, id: { not: excludeProductId } },
    { createdAt: "desc" },
    take,
  );
}

/**
 * Visible products in the same (top-level) category, excluding the current one.
 * categoryId is already the broadest taxonomy level, so this is the natural
 * "similar" set; there is no parent above it to fall back to.
 */
export function getSimilarProducts(
  categoryId: string,
  excludeProductId: string,
  take = 6,
): Promise<StorefrontProduct[]> {
  return findVisibleCards(
    { categoryId, id: { not: excludeProductId } },
    { createdAt: "desc" },
    take,
  );
}

/* ------------------------------------------------------------------ */
/* Reviews — NO Review model exists yet (see Part 4).                 */
/* ------------------------------------------------------------------ */

export type ProductReview = {
  id: string;
  author: string;
  avatar: string | null;
  rating: number;
  date: string;
  text: string;
  photos: string[];
};

export type ProductReviews = {
  average: number | null;
  count: number;
  /** Bucketed 5★ → 1★ counts. */
  distribution: { stars: number; count: number }[];
  reviews: ProductReview[];
};

const REVIEW_DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/**
 * Public product reviews — APPROVED only (PENDING/REJECTED never reach shoppers).
 * The product's displayed rating is the mean of these approved reviews, so it is
 * recomputed on every load (and on revalidation after an admin approves/rejects).
 */
export async function getProductReviews(productId: string): Promise<ProductReviews> {
  const rows = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      images: true,
      createdAt: true,
      customer: { select: { name: true, image: true } },
    },
  });

  const count = rows.length;
  const average = count
    ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : null;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: rows.filter((r) => r.rating === stars).length,
  }));
  const reviews: ProductReview[] = rows.map((r) => ({
    id: r.id,
    author: r.customer.name,
    avatar: r.customer.image,
    rating: r.rating,
    date: REVIEW_DATE_FMT.format(r.createdAt),
    text: r.comment,
    photos: Array.isArray(r.images) ? (r.images as string[]) : [],
  }));

  return { average, count, distribution, reviews };
}

/* ------------------------------------------------------------------ */
/* Sellers — list (/sellers) + store (/sellers/[slug])                */
/* ------------------------------------------------------------------ */

/** Only APPROVED vendors are ever shown to shoppers (never PENDING/SUSPENDED). */
const APPROVED_VENDOR = { status: "APPROVED" } satisfies Prisma.VendorWhereInput;

/** Filtered relation count of a vendor's currently-visible products (Prisma 6). */
const VISIBLE_PRODUCT_COUNT = {
  select: { products: { where: STOREFRONT_VISIBILITY } },
} satisfies Prisma.VendorCountOutputTypeDefaultArgs;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type SellerCard = {
  id: string;
  storeName: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  /** TODO(reviews): no Review model / Vendor.rating yet. */
  rating: number | null;
  productCount: number;
};

export type VendorSort = "featured" | "newest" | "name" | "products";

/**
 * Approved vendors for the seller list, paginated. `productCount` counts only
 * APPROVED+active products. Sorts: featured/newest (recency), name (A–Z),
 * products (by total listing count — see note).
 */
export async function getApprovedVendors(opts: {
  search?: string;
  sort?: VendorSort;
  page?: number;
  perPage?: number;
} = {}): Promise<Paginated<SellerCard>> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? 12;
  const search = opts.search?.trim();

  const where: Prisma.VendorWhereInput = {
    ...APPROVED_VENDOR,
    ...(search ? { storeName: { contains: search } } : {}),
  };

  // NOTE: the "products" sort orders by total listing count (Prisma can't order
  // by a *filtered* relation count); the displayed count stays visible-only.
  const orderBy: Prisma.VendorOrderByWithRelationInput =
    opts.sort === "name"
      ? { storeName: "asc" }
      : opts.sort === "products"
        ? { products: { _count: "desc" } }
        : { createdAt: "desc" };

  const [total, vendors] = await Promise.all([
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        storeName: true,
        slug: true,
        logo: true,
        coverImage: true,
        _count: VISIBLE_PRODUCT_COUNT,
      },
    }),
  ]);

  return {
    items: vendors.map((v) => ({
      id: v.id,
      storeName: v.storeName,
      slug: v.slug,
      logo: v.logo,
      coverImage: v.coverImage,
      rating: null,
      productCount: v._count.products,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export type StoreProfile = {
  id: string;
  storeName: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  address: string | null;
  /** TODO(reviews): no Review model / Vendor.rating yet. */
  rating: number | null;
  reviewCount: number;
  /** TODO(orders): no Order model yet. */
  orderCount: number;
  productCount: number;
  joinedAt: string;
};

/**
 * Public store profile for an APPROVED vendor. Returns null for unknown or
 * non-approved (PENDING/SUSPENDED) vendors → caller should notFound().
 */
export const getVendorStore = cache(async function getVendorStore(
  slug: string,
): Promise<StoreProfile | null> {
  const v = await prisma.vendor.findFirst({
    where: { slug, ...APPROVED_VENDOR },
    select: {
      id: true,
      storeName: true,
      slug: true,
      logo: true,
      coverImage: true,
      address: true,
      createdAt: true,
      _count: VISIBLE_PRODUCT_COUNT,
    },
  });
  if (!v) return null;

  return {
    id: v.id,
    storeName: v.storeName,
    slug: v.slug,
    logo: v.logo,
    coverImage: v.coverImage,
    address: v.address,
    rating: null,
    reviewCount: 0,
    orderCount: 0,
    productCount: v._count.products,
    joinedAt: v.createdAt.toISOString(),
  };
});

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

/**
 * A vendor's APPROVED+active products, paginated, with optional in-store search,
 * sort, and category filter. Money is display-ready (no float, no N+1).
 */
export async function getVendorProducts(
  vendorId: string,
  opts: {
    search?: string;
    sort?: ProductSort;
    category?: string;
    brand?: string;
    page?: number;
    perPage?: number;
  } = {},
): Promise<Paginated<StorefrontProduct>> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? 12;
  const search = opts.search?.trim();

  const where: Prisma.ProductWhereInput = {
    vendorId,
    ...STOREFRONT_VISIBILITY,
    ...(search ? { name: { contains: search } } : {}),
    ...(opts.category ? { category: { slug: opts.category } } : {}),
    ...(opts.brand ? { brand: { slug: opts.brand } } : {}),
  };

  // One store's catalog is bounded, so we fetch all matching cards and sort +
  // paginate in memory. This lets the price sort use the FINAL (discounted)
  // price the shopper sees — not the raw list price a DB orderBy would use.
  const cards = (
    await prisma.product.findMany({ where, select: CARD_SELECT })
  ).map(toCard);

  switch (opts.sort) {
    case "price-asc":
      cards.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      cards.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "name":
      cards.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default: // newest — ISO timestamps sort lexicographically
      cards.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
  }

  const total = cards.length;
  const items = cards.slice((page - 1) * perPage, page * perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export type StoreFacet = { name: string; slug: string; count: number };
export type StoreFacets = { categories: StoreFacet[]; brands: StoreFacet[] };

/**
 * Category + brand facets for a store's filter sidebar — derived ONLY from that
 * vendor's currently-visible products (so filters are scoped to the store), each
 * with a live count. Two groupBys + two id-lookups (no N+1).
 */
export async function getVendorStoreFacets(
  vendorId: string,
): Promise<StoreFacets> {
  const scope = { vendorId, ...STOREFRONT_VISIBILITY };
  const [catGroups, brandGroups] = await Promise.all([
    prisma.product.groupBy({
      by: ["categoryId"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["brandId"],
      where: { ...scope, brandId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const catCount = new Map(catGroups.map((g) => [g.categoryId, g._count._all]));
  const brandCount = new Map(
    brandGroups
      .filter((g): g is typeof g & { brandId: string } => g.brandId !== null)
      .map((g) => [g.brandId, g._count._all]),
  );

  const [cats, brands] = await Promise.all([
    catCount.size
      ? prisma.category.findMany({
          where: { id: { in: [...catCount.keys()] } },
          select: { id: true, name: true, slug: true },
        })
      : [],
    brandCount.size
      ? prisma.brand.findMany({
          where: { id: { in: [...brandCount.keys()] } },
          select: { id: true, name: true, slug: true },
        })
      : [],
  ]);

  const byCount = (a: StoreFacet, b: StoreFacet) =>
    b.count - a.count || a.name.localeCompare(b.name);

  return {
    categories: cats
      .map((c) => ({ name: c.name, slug: c.slug, count: catCount.get(c.id) ?? 0 }))
      .sort(byCount),
    brands: brands
      .map((b) => ({ name: b.name, slug: b.slug, count: brandCount.get(b.id) ?? 0 }))
      .sort(byCount),
  };
}

/* ------------------------------------------------------------------ */
/* Category listing (/category/[...slug])                             */
/* ------------------------------------------------------------------ */

export type CategoryTrailItem = {
  name: string;
  slug: string;
  href: string;
  level: 1 | 2 | 3;
};
export type CategoryChild = { name: string; slug: string; href: string };

export type ResolvedCategory = {
  level: 1 | 2 | 3;
  id: string;
  name: string;
  slug: string;
  /** Slug path segments, e.g. ["fashion","t-shirt"]. */
  path: string[];
  /** Selects every visible product at OR below this node (FKs are denormalized). */
  productWhere: Prisma.ProductWhereInput;
  /** Ancestor chain incl. the node itself, for the breadcrumb (Home added in UI). */
  trail: CategoryTrailItem[];
  /** Direct child categories (for the in-category sub-nav). Empty at leaf level. */
  children: CategoryChild[];
};

const _resolveCategoryPath = cache(
  async (key: string): Promise<ResolvedCategory | null> => {
    const path = key.split("/").filter(Boolean);
    if (path.length < 1 || path.length > 3) return null;
    const [catSlug, subSlug, subSubSlug] = path;

    const category = await prisma.category.findUnique({
      where: { slug: catSlug },
      select: { id: true, name: true, slug: true },
    });
    if (!category) return null;

    const catHref = `/category/${category.slug}`;
    const catTrail: CategoryTrailItem = {
      name: category.name,
      slug: category.slug,
      href: catHref,
      level: 1,
    };

    if (path.length === 1) {
      const children = await prisma.subCategory.findMany({
        where: { categoryId: category.id },
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      });
      return {
        level: 1,
        id: category.id,
        name: category.name,
        slug: category.slug,
        path: [category.slug],
        productWhere: { categoryId: category.id },
        trail: [catTrail],
        children: children.map((c) => ({
          name: c.name,
          slug: c.slug,
          href: `${catHref}/${c.slug}`,
        })),
      };
    }

    // Nesting is validated by scoping each lookup to its parent id.
    const sub = await prisma.subCategory.findFirst({
      where: { categoryId: category.id, slug: subSlug },
      select: { id: true, name: true, slug: true },
    });
    if (!sub) return null;

    const subHref = `${catHref}/${sub.slug}`;
    const subTrail: CategoryTrailItem = {
      name: sub.name,
      slug: sub.slug,
      href: subHref,
      level: 2,
    };

    if (path.length === 2) {
      const children = await prisma.subSubCategory.findMany({
        where: { subCategoryId: sub.id },
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      });
      return {
        level: 2,
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        path: [category.slug, sub.slug],
        productWhere: { subCategoryId: sub.id },
        trail: [catTrail, subTrail],
        children: children.map((c) => ({
          name: c.name,
          slug: c.slug,
          href: `${subHref}/${c.slug}`,
        })),
      };
    }

    const subSub = await prisma.subSubCategory.findFirst({
      where: { subCategoryId: sub.id, slug: subSubSlug },
      select: { id: true, name: true, slug: true },
    });
    if (!subSub) return null;

    const subSubHref = `${subHref}/${subSub.slug}`;
    return {
      level: 3,
      id: subSub.id,
      name: subSub.name,
      slug: subSub.slug,
      path: [category.slug, sub.slug, subSub.slug],
      productWhere: { subSubCategoryId: subSub.id },
      trail: [
        catTrail,
        subTrail,
        { name: subSub.name, slug: subSub.slug, href: subSubHref, level: 3 },
      ],
      children: [],
    };
  },
);

/**
 * Resolve a /category/[...slug] path to its node + ancestor chain, validating
 * that the path is real and correctly nested. Returns null → caller notFound().
 */
export function resolveCategoryPath(
  slugArray: string[],
): Promise<ResolvedCategory | null> {
  return _resolveCategoryPath(slugArray.join("/"));
}

export type CategorySort = "newest" | "price-asc" | "price-desc" | "rating";

/**
 * All APPROVED+active products at or below a category node, with in-category
 * search + brand (DB-level) and price range + sort (on the FINAL displayed
 * price) + pagination. Price/sort run in memory so they use the discounted
 * price the shopper sees; TODO(scale): move to a stored computed-price column
 * if a single category ever holds very many products.
 */
export async function getCategoryProducts(
  node: ResolvedCategory,
  opts: {
    min?: number;
    max?: number;
    brand?: string;
    sort?: CategorySort;
    page?: number;
    perPage?: number;
    search?: string;
  } = {},
): Promise<Paginated<StorefrontProduct>> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? 12;
  const search = opts.search?.trim();

  const where: Prisma.ProductWhereInput = {
    ...node.productWhere,
    ...STOREFRONT_VISIBILITY,
    ...(search ? { name: { contains: search } } : {}),
    ...(opts.brand ? { brand: { slug: opts.brand } } : {}),
  };

  let cards = (
    await prisma.product.findMany({ where, select: CARD_SELECT })
  ).map(toCard);

  if (opts.min != null) {
    const minC = Math.round(opts.min * 100);
    cards = cards.filter((c) => c.priceCents >= minC);
  }
  if (opts.max != null) {
    const maxC = Math.round(opts.max * 100);
    cards = cards.filter((c) => c.priceCents <= maxC);
  }

  switch (opts.sort) {
    case "price-asc":
      cards.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      cards.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "rating":
      // TODO(reviews): no ratings yet — proxy by the admin isPopular flag, then recency.
      cards.sort(
        (a, b) =>
          Number(b.isPopular) - Number(a.isPopular) ||
          b.createdAt.localeCompare(a.createdAt),
      );
      break;
    default: // newest / relevance
      cards.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
  }

  const total = cards.length;
  const items = cards.slice((page - 1) * perPage, page * perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export type CategoryFilters = {
  /** Brands actually present in this category's visible products, with counts. */
  brands: StoreFacet[];
  /** Final-price range (whole dollars) of this category's visible products. */
  priceMin: number;
  priceMax: number;
};

/**
 * The brands + price range that actually exist among this category's visible
 * products, so the sidebar offers real, relevant options — not the whole store.
 */
export async function getFiltersForCategory(
  node: ResolvedCategory,
): Promise<CategoryFilters> {
  const cards = (
    await prisma.product.findMany({
      where: { ...node.productWhere, ...STOREFRONT_VISIBILITY },
      select: CARD_SELECT,
    })
  ).map(toCard);

  const brandMap = new Map<string, StoreFacet>();
  for (const c of cards) {
    if (!c.brand) continue;
    const e = brandMap.get(c.brand.slug);
    if (e) e.count += 1;
    else brandMap.set(c.brand.slug, { name: c.brand.name, slug: c.brand.slug, count: 1 });
  }
  const brands = [...brandMap.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

  const cents = cards.map((c) => c.priceCents);
  const priceMin = cents.length ? Math.floor(Math.min(...cents) / 100) : 0;
  const priceMax = cents.length ? Math.ceil(Math.max(...cents) / 100) : 0;

  return { brands, priceMin, priceMax };
}
