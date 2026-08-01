import { prisma } from "@/lib/prisma";

/**
 * Storefront data-fetching layer.
 *
 * Part 1 (shell) needs only the category navigation tree. The product query
 * functions (flash deals, featured, top sellers, etc.) land in Part 3 and will
 * be added to this same module. Every product query added later MUST apply the
 * storefront visibility filter (approvalStatus APPROVED + isActive true) so no
 * pending / denied / hidden product is ever shown.
 */

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
export async function getStorefrontCategoryTree(): Promise<CategoryNode[]> {
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
}
