/**
 * Loading skeletons for the storefront home sections. Plain server components —
 * used as Suspense fallbacks so each section streams in independently.
 */

const SECTION = "mx-auto max-w-[var(--container-max)] px-[var(--cpad)]";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
      <div className="aspect-square animate-pulse bg-line-soft" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-2.5 w-16 animate-pulse rounded bg-line-soft" />
        <div className="h-3 w-full animate-pulse rounded bg-line-soft" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-line-soft" />
        <div className="mt-1 h-4 w-20 animate-pulse rounded bg-line-soft" />
        <div className="mt-1 h-10 w-full animate-pulse rounded-[10px] bg-line-soft" />
      </div>
    </div>
  );
}

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div className="flex flex-col gap-2.5">
        <div className="h-7 w-52 animate-pulse rounded bg-line-soft" />
        <div className="h-3 w-72 animate-pulse rounded bg-line-soft" />
      </div>
      <div className="h-4 w-16 animate-pulse rounded bg-line-soft" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className={`${SECTION} pt-8`}>
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <div className="hidden h-[380px] animate-pulse rounded-[18px] bg-line-soft lg:block" />
        <div className="h-[380px] animate-pulse rounded-[22px] bg-line-soft" />
      </div>
    </section>
  );
}

export function FlashDealSkeleton() {
  return (
    <section className={`${SECTION} pt-16`}>
      <div className="rounded-[22px] border border-iris-100 bg-iris-50/60 p-7">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-12 w-56 animate-pulse rounded-xl bg-line-soft" />
          <div className="h-12 w-64 animate-pulse rounded-xl bg-line-soft" />
        </div>
        <GridSkeleton count={5} />
      </div>
    </section>
  );
}

export function ProductRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className={`${SECTION} pt-18`}>
      <HeaderSkeleton />
      <GridSkeleton count={count} />
    </section>
  );
}

export function CategoryTilesSkeleton() {
  return (
    <section className={`${SECTION} pt-18`}>
      <HeaderSkeleton />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3.5 rounded-[18px] border border-line-soft bg-surface px-4 py-[26px]"
          >
            <div className="size-[66px] animate-pulse rounded-full bg-line-soft" />
            <div className="h-3 w-20 animate-pulse rounded bg-line-soft" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-line-soft" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturedDealsSkeleton() {
  return (
    <section className={`${SECTION} pt-18`}>
      <HeaderSkeleton />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-2xl border border-line-soft bg-surface p-3.5"
          >
            <div className="size-[82px] flex-none animate-pulse rounded-xl bg-line-soft" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-full animate-pulse rounded bg-line-soft" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-line-soft" />
              <div className="mt-1 h-4 w-24 animate-pulse rounded bg-line-soft" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
