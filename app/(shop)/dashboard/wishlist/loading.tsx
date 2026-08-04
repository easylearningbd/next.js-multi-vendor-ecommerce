export default function WishlistLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-6 w-40 animate-pulse rounded bg-line-soft" />
        <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
      </div>
      <div className="flex flex-col gap-3.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-[18px] rounded-2xl border border-line-soft p-4 sm:px-5">
            <div className="size-[84px] flex-none animate-pulse rounded-[14px] bg-line-soft" />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="h-3.5 w-2/5 animate-pulse rounded bg-line-soft" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-line-soft" />
            </div>
            <div className="h-11 w-[130px] flex-none animate-pulse rounded-[11px] bg-line-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
