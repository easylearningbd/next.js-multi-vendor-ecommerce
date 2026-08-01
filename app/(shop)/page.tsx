import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/shop/sections/HeroSection";
import { FlashDealSection } from "@/components/shop/sections/FlashDealSection";
import { FeaturedProductsSection } from "@/components/shop/sections/FeaturedProductsSection";
import { ShopByCategorySection } from "@/components/shop/sections/ShopByCategorySection";
import { FeaturedDealsSection } from "@/components/shop/sections/FeaturedDealsSection";
import { TopSellersSection } from "@/components/shop/sections/TopSellersSection";
import { LatestProductsSection } from "@/components/shop/sections/LatestProductsSection";
import { NewArrivalsSection } from "@/components/shop/sections/NewArrivalsSection";
import { BestSellingSection } from "@/components/shop/sections/BestSellingSection";
import { ShopByBrandSection } from "@/components/shop/sections/ShopByBrandSection";
import { CategoryRailSection } from "@/components/shop/sections/CategoryRailSection";
import {
  HeroSkeleton,
  FlashDealSkeleton,
  ProductRowSkeleton,
  CategoryTilesSkeleton,
  FeaturedDealsSkeleton,
  TopSellersSkeleton,
  BrandsSkeleton,
  CategoryRailSkeleton,
} from "@/components/shop/skeletons";

export const metadata: Metadata = {
  title: "Covet — Multi-vendor marketplace",
};

/**
 * Home category rails — one per configured category slug. A missing/empty
 * category renders a graceful empty state (see CategoryRailSection).
 */
const CATEGORY_RAILS = [
  { title: "Fashion", slug: "fashion" },
  { title: "Mobiles", slug: "mobiles" },
  { title: "Electronics", slug: "electronics" },
  { title: "Beauty", slug: "beauty" },
  { title: "Furniture", slug: "furniture" },
];

/**
 * Storefront home. Each section is an async server component that fetches its
 * own data (Part 3 layer) and streams behind its own Suspense skeleton, with a
 * built-in empty state.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<FlashDealSkeleton />}>
        <FlashDealSection />
      </Suspense>

      <Suspense fallback={<ProductRowSkeleton />}>
        <FeaturedProductsSection />
      </Suspense>

      <Suspense fallback={<CategoryTilesSkeleton />}>
        <ShopByCategorySection />
      </Suspense>

      <Suspense fallback={<FeaturedDealsSkeleton />}>
        <FeaturedDealsSection />
      </Suspense>

      <Suspense fallback={<TopSellersSkeleton />}>
        <TopSellersSection />
      </Suspense>

      <Suspense fallback={<ProductRowSkeleton />}>
        <LatestProductsSection />
      </Suspense>

      <Suspense fallback={<ProductRowSkeleton />}>
        <NewArrivalsSection />
      </Suspense>

      <Suspense fallback={<ProductRowSkeleton count={4} />}>
        <BestSellingSection />
      </Suspense>

      <Suspense fallback={<BrandsSkeleton />}>
        <ShopByBrandSection />
      </Suspense>

      {CATEGORY_RAILS.map((rail) => (
        <Suspense key={rail.slug} fallback={<CategoryRailSkeleton />}>
          <CategoryRailSection title={rail.title} slug={rail.slug} />
        </Suspense>
      ))}

      <div className="h-20" />
    </>
  );
}
