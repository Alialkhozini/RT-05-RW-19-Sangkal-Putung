import PublicNavbar from '@/components/public/PublicNavbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      {/* Navbar Tetap Tampil */}
      <PublicNavbar />

      {/* Header Banner Skeleton (Terang & Bersih) */}
      <div className="bg-white border-b border-neutral-gray/60 pt-36 pb-16 px-4 md:px-6 flex flex-col items-center text-center gap-4">
        <Skeleton className="w-32 h-6 rounded-full bg-gray-200" />
        <Skeleton className="w-72 h-10 rounded-2xl bg-gray-200" />
        <Skeleton className="w-96 h-5 rounded-lg bg-gray-200" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-10 flex items-center justify-center gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="w-24 h-9 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* Gallery Grid Skeleton */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-neutral-gray/70 shadow-sm flex flex-col animate-pulse">
              <Skeleton className="w-full h-56 bg-gray-200" />
              <div className="p-5 flex flex-col gap-2">
                <Skeleton className="w-20 h-4 rounded-full bg-gray-200" />
                <Skeleton className="w-3/4 h-5 rounded-lg bg-gray-200" />
                <Skeleton className="w-full h-3 rounded-md bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
