import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { CategoryPath } from "@/lib/shop/queries";

/**
 * Product breadcrumb built from the real category path
 * (Home › Category › Sub › Sub-sub › Product). Category links use the same
 * scheme as the header/hero mega-menu.
 */
export function ProductBreadcrumb({
  path,
  productName,
}: {
  path: CategoryPath;
  productName: string;
}) {
  const catSlug = path.category.slug;
  const crumbs: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
    { label: path.category.name, href: `/category/${catSlug}` },
  ];
  if (path.subCategory) {
    crumbs.push({
      label: path.subCategory.name,
      href: `/category/${catSlug}/${path.subCategory.slug}`,
    });
  }
  if (path.subCategory && path.subSubCategory) {
    crumbs.push({
      label: path.subSubCategory.name,
      href: `/category/${catSlug}/${path.subCategory.slug}/${path.subSubCategory.slug}`,
    });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto flex max-w-[var(--container-max)] flex-wrap items-center gap-2 px-[var(--cpad)] pt-5 font-sans text-[13px] text-muted-soft"
    >
      {crumbs.map((c) => (
        <span key={c.href} className="flex items-center gap-2">
          <Link href={c.href} className="text-muted transition-colors hover:text-iris-500">
            {c.label}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} className="text-muted-soft" />
        </span>
      ))}
      <span className="font-semibold text-ink">{productName}</span>
    </nav>
  );
}
