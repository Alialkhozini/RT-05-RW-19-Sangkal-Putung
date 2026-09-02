import Link from 'next/link';
import { 
  Newspaper, 
  Plus, 
  Calendar, 
  AlertCircle,
  Edit2,
  Trash2,
  Tag
} from 'lucide-react';
import { getAllNewsForAdmin } from '@/services/news.service';
import AdminNewsList from '@/components/admin/AdminNewsList';

export const revalidate = 0; // Realtime

export default async function AdminNewsPage() {
  const news = await getAllNewsForAdmin();

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-dark tracking-tight">Pengelolaan Berita RT</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">Publikasikan kabar terbaru, dokumentasi rapat warga, dan info menarik lainnya.</p>
        </div>
        <Link
          href="/admin/berita/tambah"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Berita
        </Link>
      </div>

      {/* Render Client List Handler (untuk tombol delete & refresh) */}
      <AdminNewsList initialNews={news} />
    </div>
  );
}
