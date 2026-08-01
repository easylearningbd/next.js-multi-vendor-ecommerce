import { getBestSelling, getTopRated } from "@/lib/shop/queries";
import { BestSellingTabs } from "@/components/shop/BestSellingTabs";

export async function BestSellingSection() {
  const [bestSelling, topRated] = await Promise.all([
    getBestSelling(8),
    getTopRated(8),
  ]);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <BestSellingTabs bestSelling={bestSelling} topRated={topRated} />
    </section>
  );
}
