import {
  HeroSkeleton,
  FlashDealSkeleton,
  ProductRowSkeleton,
} from "@/components/shop/skeletons";

export default function ShopLoading() {
  return (
    <>
      <HeroSkeleton />
      <FlashDealSkeleton />
      <ProductRowSkeleton />
    </>
  );
}
