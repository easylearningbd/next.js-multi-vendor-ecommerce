import type { StorefrontProduct } from "@/lib/shop/queries";
import { ProductCard } from "@/components/shop/ProductCard";

/**
 * Responsive product-card grid used by every card-based home section
 * (auto-fill, min column 210px, matching the design). Server component — the
 * interactive behavior lives inside each ProductCard.
 */
export function ProductGrid({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
