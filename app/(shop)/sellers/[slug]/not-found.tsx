import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

export default function StoreNotFound() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] py-16">
      <div className="flex flex-col items-center rounded-[20px] border border-dashed border-line bg-surface px-8 py-20 text-center">
        <span className="mb-[22px] flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
          <Icon name="store" size={36} strokeWidth={1.6} />
        </span>
        <h1 className="font-display text-[20px] font-bold leading-tight text-ink">
          Store not found
        </h1>
        <p className="mx-auto mb-6 mt-3 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
          This store doesn&apos;t exist or isn&apos;t currently available. Browse
          all approved sellers instead.
        </p>
        <Link
          href="/sellers"
          className="flex h-[46px] items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
        >
          All stores
        </Link>
      </div>
    </div>
  );
}
