import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/dashboard/Icon";
import { VendorStatusBadge } from "@/components/vendors/VendorStatusBadge";
import { VendorDetailActions } from "@/components/vendors/VendorDetailActions";
import { getVendor } from "../actions";

export const metadata: Metadata = { title: "Vendor details — Covet Admin" };

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-md bg-iris-50 text-iris-500">
        <Icon name={icon} size={16} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-soft">{label}</div>
        <div className="mt-1 break-words font-sans text-[14px] text-ink">{value}</div>
      </div>
    </div>
  );
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getVendor(id);
  if (!res.success || !res.data) notFound();
  const v = res.data;

  const stats: { label: string; value: number; icon: IconName; tone: string }[] = [
    { label: "Total products", value: v.productCount, icon: "box", tone: "bg-iris-50 text-iris-500" },
    { label: "Active products", value: v.activeProductCount, icon: "delivered", tone: "bg-success-bg text-success" },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Header card */}
      <div className="rounded-2xl border border-line-soft bg-surface p-[24px_26px] shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-5">
            <div className="flex h-[72px] w-[72px] flex-none items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
              <Icon name="store" size={32} strokeWidth={1.7} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="m-0 truncate font-display text-[26px] font-extrabold tracking-[-0.01em] text-ink">
                  {v.storeName}
                </h1>
                <VendorStatusBadge status={v.status} />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-sans text-[12.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="user" size={14} strokeWidth={1.9} className="text-muted-soft" />
                  {v.ownerName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="mail" size={14} strokeWidth={1.9} className="text-muted-soft" />
                  {v.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" size={14} strokeWidth={1.9} className="text-muted-soft" />
                  Registered {fmtDate(v.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <VendorDetailActions vendorId={v.id} storeName={v.storeName} status={v.status} />
        </div>
      </div>

      {/* Stats — extension point for later analytics */}
      <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between gap-3 rounded-2xl border border-line-soft bg-surface p-[20px_22px] shadow-xs"
          >
            <div>
              <div className="font-sans text-[12.5px] text-muted">{s.label}</div>
              <div className="mt-2.5 font-display text-[26px] font-extrabold text-ink">{s.value}</div>
            </div>
            <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-md ${s.tone}`}>
              <Icon name={s.icon} size={22} strokeWidth={1.8} />
            </span>
          </div>
        ))}
      </div>

      {/* Store info + Owner info */}
      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-2">
        <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
          <div className="mb-2 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-iris-50 text-iris-500">
              <Icon name="store" size={16} strokeWidth={2} />
            </span>
            <span className="font-display text-[16px] font-bold text-ink">Store Information</span>
          </div>
          <div className="divide-y divide-line-soft">
            <InfoRow icon="store" label="Store name" value={v.storeName} />
            <InfoRow icon="tag" label="Slug" value={<span className="font-mono text-[13px]">{v.slug}</span>} />
            <InfoRow icon="grid" label="Status" value={<VendorStatusBadge status={v.status} />} />
            <InfoRow icon="calendar" label="Registered" value={fmtDate(v.createdAt)} />
          </div>
        </div>

        <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
          <div className="mb-2 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-iris-50 text-iris-500">
              <Icon name="user" size={16} strokeWidth={2} />
            </span>
            <span className="font-display text-[16px] font-bold text-ink">Owner Information</span>
          </div>
          <div className="divide-y divide-line-soft">
            <InfoRow icon="user" label="Owner name" value={v.ownerName} />
            <InfoRow icon="mail" label="Email" value={v.email} />
            <InfoRow icon="phone" label="Phone" value={v.phone || <span className="text-muted-soft">Not provided</span>} />
            <InfoRow icon="calendar" label="Joined" value={fmtDate(v.ownerCreatedAt)} />
          </div>
        </div>
      </div>
    </div>
  );
}
