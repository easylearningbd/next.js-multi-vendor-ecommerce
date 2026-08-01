import type { ProductDetail } from "@/lib/shop/queries";

/**
 * Overview tab content — the real short + full description. The schema has no
 * structured "specifications" field, so specs live inside the description text
 * (rendered with line breaks preserved). TODO(specs): add a structured specs
 * field if the catalog needs a formatted spec table.
 */
export function ProductOverview({ product }: { product: ProductDetail }) {
  return (
    <div className="max-w-[760px]">
      <h3 className="mb-4 font-display text-[17px] font-bold text-ink">
        Detail Description
      </h3>
      {product.shortDescription && (
        <p className="mb-5 font-sans text-sm font-medium leading-[1.6] text-ink-soft">
          {product.shortDescription}
        </p>
      )}
      <p className="whitespace-pre-line font-sans text-sm leading-[1.7] text-muted">
        {product.description}
      </p>
    </div>
  );
}
