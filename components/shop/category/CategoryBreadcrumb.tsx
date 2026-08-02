import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { CategoryTrailItem } from "@/lib/shop/queries";

/**
 * Category breadcrumb: Home / Category / Sub / Sub-Sub, built from the real
 * ancestor trail. Every segment links to its own level's listing; the current
 * (last) node is shown bold without a link.
 */
export function CategoryBreadcrumb({ trail }: { trail: CategoryTrailItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto flex max-w-[var(--container-max)] flex-wrap items-center gap-2 px-[var(--cpad)] pt-5 font-sans text-[13px] text-muted-soft"
    >
      <Link href="/" className="text-muted transition-colors hover:text-iris-500">
        Home
      </Link>
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={item.href} className="flex items-center gap-2">
            <Icon name="chevronRight" size={14} strokeWidth={2} className="text-muted-soft" />
            {isLast ? (
              <span className="font-semibold text-ink">{item.name}</span>
            ) : (
              <Link href={item.href} className="text-muted transition-colors hover:text-iris-500">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
