export default function TrackOrderLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-6 w-36 animate-pulse rounded bg-line-soft" />
        <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
      </div>
      <div className="mb-6 h-[110px] animate-pulse rounded-2xl bg-line-soft" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="h-[280px] animate-pulse rounded-2xl bg-line-soft" />
        <div className="h-[220px] animate-pulse rounded-2xl bg-line-soft" />
      </div>
    </div>
  );
}
