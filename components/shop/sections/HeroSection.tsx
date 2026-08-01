import { getStorefrontCategoryTree } from "@/lib/shop/queries";
import { HeroCategoryMenu } from "@/components/shop/HeroCategoryMenu";
import { HeroBanner } from "@/components/shop/HeroBanner";

/** Hero: category rail + mega-panel (real tree) wrapping the promo banner. */
export async function HeroSection() {
  const categories = await getStorefrontCategoryTree();
  return (
    <HeroCategoryMenu categories={categories}>
      <HeroBanner />
    </HeroCategoryMenu>
  );
}
