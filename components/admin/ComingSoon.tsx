import { Icon, type IconName } from "@/components/dashboard/Icon";

/** Placeholder content for admin sections that render inside the persistent
 *  shell but aren't built yet. Swap the body for the real page when ready. */
export function ComingSoon({
  title,
  subtitle,
  icon = "layers",
}: {
  title: string;
  subtitle: string;
  icon?: IconName;
}) {
  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">
          {title}
        </h1>
        <p className="mt-2.5 font-sans text-[14px] text-muted">{subtitle}</p>
      </div>
      <div className="flex flex-col items-center rounded-2xl border border-line-soft bg-surface px-8 py-20 text-center shadow-xs">
        <span className="mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl bg-iris-50 text-iris-400">
          <Icon name={icon} size={34} strokeWidth={1.6} />
        </span>
        <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">Coming soon</div>
        <p className="mx-auto mt-3 max-w-[380px] font-sans text-[14px] leading-[1.5] text-muted">
          The {title.toLowerCase()} section is under construction. It will appear here once built.
        </p>
      </div>
    </div>
  );
}
