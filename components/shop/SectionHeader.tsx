import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

/**
 * Shared home-section header: title, optional subtitle, and an optional
 * "View all" link on the right (link only — destination pages built later).
 */
export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="m-0 font-display text-[27px] font-bold leading-[1.1] tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 font-sans text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex flex-none items-center gap-1.5 font-sans text-[13.5px] font-semibold text-iris-500 hover:text-iris-600"
        >
          {viewAllLabel}
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
