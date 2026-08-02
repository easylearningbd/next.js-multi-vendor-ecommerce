import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

export default function CategoryNotFound() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] py-16">
      <div className="flex flex-col items-center rounded-[20px] border border-dashed border-line bg-surface px-8 py-20 text-center">
        <span className="mb-[22px] flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
          <Icon name="grid" size={36} strokeWidth={1.6} />
        </span>
        <h1 className="font-display text-[20px] font-bold leading-tight text-ink">
          Category not found
        </h1>
        <p className="mx-auto mb-6 mt-3 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
          This category doesn&apos;t exist. Head back to the storefront to keep
          browsing.
        </p>
        <Link
          href="/"
          className="flex h-[46px] items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
