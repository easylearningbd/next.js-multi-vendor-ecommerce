"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/app/(admin)/admin/categories/actions";
import type { CategoryListItem } from "@/lib/category-types";
import { Icon } from "@/components/dashboard/Icon";
import { BrandsPagination } from "@/components/brands/BrandsPagination";
import { CategoriesToolbar } from "./CategoriesToolbar";
import { CategoryFormModal } from "./CategoryFormModal";
import { DeleteEntityDialog } from "./DeleteEntityDialog";

const GRID = "grid-cols-[44px_64px_minmax(160px,1.4fr)_minmax(130px,1fr)_120px_90px_96px]";

export function CategoriesManager({
  categories,
  total,
  page,
  pageSize,
  totalPages,
  hasFilters,
  errored,
}: {
  categories: CategoryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasFilters: boolean;
  errored: boolean;
}) {
  const router = useRouter();
  const [formModal, setFormModal] = useState<{ category?: CategoryListItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryListItem | null>(null);

  const actionBtn = "flex h-8 w-8 items-center justify-center rounded-md border transition-colors";

  return (
    <>
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
            <Icon name="layers" size={20} strokeWidth={1.9} />
          </span>
          <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Categories</h1>
          <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
            {total}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFormModal({})}
          className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          Add Category
        </button>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <CategoriesToolbar placeholder="Search by category name" />

        {errored ? (
          <StateBlock
            tone="error"
            icon="alert"
            title="Couldn't load categories"
            text="Something went wrong while loading the category list. Please try again."
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
        ) : categories.length === 0 ? (
          hasFilters ? (
            <StateBlock
              tone="empty"
              icon="search"
              title="No categories match your search"
              text="Try a different name or clear the search."
            />
          ) : (
            <StateBlock
              tone="empty"
              icon="layers"
              title="No categories yet"
              text="Create your first category to start building the catalog taxonomy."
              action={
                <button
                  type="button"
                  onClick={() => setFormModal({})}
                  className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
                >
                  <Icon name="plus" size={16} strokeWidth={2.2} />
                  Add Category
                </button>
              }
            />
          )
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[800px] overflow-hidden rounded-lg border border-line-soft">
                <div
                  className={`grid ${GRID} gap-3.5 bg-field p-[14px_18px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
                >
                  <span>#</span>
                  <span>Image</span>
                  <span>Name</span>
                  <span>Slug</span>
                  <span>Sub-categories</span>
                  <span>Products</span>
                  <span className="text-right">Actions</span>
                </div>

                {categories.map((c, i) => (
                  <div
                    key={c.id}
                    className={`grid ${GRID} items-center gap-3.5 border-t border-line-soft p-[12px_18px] transition-colors hover:bg-bg-subtle`}
                  >
                    <span className="font-sans text-[13px] text-muted">{(page - 1) * pageSize + i + 1}</span>

                    <div className="h-[46px] w-[46px] overflow-hidden rounded-md border border-line-soft bg-field">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-muted-soft">
                          <Icon name="image" size={18} strokeWidth={1.8} />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-sans text-[13.5px] font-semibold text-ink">{c.name}</div>
                    </div>

                    <span className="truncate font-mono text-[12px] text-muted">{c.slug}</span>

                    <span className="font-sans text-[13px] text-ink-soft">
                      <span className="inline-flex items-center rounded-full bg-iris-50 px-2.5 py-0.5 font-semibold text-accent-fg">
                        {c.subCategoryCount}
                      </span>
                    </span>

                    <span className="font-sans text-[13px] text-ink-soft">{c.productCount}</span>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => setFormModal({ category: c })}
                        className={`${actionBtn} border-iris-100 bg-iris-50 text-iris-500 hover:bg-iris-100`}
                      >
                        <Icon name="edit" size={15} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${c.name}`}
                        onClick={() => setDeleteTarget(c)}
                        className={`${actionBtn} border-[#f6d9da] bg-error-bg text-error hover:brightness-95`}
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

      {formModal && (
        <CategoryFormModal open onClose={() => setFormModal(null)} category={formModal.category} />
      )}
      {deleteTarget && (
        <DeleteEntityDialog
          open
          onClose={() => setDeleteTarget(null)}
          itemName={deleteTarget.name}
          entityLabel="category"
          deleteAction={() => deleteCategory(deleteTarget.id)}
        />
      )}
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
