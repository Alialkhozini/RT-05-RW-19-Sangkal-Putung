import PublicNavbar from '@/components/public/PublicNavbar';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      {/* Navbar Tetap Tampil */}
      <PublicNavbar />

      {/* Header Banner Skeleton (Terang & Bersih) */}
      <div className="bg-white border-b border-neutral-gray/60 pt-36 pb-16 px-4 md:px-6 flex flex-col items-center text-center gap-4">
        <Skeleton className="w-32 h-6 rounded-full bg-gray-200" />
        <Skeleton className="w-80 h-10 rounded-2xl bg-gray-200" />
        <Skeleton className="w-96 h-5 rounded-lg bg-gray-200" />
      </div>

      {/* News Grid Skeleton */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
