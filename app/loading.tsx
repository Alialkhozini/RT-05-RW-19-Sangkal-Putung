import PublicNavbar from '@/components/public/PublicNavbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-neutral-bg flex flex-col">
      {/* 1. Navbar Tetap Tampil Saat Loading */}
      <PublicNavbar />

      {/* 2. Hero Section Skeleton (Terang & Bersih) */}
      <section className="relative min-h-[580px] bg-white/70 border-b border-neutral-gray/60 flex flex-col items-center justify-center pt-36 pb-28 px-4 md:px-6">
        <div className="w-full max-w-4xl flex flex-col items-center gap-5">
          {/* Badge Skeleton */}
          <Skeleton className="w-44 h-7 rounded-full bg-gray-200" />
          
          {/* Title Skeleton */}
          <Skeleton className="w-4/5 h-12 md:h-16 rounded-2xl bg-gray-200" />
          <Skeleton className="w-3/5 h-10 md:h-12 rounded-2xl bg-gray-200" />
          
          {/* Subtitle Skeleton */}
          <Skeleton className="w-2/3 h-5 rounded-lg bg-gray-200 mt-2" />
          <Skeleton className="w-1/2 h-5 rounded-lg bg-gray-200" />

          {/* Search Bar Skeleton */}
          <div className="w-full max-w-2xl h-14 rounded-2xl bg-white shadow-md border border-neutral-gray/70 p-2 flex items-center gap-3 mt-4">
            <Skeleton className="w-6 h-6 rounded-full bg-gray-200 ml-2" />
            <Skeleton className="flex-1 h-5 rounded-md bg-gray-200" />
            <Skeleton className="w-20 h-10 rounded-xl bg-primary/30" />
          </div>
        </div>
      </section>

      {/* 3. Quick Services Cards Skeleton */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl -mt-14 relative z-20 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-md border border-neutral-gray/70 flex flex-col gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl bg-gray-200" />
              <Skeleton className="w-32 h-5 rounded-lg bg-gray-200" />
              <Skeleton className="w-full h-4 rounded-md bg-gray-200" />
              <Skeleton className="w-4/5 h-4 rounded-md bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Demographic Section Skeleton */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-8 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-36 h-6 rounded-full bg-gray-200" />
          <Skeleton className="w-64 h-8 rounded-xl bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-neutral-gray/70 shadow-sm flex flex-col items-center gap-6">
              <Skeleton className="w-40 h-6 rounded-lg bg-gray-200" />
              <Skeleton className="w-52 h-52 rounded-full bg-gray-200" />
              <div className="flex gap-4 w-full justify-center">
                <Skeleton className="w-28 h-8 rounded-xl bg-gray-200" />
                <Skeleton className="w-28 h-8 rounded-xl bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
