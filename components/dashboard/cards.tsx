import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type Tone = "iris" | "info" | "success" | "warning" | "error" | "amber";

export function toneChip(tone: Tone): string {
  switch (tone) {
    case "info":
      return "bg-info-bg text-info";
    case "success":
      return "bg-success-bg text-success";
    case "warning":
      return "bg-warning-bg text-warning";
    case "error":
      return "bg-error-bg text-error";
    case "amber":
      return "bg-warning-bg text-star";
    default:
      return "bg-iris-50 text-iris-500";
  }
}

/** White analytics card wrapper. */
export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs ${className}`}>
      {children}
    </div>
  );
}

/** Section header row: small tinted icon chip + title + optional "View All". */
export function SectionHead({
  icon,
  tone = "iris",
  title,
  viewAll,
  filled,
}: {
  icon: IconName;
  tone?: Tone;
  title: string;
  viewAll?: boolean;
  filled?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${toneChip(tone)}`}>
          <Icon name={icon} size={16} strokeWidth={filled ? 0 : 2} />
        </span>
        <span className="font-display text-[15px] font-bold text-ink sm:text-[16px]">{title}</span>
      </div>
      {viewAll && (
        <a href="#" className="font-sans text-[12.5px] font-semibold text-iris-500 hover:text-iris-600">
          View All
        </a>
      )}
    </div>
  );
}

/** Repeating-diagonal placeholder for a product/store image. */
export function Thumb({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-field ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(20,18,31,.022) 0 8px,transparent 8px 16px)",
        }}
      />
    </div>
  );
}

/** Horizontal order-status stat (icon chip + label + number). */
export function StatusStat({
  tone,
  icon,
  label,
  value,
  numClass = "text-ink",
  chipSize = 40,
}: {
  tone: Tone;
  icon: IconName;
  label: string;
  value: number | string;
  numClass?: string;
  chipSize?: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line-soft bg-bg-subtle p-4 transition-shadow hover:shadow-sm">
      <span
        className={`flex flex-none items-center justify-center rounded-md ${toneChip(tone)}`}
        style={{ width: chipSize, height: chipSize }}
      >
        <Icon name={icon} size={18} />
      </span>
      <span className="flex-1 font-sans text-[12.5px] leading-[1.2] text-ink-soft">{label}</span>
      <span className={`font-display text-[20px] font-extrabold ${numClass}`}>{value}</span>
    </div>
  );
}

/** Rated product row: thumb + title + seller + star rating. */
export function RatedRow({
  title,
  subtitle,
  rating,
  reviews,
}: {
  title: string;
  subtitle: string;
  rating: number | string;
  reviews: number;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-line-soft p-3 hover:bg-bg-subtle">
      <Thumb className="h-[52px] w-[52px] flex-none rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="font-sans text-[13.5px] font-semibold leading-[1.3] text-ink">{title}</div>
        <div className="mt-1.5 font-sans text-[11px] text-iris-500">{subtitle}</div>
        <div className="mt-2 flex items-center gap-1.5">
          <Icon name="star" size={13} className="text-star" />
          <span className="font-display text-[12.5px] font-bold text-ink">{rating}</span>
          <span className="font-sans text-[12px] text-muted-soft">({reviews} Reviews)</span>
        </div>
      </div>
    </div>
  );
}

/** Top-selling product tile: thumb + title + price + sold pill. */
export function ProductTile({
  title,
  seller,
  price,
  sold,
}: {
  title: string;
  seller?: string;
  price: string;
  sold: number;
}) {
  return (
    <div className="rounded-xl border border-line-soft p-3.5 text-center transition-shadow hover:shadow-sm">
      <Thumb className="mb-2.5 aspect-square rounded-md" />
      <div className="min-h-[32px] font-sans text-[12.5px] font-semibold leading-[1.3] text-ink">{title}</div>
      {seller && <div className="mt-1.5 font-sans text-[10.5px] text-iris-500">{seller}</div>}
      <div className="mb-1 mt-2 font-sans text-[11px] text-muted-soft">Total Sold Price</div>
      <div className="mb-2.5 font-display text-[14px] font-bold text-ink">{price}</div>
      <span className="inline-flex items-center rounded-full bg-iris-50 px-3 py-1.5 font-sans text-[11px] font-semibold text-accent-fg">
        Sold : {sold}
      </span>
    </div>
  );
}

/** A wallet metric card that may show one or two value/label pairs. */
export function WalletStat({
  icon,
  v1,
  l1,
  v2,
  l2,
}: {
  icon: IconName;
  v1: string;
  l1: string;
  v2?: string;
  l2?: string;
}) {
  return (
    <div className="flex flex-1 items-start justify-between gap-3 rounded-lg border border-line-soft bg-bg-subtle p-5">
      <div>
        <div className="font-display text-[21px] font-extrabold text-ink">{v1}</div>
        <div className="mt-1.5 font-sans text-[12.5px] text-muted">{l1}</div>
        {v2 && (
          <>
            <div className="mt-3.5 font-display text-[21px] font-extrabold text-ink">{v2}</div>
            <div className="mt-1.5 font-sans text-[12.5px] text-muted">{l2}</div>
          </>
        )}
      </div>
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-iris-50 text-iris-500">
        <Icon name={icon} size={22} strokeWidth={1.7} />
      </span>
    </div>
  );
}
