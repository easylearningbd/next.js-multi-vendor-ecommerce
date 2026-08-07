export default function AdminCustomerDetailsLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="h-8 w-52 animate-pulse rounded bg-line-soft" />
        <div className="h-10 w-32 animate-pulse rounded-[11px] bg-line-soft" />
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-5">
          <div className="h-[200px] animate-pulse rounded-[16px] bg-line-soft" />
          <div className="h-[160px] animate-pulse rounded-[16px] bg-line-soft" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[110px] animate-pulse rounded-[16px] bg-line-soft" />
            ))}
          </div>
          <div className="h-[220px] animate-pulse rounded-[16px] bg-line-soft" />
          <div className="h-[220px] animate-pulse rounded-[16px] bg-line-soft" />
        </div>
      </div>
    </div>
  );
}
