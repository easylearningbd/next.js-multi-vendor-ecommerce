import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";
import { getProductBySlug } from "@/lib/shop/queries";

// Ensure a genuine 404 status for missing/hidden products: resolving the render
// before the stream flushes lets notFound() set the status code.
export const dynamic = "force-dynamic";
import { ProductBreadcrumb } from "@/components/shop/product/ProductBreadcrumb";
import { ProductDetailGallery } from "@/components/shop/product/ProductDetailGallery";
import { ProductInfo } from "@/components/shop/product/ProductInfo";
import { ProductTabs } from "@/components/shop/product/ProductTabs";
import { ProductOverview } from "@/components/shop/product/ProductOverview";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  // 404 as early as metadata resolution so the response carries a real 404 status.
  if (!product) notFound();

  const title = product.metaTitle?.trim() || `${product.name} — Covet`;
  const description =
    product.metaDescription?.trim() || product.shortDescription?.trim() || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="pb-20">
      <ProductBreadcrumb path={product.categoryPath} productName={product.name} />

      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-start gap-6 px-[var(--cpad)] pt-[18px] lg:grid-cols-[1fr_336px]">
        <div className="flex flex-col gap-6">
          {/* Gallery + info */}
          <div className="grid grid-cols-1 gap-9 rounded-[20px] border border-line-soft bg-surface p-7 shadow-[0_1px_2px_rgba(20,18,31,0.05)] md:grid-cols-[400px_1fr]">
            <ProductDetailGallery
              images={product.gallery}
              productName={product.name}
              discountPercent={product.discountPercent}
            />
            <ProductInfo product={product} />
          </div>

          {/* Overview / Reviews tabs */}
          <ProductTabs
            overview={<ProductOverview product={product} />}
            reviews={
              // Part 4 replaces this with the real reviews section (empty state + TODO).
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-field text-muted-soft">
                  <Icon name="message" size={24} strokeWidth={1.75} />
                </span>
                <p className="font-sans text-sm text-muted">
                  Reviews arrive in the next step.
                </p>
              </div>
            }
          />
        </div>

        {/* Seller sidebar — Part 4 */}
        <aside className="rounded-[20px] border border-dashed border-line bg-bg-subtle px-5 py-8 text-center font-sans text-[13px] text-muted lg:sticky lg:top-[100px]">
          Seller card &amp; assurances arrive in Part 4.
        </aside>
      </div>

      {/* More From Vendor + Similar Products — Part 5 */}
    </div>
  );
}
