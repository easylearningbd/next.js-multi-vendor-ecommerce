export default function OrderDetailsLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-44 animate-pulse rounded bg-line-soft" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-line-soft" />
      </div>
      <div className="mb-6 h-9 w-72 animate-pulse rounded bg-line-soft" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-[150px] animate-pulse rounded-2xl bg-line-soft" />
        ))}
      </div>
      <div className="mt-5 h-[260px] animate-pulse rounded-2xl bg-line-soft" />
    </div>
  );
}
