import { Icon, type IconName } from "@/components/dashboard/Icon";

/** Small inline empty state for storefront sections with no items yet. */
export function EmptyState({
  icon = "box",
  message,
}: {
  icon?: IconName;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-field text-muted-soft">
        <Icon name={icon} size={24} strokeWidth={1.75} />
      </span>
      <p className="font-sans text-sm text-muted">{message}</p>
    </div>
  );
}
