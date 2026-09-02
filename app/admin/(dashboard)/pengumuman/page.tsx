import Link from 'next/link';
import { 
  Bell, 
  Plus, 
  AlertCircle
} from 'lucide-react';
import { getAllAnnouncementsForAdmin } from '@/services/announcement.service';
import AdminAnnouncementList from '@/components/admin/AdminAnnouncementList';

export const revalidate = 0; // Realtime

export default async function AdminAnnouncementPage() {
  const announcements = await getAllAnnouncementsForAdmin();

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-dark tracking-tight">Pengelolaan Pengumuman RT</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">Buat edaran warga resmi, info jadwal ronda, pemadaman listrik berkala, dsb.</p>
        </div>
        <Link
          href="/admin/pengumuman/tambah"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Pengumuman
        </Link>
      </div>

      {/* Render Client List Handler */}
      <AdminAnnouncementList initialAnnouncements={announcements} />
    </div>
  );
}
