export default function AdminReviewsLoading() {
  return (
    <div>
      <div className="mb-[22px] h-8 w-56 animate-pulse rounded bg-line-soft" />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-line-soft" />
        ))}
      </div>
      <div className="rounded-[18px] border border-line-soft bg-surface p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0">
            <div className="size-9 flex-none animate-pulse rounded-[9px] bg-line-soft" />
            <div className="h-3 flex-1 animate-pulse rounded bg-line-soft" />
            <div className="h-3 w-24 animate-pulse rounded bg-line-soft" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-line-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
