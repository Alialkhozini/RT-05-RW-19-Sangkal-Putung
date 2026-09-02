import { getGalleryItems } from '@/services/gallery.service';
import GalleryManager from '@/components/admin/GalleryManager';

export const revalidate = 0; // Realtime

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Galeri Dokumentasi RT</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Unggah dokumentasi foto kegiatan warga, rapat warga, dan kerja bakti lingkungan.</p>
      </div>

      <div className="mt-4">
        <GalleryManager initialItems={items} />
      </div>
    </div>
  );
}
