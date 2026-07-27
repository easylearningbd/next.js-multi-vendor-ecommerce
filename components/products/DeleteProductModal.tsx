"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteProduct } from "@/app/(seller)/vendor/(dashboard)/products/actions";
import { Icon } from "@/components/dashboard/Icon";

export function DeleteProductModal({
  product,
  onClose,
  redirectTo,
}: {
  product: { id: string; name: string } | null;
  onClose: () => void;
  /** Where to go after a successful delete. Defaults to refreshing the current page. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!product) return null;

  function confirm() {
    startTransition(async () => {
      const res = await deleteProduct(product!.id);
      if (!res.success) {
        toast.error(res.error ?? "Couldn't delete the product.");
        return;
      }
      toast.success(
        res.data?.softDeleted
          ? `"${product!.name}" has orders — it was deactivated instead of deleted.`
          : `"${product!.name}" was deleted.`,
      );
      onClose();
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl border border-line-soft bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-error-bg text-error">
            <Icon name="trash" size={20} strokeWidth={1.9} />
          </span>
          <div>
            <div className="font-display text-[17px] font-bold text-ink">Delete product?</div>
            <p className="mt-2 font-sans text-[13.5px] leading-[1.5] text-muted">
              This permanently removes <span className="font-semibold text-ink-soft">{product.name}</span> and its
              variations and images. This can&apos;t be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-11 rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-field disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="flex h-11 items-center gap-2 rounded-md bg-error px-5 font-display text-[13px] font-bold text-white transition-[filter] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
