import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { getProductsByCategory } from "@/lib/shop/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";

/**
 * One home category rail (e.g. "Fashion"). If the category slug doesn't exist or
 * has no visible products yet, it renders a graceful empty state — never crashes.
 * TODO(catalog): rails are configured by slug in the page; a missing category
 * simply shows empty until products are added.
 */
export async function CategoryRailSection({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const products = await getProductsByCategory(slug, 5);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <div className="mb-[22px] flex items-center justify-between border-b border-line pb-4">
        <h2 className="m-0 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.01em] text-ink">
          {title}
        </h2>
        <Link
          href={`/category/${slug}`}
          className="flex items-center gap-1.5 whitespace-nowrap font-sans text-[13px] font-semibold text-iris-500 hover:text-iris-600"
        >
          View all
          <Icon name="chevronRight" size={15} strokeWidth={2} />
        </Link>
      </div>
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState message={`No products in ${title} yet.`} />
      )}
    </section>
  );
}
