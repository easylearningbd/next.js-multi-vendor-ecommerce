import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/shop/sections/HeroSection";
import { FlashDealSection } from "@/components/shop/sections/FlashDealSection";
import { FeaturedProductsSection } from "@/components/shop/sections/FeaturedProductsSection";
import { ShopByCategorySection } from "@/components/shop/sections/ShopByCategorySection";
import { FeaturedDealsSection } from "@/components/shop/sections/FeaturedDealsSection";
import {
  HeroSkeleton,
  FlashDealSkeleton,
  ProductRowSkeleton,
  CategoryTilesSkeleton,
  FeaturedDealsSkeleton,
} from "@/components/shop/skeletons";

export const metadata: Metadata = {
  title: "Covet — Multi-vendor marketplace",
};

/**
 * Storefront home. Each section is an async server component that fetches its
 * own data (Part 3 layer) and streams in behind its own Suspense skeleton, with
 * a built-in empty state. Parts 4 covers the top half (hero → featured deals);
 * the lower sections (top sellers, latest, best-selling, brands, category rails)
 * arrive in Part 5.
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

      <div className="h-20" />
    </>
  );
}
