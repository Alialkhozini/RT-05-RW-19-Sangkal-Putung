import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse text-left">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-56 h-7 rounded-xl" />
          <Skeleton className="w-80 h-4 rounded-md" />
        </div>
        <Skeleton className="w-36 h-10 rounded-2xl" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-neutral-gray/80 shadow-xs flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="w-20 h-4 rounded-md" />
              <Skeleton className="w-14 h-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Table/List Card Skeleton */}
      <div className="bg-white rounded-3xl border border-neutral-gray/80 p-6 md:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-neutral-gray/60 pb-4">
          <Skeleton className="w-44 h-6 rounded-lg" />
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>

        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-neutral-bg/60 rounded-2xl gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="w-1/3 h-4 rounded-md" />
                  <Skeleton className="w-1/2 h-3 rounded-md" />
                </div>
              </div>
              <Skeleton className="w-20 h-7 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
