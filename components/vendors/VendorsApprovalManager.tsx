"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { VendorListItem } from "@/lib/vendor-types";
import { Icon } from "@/components/dashboard/Icon";
import { BrandsPagination } from "@/components/brands/BrandsPagination";
import { VendorStatusBadge } from "./VendorStatusBadge";
import { VendorsToolbar } from "./VendorsToolbar";

const GRID = "grid-cols-[44px_minmax(150px,1.2fr)_minmax(120px,1fr)_minmax(150px,1.3fr)_120px_120px_64px]";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));

export function VendorsApprovalManager({
  vendors,
  total,
  page,
  pageSize,
  totalPages,
  hasFilters,
  errored,
}: {
  vendors: VendorListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasFilters: boolean;
  errored: boolean;
}) {
  const router = useRouter();

  return (
    <>
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
            <Icon name="store" size={20} strokeWidth={1.9} />
          </span>
          <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Vendor Approval</h1>
          <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-warning-bg px-2.5 font-display text-[13px] font-bold text-warning">
            {total}
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <VendorsToolbar />

        {errored ? (
          <StateBlock
            tone="error"
            icon="alert"
            title="Couldn't load pending vendors"
            text="Something went wrong while loading the approval queue. Please try again."
            action={
              <button
                type="button"
                onClick={() => router.refresh()}
                className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
              >
                <Icon name="refresh" size={16} strokeWidth={2} />
                Try again
              </button>
            }
          />
        ) : vendors.length === 0 ? (
          <StateBlock
            tone="empty"
            icon={hasFilters ? "search" : "store"}
            title={hasFilters ? "No pending vendors match your search" : "No pending vendors"}
            text={
              hasFilters
                ? "Try a different search term."
                : "New vendor registrations awaiting approval will appear here."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[820px] overflow-hidden rounded-lg border border-line-soft">
                <div
                  className={`grid ${GRID} gap-3.5 bg-field p-[14px_18px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
                >
                  <span>#</span>
                  <span>Store name</span>
                  <span>Owner</span>
                  <span>Email</span>
                  <span>Registered</span>
                  <span>Status</span>
                  <span className="text-right">Details</span>
                </div>

                {vendors.map((v, i) => (
                  <div
                    key={v.id}
                    className={`grid ${GRID} items-center gap-3.5 border-t border-line-soft p-[12px_18px] transition-colors hover:bg-bg-subtle`}
                  >
                    <span className="font-sans text-[13px] text-muted">{(page - 1) * pageSize + i + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate font-sans text-[13.5px] font-semibold text-ink">{v.storeName}</div>
                    </div>
                    <span className="truncate font-sans text-[13px] text-ink-soft">{v.ownerName}</span>
                    <span className="truncate font-sans text-[13px] text-muted">{v.email}</span>
                    <span className="font-sans text-[12.5px] text-ink-soft">{fmtDate(v.createdAt)}</span>
                    <span><VendorStatusBadge status={v.status} /></span>
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/vendors/${v.id}`}
                        aria-label={`View ${v.storeName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-iris-100 bg-iris-50 text-iris-500 transition-colors hover:bg-iris-100"
                      >
                        <Icon name="eye" size={15} strokeWidth={2} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BrandsPagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
          </>
        )}
      </div>
    </>
  );
}

function StateBlock({
  tone,
  icon,
  title,
  text,
  action,
}: {
  tone: "empty" | "error";
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <span
        className={`mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl ${
          tone === "error" ? "bg-error-bg text-error" : "bg-iris-50 text-iris-400"
        }`}
      >
        <Icon name={icon} size={34} strokeWidth={1.7} />
      </span>
      <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">{title}</div>
      <p className="mx-auto mb-6 mt-3 max-w-[340px] font-sans text-[14px] leading-[1.5] text-muted">{text}</p>
      {action}
    </div>
  );
}
