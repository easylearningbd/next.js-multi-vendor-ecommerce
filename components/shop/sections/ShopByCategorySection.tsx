import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { getCategoriesWithCount } from "@/lib/shop/queries";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { EmptyState } from "@/components/shop/EmptyState";

export async function ShopByCategorySection() {
  const categories = await getCategoriesWithCount();

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-18">
      <SectionHeader
        title="Shop by Category"
        viewAllHref="/categories"
        viewAllLabel="All categories"
      />
      {categories.length > 0 ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="flex flex-col items-center gap-3.5 rounded-[18px] border border-line-soft bg-surface px-4 py-[26px] shadow-[0_1px_2px_rgba(20,18,31,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-[0_16px_34px_-14px_rgba(20,18,31,0.18)]"
            >
              <div className="flex size-[66px] items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon name="bag" size={26} strokeWidth={1.8} />
                )}
              </div>
              <div className="text-center">
                <div className="font-sans text-sm font-semibold leading-tight text-ink">
                  {c.name}
                </div>
                <div className="mt-1.5 font-sans text-[12px] text-muted-soft">
                  {c.productCount} {c.productCount === 1 ? "product" : "products"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon="grid" message="No categories yet." />
      )}
    </section>
  );
}
