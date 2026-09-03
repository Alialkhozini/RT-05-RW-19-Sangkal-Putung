import PublicNavbar from '@/components/public/PublicNavbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AnnouncementLoading() {
  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      {/* Navbar Tetap Tampil */}
      <PublicNavbar />

      {/* Header Banner Skeleton (Terang & Bersih) */}
      <div className="bg-white border-b border-neutral-gray/60 pt-36 pb-16 px-4 md:px-6 flex flex-col items-center text-center gap-4">
        <Skeleton className="w-36 h-6 rounded-full bg-gray-200" />
        <Skeleton className="w-80 h-10 rounded-2xl bg-gray-200" />
        <Skeleton className="w-96 h-5 rounded-lg bg-gray-200" />
      </div>

      {/* Announcement List Skeleton */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-14 flex flex-col gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-gray/70 shadow-sm flex flex-col gap-4 animate-pulse">
            <div className="flex items-center justify-between">
              <Skeleton className="w-28 h-5 rounded-full bg-gray-200" />
              <Skeleton className="w-28 h-4 rounded-md bg-gray-200" />
            </div>
            <Skeleton className="w-3/4 h-6 rounded-lg bg-gray-200" />
            <Skeleton className="w-full h-4 rounded-md bg-gray-200" />
            <Skeleton className="w-4/5 h-4 rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
