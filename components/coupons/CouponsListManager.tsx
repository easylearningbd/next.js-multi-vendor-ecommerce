"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CouponListItem } from "@/lib/coupon-types";
import { Icon } from "@/components/dashboard/Icon";
import { BrandsPagination } from "@/components/brands/BrandsPagination";
import { CouponStatusBadge } from "./CouponStatusBadge";
import { CouponsToolbar } from "./CouponsToolbar";
import { CouponDetailModal } from "./CouponDetailModal";
import { DeleteCouponModal } from "./DeleteCouponModal";

const GRID =
  "grid-cols-[44px_minmax(170px,1.6fr)_110px_92px_118px_84px_minmax(150px,1fr)_100px_108px]";

export function CouponsListManager({
  coupons,
  total,
  page,
  pageSize,
  totalPages,
  hasFilters,
  errored,
}: {
  coupons: CouponListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasFilters: boolean;
  errored: boolean;
}) {
  const router = useRouter();
  const [viewing, setViewing] = useState<CouponListItem | null>(null);
  const [toDelete, setToDelete] = useState<{ id: string; code: string } | null>(null);

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
            <Icon name="ticket" size={20} strokeWidth={1.9} />
          </span>
          <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Coupon List</h1>
          <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
            {total}
          </span>
        </div>
        <Link
          href="/vendor/coupons/add"
          className="flex h-[44px] items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          Add coupon
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <CouponsToolbar />

        {errored ? (
          <StateBlock
            tone="error"
            icon="alert"
            title="Couldn't load coupons"
            text="Something went wrong while loading your coupons. Please try again."
            action={
              <button
                type="button"
                onClick={() => router.refresh()}
                className="flex h-[44px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
              >
                <Icon name="refresh" size={16} strokeWidth={2} />
                Try again
              </button>
            }
          />
        ) : coupons.length === 0 ? (
          hasFilters ? (
            <StateBlock tone="empty" icon="search" title="No coupons match your filters" text="Try a different search or clear the status filter." />
          ) : (
            <StateBlock
              tone="empty"
              icon="ticket"
              title="No coupons yet"
              text="Create your first coupon to offer discounts on your products."
              action={
                <Link
                  href="/vendor/coupons/add"
                  className="flex h-[44px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
                >
                  <Icon name="plus" size={16} strokeWidth={2.2} />
                  Add coupon
                </Link>
              }
            />
          )
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[940px] overflow-hidden rounded-xl border border-line-soft">
                <div className={`grid ${GRID} gap-3 bg-field p-[14px_18px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}>
                  <span>#</span>
                  <span>Coupon</span>
                  <span>Type</span>
                  <span>Value</span>
                  <span>Scope</span>
                  <span>Usage</span>
                  <span>Validity</span>
                  <span>Status</span>
                  <span className="text-right">Action</span>
                </div>

                {coupons.map((c, i) => (
                  <div key={c.id} className={`grid ${GRID} items-center gap-3 border-t border-line-soft p-[12px_18px] transition-colors hover:bg-bg-subtle`}>
                    <span className="font-sans text-[13px] text-muted">{(page - 1) * pageSize + i + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate font-sans text-[13.5px] font-semibold text-ink">{c.title}</div>
                      <div className="mt-1 font-mono text-[11.5px] font-bold uppercase tracking-wide text-iris-500">{c.code}</div>
                    </div>
                    <span className="font-sans text-[12.5px] text-ink-soft">{c.typeLabel}</span>
                    <span className="font-display text-[13px] font-bold text-ink">{c.valueLabel}</span>
                    <span className="truncate font-sans text-[12.5px] text-ink-soft">{c.scopeLabel}</span>
                    <span className="font-sans text-[12.5px] text-ink-soft">{c.usageLabel}</span>
                    <span className="font-sans text-[12px] text-muted">
                      {c.startLabel} <span className="text-muted-soft">→</span> {c.expiryLabel}
                    </span>
                    <span>
                      <CouponStatusBadge status={c.status} />
                    </span>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewing(c)}
                        aria-label={`View ${c.code}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-success-bg bg-success-bg text-success transition-[filter] hover:brightness-95"
                      >
                        <Icon name="eye" size={15} strokeWidth={2} />
                      </button>
                      <Link
                        href={`/vendor/coupons/${c.id}/edit`}
                        aria-label={`Edit ${c.code}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-iris-100 bg-iris-50 text-iris-500 transition-colors hover:bg-iris-100"
                      >
                        <Icon name="edit" size={15} strokeWidth={2} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete({ id: c.id, code: c.code })}
                        aria-label={`Delete ${c.code}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-error-bg bg-error-bg text-error transition-[filter] hover:brightness-95"
                      >
                        <Icon name="trash" size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BrandsPagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
          </>
        )}
      </div>

      <CouponDetailModal coupon={viewing} onClose={() => setViewing(null)} />
      <DeleteCouponModal coupon={toDelete} onClose={() => setToDelete(null)} />
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
      <span className={`mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl ${tone === "error" ? "bg-error-bg text-error" : "bg-iris-50 text-iris-400"}`}>
        <Icon name={icon} size={34} strokeWidth={1.7} />
      </span>
      <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">{title}</div>
      <p className="mx-auto mb-6 mt-3 max-w-[340px] font-sans text-[14px] leading-[1.5] text-muted">{text}</p>
      {action}
    </div>
  );
}
