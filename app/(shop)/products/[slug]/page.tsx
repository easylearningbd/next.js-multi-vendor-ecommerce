import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getVendorForProduct,
  getProductReviews,
  getMoreFromVendor,
  getSimilarProducts,
} from "@/lib/shop/queries";
import { ProductBreadcrumb } from "@/components/shop/product/ProductBreadcrumb";
import { ProductBuyBox } from "@/components/shop/product/ProductBuyBox";
import { ProductTabs } from "@/components/shop/product/ProductTabs";
import { ProductOverview } from "@/components/shop/product/ProductOverview";
import { ProductReviewsSection } from "@/components/shop/product/ProductReviewsSection";
import { ProductAssurances } from "@/components/shop/product/ProductAssurances";
import { VendorCard } from "@/components/shop/product/VendorCard";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { ProductGrid } from "@/components/shop/ProductGrid";

// Ensure a genuine 404 status for missing/hidden products: resolving the render
// before the stream flushes lets notFound() set the status code.
export const dynamic = "force-dynamic";

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

  const [vendor, reviews, moreFromVendor, similar] = await Promise.all([
    getVendorForProduct(product.vendorId),
    getProductReviews(product.id),
    getMoreFromVendor(product.vendorId, product.id, 5),
    getSimilarProducts(product.categoryId, product.id, 5),
  ]);

  return (
    <div className="pb-20">
      <ProductBreadcrumb path={product.categoryPath} productName={product.name} />

      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-start gap-6 px-[var(--cpad)] pt-[18px] lg:grid-cols-[1fr_336px]">
        <div className="flex flex-col gap-6">
          {/* Gallery + info + variation-aware purchase panel */}
          <ProductBuyBox
            product={product}
            rating={reviews.average}
            reviewCount={reviews.count}
          />

          {/* Overview / Reviews tabs */}
          <ProductTabs
            overview={<ProductOverview product={product} />}
            reviews={<ProductReviewsSection data={reviews} />}
          />
        </div>

        {/* Seller sidebar */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-[100px]">
          <ProductAssurances />
          {vendor && <VendorCard vendor={vendor} />}
        </aside>
      </div>

      {/* More From This Store — hidden when the vendor has no other products */}
      {vendor && moreFromVendor.length > 0 && (
        <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-14">
          <SectionHeader
            title={`More From ${vendor.storeName}`}
            viewAllHref={`/sellers/${vendor.slug}`}
            viewAllLabel="View all"
          />
          <ProductGrid products={moreFromVendor} />
        </section>
      )}

      {/* Similar Products — same category, hidden when there are none */}
      {similar.length > 0 && (
        <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-14">
          <SectionHeader
            title="Similar Products"
            viewAllHref={`/category/${product.categoryPath.category.slug}`}
            viewAllLabel="View all"
          />
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}
