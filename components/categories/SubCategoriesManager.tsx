"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSubCategory } from "@/app/(admin)/admin/categories/actions";
import type { CategoryOption, SubCategoryListItem } from "@/lib/category-types";
import { Icon } from "@/components/dashboard/Icon";
import { BrandsPagination } from "@/components/brands/BrandsPagination";
import { SubCategoriesToolbar } from "./SubCategoriesToolbar";
import { SubCategoryFormModal } from "./SubCategoryFormModal";
import { DeleteEntityDialog } from "./DeleteEntityDialog";

const GRID = "grid-cols-[44px_minmax(150px,1.4fr)_minmax(120px,1fr)_minmax(120px,1fr)_130px_90px_96px]";

export function SubCategoriesManager({
  subCategories,
  categoryOptions,
  total,
  page,
  pageSize,
  totalPages,
  hasFilters,
  errored,
}: {
  subCategories: SubCategoryListItem[];
  categoryOptions: CategoryOption[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasFilters: boolean;
  errored: boolean;
}) {
  const router = useRouter();
  const [formModal, setFormModal] = useState<{ subCategory?: SubCategoryListItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubCategoryListItem | null>(null);

  const actionBtn = "flex h-8 w-8 items-center justify-center rounded-md border transition-colors";
  const noCategories = categoryOptions.length === 0;

  return (
    <>
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
            <Icon name="grid" size={20} strokeWidth={1.9} />
          </span>
          <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Sub-Categories</h1>
          <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
            {total}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFormModal({})}
          disabled={noCategories}
          title={noCategories ? "Create a category first" : undefined}
          className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          Add Sub-Category
        </button>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <SubCategoriesToolbar categoryOptions={categoryOptions} placeholder="Search by sub-category name" />

        {errored ? (
          <StateBlock
            tone="error"
            icon="alert"
            title="Couldn't load sub-categories"
            text="Something went wrong while loading the list. Please try again."
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
        ) : subCategories.length === 0 ? (
          hasFilters ? (
            <StateBlock
              tone="empty"
              icon="search"
              title="No sub-categories match your filters"
              text="Try a different name or clear the category filter."
            />
          ) : noCategories ? (
            <StateBlock
              tone="empty"
              icon="layers"
              title="No categories yet"
              text="Create a category first — sub-categories are nested under a category."
            />
          ) : (
            <StateBlock
              tone="empty"
              icon="grid"
              title="No sub-categories yet"
              text="Add your first sub-category under one of your categories."
              action={
                <button
                  type="button"
                  onClick={() => setFormModal({})}
                  className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
                >
                  <Icon name="plus" size={16} strokeWidth={2.2} />
                  Add Sub-Category
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
                  <span>Name</span>
                  <span>Slug</span>
                  <span>Parent category</span>
                  <span>Sub-sub-categories</span>
                  <span>Products</span>
                  <span className="text-right">Actions</span>
                </div>

                {subCategories.map((s, i) => (
                  <div
                    key={s.id}
                    className={`grid ${GRID} items-center gap-3.5 border-t border-line-soft p-[12px_18px] transition-colors hover:bg-bg-subtle`}
                  >
                    <span className="font-sans text-[13px] text-muted">{(page - 1) * pageSize + i + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate font-sans text-[13.5px] font-semibold text-ink">{s.name}</div>
                    </div>
                    <span className="truncate font-mono text-[12px] text-muted">{s.slug}</span>
                    <span className="truncate font-sans text-[13px] text-ink-soft">
                      <span className="inline-flex items-center rounded-full bg-bg-subtle px-2.5 py-0.5 font-medium text-ink-soft ring-1 ring-line">
                        {s.categoryName}
                      </span>
                    </span>
                    <span className="font-sans text-[13px] text-ink-soft">
                      <span className="inline-flex items-center rounded-full bg-iris-50 px-2.5 py-0.5 font-semibold text-accent-fg">
                        {s.subSubCategoryCount}
                      </span>
                    </span>
                    <span className="font-sans text-[13px] text-ink-soft">{s.productCount}</span>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${s.name}`}
                        onClick={() => setFormModal({ subCategory: s })}
                        className={`${actionBtn} border-iris-100 bg-iris-50 text-iris-500 hover:bg-iris-100`}
                      >
                        <Icon name="edit" size={15} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${s.name}`}
                        onClick={() => setDeleteTarget(s)}
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
        <SubCategoryFormModal
          open
          onClose={() => setFormModal(null)}
          subCategory={formModal.subCategory}
          categoryOptions={categoryOptions}
        />
      )}
      {deleteTarget && (
        <DeleteEntityDialog
          open
          onClose={() => setDeleteTarget(null)}
          itemName={deleteTarget.name}
          entityLabel="sub-category"
          deleteAction={() => deleteSubCategory(deleteTarget.id)}
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
