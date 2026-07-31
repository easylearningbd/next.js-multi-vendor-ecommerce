"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ProductApprovalStatus } from "@prisma/client";
import { approveProduct, denyProduct, deleteAdminProduct } from "@/app/(admin)/admin/products/actions";
import { Icon } from "@/components/dashboard/Icon";

const LIST_PATH: Record<ProductApprovalStatus, string> = {
  APPROVED: "/admin/products/approved",
  REJECTED: "/admin/products/denied",
  PENDING: "/admin/products/pending",
};

export function AdminProductActions({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: ProductApprovalStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [denyOpen, setDenyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function approve() {
    startTransition(async () => {
      const res = await approveProduct(id);
      if (!res.success) { toast.error(res.error ?? "Couldn't approve."); return; }
      toast.success(`"${name}" approved.`);
      router.refresh();
    });
  }

  const btn = "flex h-11 items-center gap-2 rounded-xl px-5 font-display text-[13px] font-bold transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Approve — shown for PENDING and REJECTED (re-approve) */}
      {status !== "APPROVED" && (
        <button type="button" onClick={approve} disabled={pending} className={`${btn} bg-success text-white hover:brightness-95`}>
          <Icon name="check" size={16} strokeWidth={2.4} />
          Approve
        </button>
      )}
      {/* Deny — shown for PENDING and APPROVED */}
      {status !== "REJECTED" && (
        <button type="button" onClick={() => setDenyOpen(true)} disabled={pending} className={`${btn} bg-error text-white hover:brightness-95`}>
          <Icon name="canceled" size={16} strokeWidth={2.2} />
          Deny
        </button>
      )}
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        disabled={pending}
        aria-label="Delete product"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-error-bg bg-error-bg text-error transition-[filter] hover:brightness-95"
      >
        <Icon name="trash" size={16} strokeWidth={2} />
      </button>

      {denyOpen && (
        <DenyModal id={id} name={name} onClose={() => setDenyOpen(false)} onDone={() => router.refresh()} />
      )}
      {deleteOpen && (
        <DeleteModal
          id={id}
          name={name}
          onClose={() => setDeleteOpen(false)}
          onDeleted={(soft) => {
            if (!soft) router.push(LIST_PATH[status]);
            else router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,18,31,0.55)] p-6 backdrop-blur-[3px]">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[460px] rounded-2xl bg-surface p-6 shadow-[0_40px_90px_-20px_rgba(20,18,31,.5)]">
        {children}
      </div>
    </div>
  );
}

function DenyModal({ id, name, onClose, onDone }: { id: string; name: string; onClose: () => void; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  function confirm() {
    startTransition(async () => {
      const res = await denyProduct(id, reason.trim() || undefined);
      if (!res.success) { toast.error(res.error ?? "Couldn't deny."); return; }
      toast.success(`"${name}" was denied.`);
      onClose();
      onDone();
    });
  }
  return (
    <Overlay onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error">
        <Icon name="canceled" size={22} strokeWidth={1.9} />
      </div>
      <div className="font-display text-[18px] font-bold text-ink">Deny this product</div>
      <p className="mt-2 font-sans text-[13.5px] leading-[1.5] text-muted">
        Deny <span className="font-semibold text-ink">{name}</span>? Its status will be set to Denied. The vendor sees it
        as rejected on their side.
      </p>
      <label className="mb-1.5 mt-4 block font-sans text-[12.5px] font-semibold text-ink-soft">Reason (optional)</label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Add an internal note about why…"
        className="w-full resize-none rounded-xl border border-line bg-bg-subtle px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface"
      />
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft hover:bg-field disabled:opacity-60">
          Cancel
        </button>
        <button type="button" onClick={confirm} disabled={pending} className="flex h-11 items-center gap-2 rounded-md bg-error px-5 font-sans text-[13.5px] font-bold text-white transition-[filter] hover:brightness-95 disabled:opacity-70">
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          Deny product
        </button>
      </div>
    </Overlay>
  );
}

function DeleteModal({ id, name, onClose, onDeleted }: { id: string; name: string; onClose: () => void; onDeleted: (soft: boolean) => void }) {
  const [pending, startTransition] = useTransition();
  function confirm() {
    startTransition(async () => {
      const res = await deleteAdminProduct(id);
      if (!res.success) { toast.error(res.error ?? "Couldn't delete."); return; }
      toast.success(res.data?.softDeleted ? `"${name}" has orders — it was deactivated instead of deleted.` : `"${name}" was deleted.`);
      onClose();
      onDeleted(!!res.data?.softDeleted);
    });
  }
  return (
    <Overlay onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error">
        <Icon name="trash" size={22} strokeWidth={1.9} />
      </div>
      <div className="font-display text-[18px] font-bold text-ink">Delete product</div>
      <p className="mt-2 font-sans text-[13.5px] leading-[1.5] text-muted">
        Delete <span className="font-semibold text-ink">{name}</span>? This can&apos;t be undone. If the product is
        referenced by existing orders, it will be deactivated instead so order history stays intact.
      </p>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft hover:bg-field disabled:opacity-60">
          Cancel
        </button>
        <button type="button" onClick={confirm} disabled={pending} className="flex h-11 items-center gap-2 rounded-md bg-error px-5 font-sans text-[13.5px] font-bold text-white transition-[filter] hover:brightness-95 disabled:opacity-70">
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          Delete
        </button>
      </div>
    </Overlay>
  );
}
