import Link from 'next/link';
import { 
  MessageSquare, 
  Search, 
  Calendar, 
  AlertCircle,
  Eye,
  Tag
} from 'lucide-react';
import { adminGetReports } from '@/services/report.service';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    category?: string;
    q?: string;
  }>;
}

export const revalidate = 0; // Realtime

export default async function AdminLaporanPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const status = searchParams.status || 'all';
  const priority = searchParams.priority || 'all';
  const category = searchParams.category || 'all';
  const query = searchParams.q || '';

  const reports = await adminGetReports({
    status,
    priority,
    category,
    search: query,
  });

  // Helper status badge laporan
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Masuk</span>;
      case 'received':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Diterima</span>;
      case 'in_progress':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Diproses</span>;
      case 'resolved':
      case 'closed':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Selesai</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Ditolak</span>;
      default:
        return null;
    }
  };

  // Helper priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-blue-100">Rendah</span>;
      case 'medium':
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-100">Sedang</span>;
      case 'high':
      case 'urgent':
        return <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-100">Tinggi</span>;
      default:
        return null;
    }
  };

  const categories = [
    'Keamanan', 'Kebersihan', 'Fasilitas Umum', 'Lingkungan', 'Sosial', 'Administrasi', 'Lainnya'
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Daftar Pengaduan Warga</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Kelola dan update perkembangan penanganan laporan warga RT 05 RW 19.</p>
      </div>

      {/* Filter Bar (Responsive Form) */}
      <form method="GET" action="/admin/laporan" className="bg-white border border-neutral-gray rounded-3xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs font-semibold">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Cari Laporan</label>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Tiket / Pelapor / Judul..."
            className="w-full px-3 py-2 bg-neutral-bg border border-neutral-gray rounded-xl font-medium outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Status</label>
          <select
            name="status"
            defaultValue={status}
            className="w-full px-3 py-2 bg-neutral-bg border border-neutral-gray rounded-xl font-medium outline-none focus:border-primary"
          >
            <option value="all">Semua Status</option>
            <option value="submitted">Masuk</option>
            <option value="received">Diterima</option>
            <option value="in_progress">Diproses</option>
            <option value="resolved">Selesai</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Prioritas</label>
          <select
            name="priority"
            defaultValue={priority}
            className="w-full px-3 py-2 bg-neutral-bg border border-neutral-gray rounded-xl font-medium outline-none focus:border-primary"
          >
            <option value="all">Semua Prioritas</option>
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl transition-all shadow font-bold text-center">
            Terapkan Filter
          </button>
          <Link href="/admin/laporan" className="bg-neutral-bg hover:bg-neutral-gray border border-neutral-gray/80 text-dark py-2.5 px-4 rounded-xl transition-all font-bold text-center flex items-center justify-center">
            Reset
          </Link>
        </div>
      </form>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-neutral-gray shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-bg border-b border-neutral-gray font-bold text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Tiket</th>
                <th className="px-6 py-4">Judul Laporan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Pelapor</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Prioritas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray font-semibold text-gray-600">
              {reports && reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-bg/50">
                    <td className="px-6 py-4 font-bold text-primary">{r.report_number}</td>
                    <td className="px-6 py-4 font-bold text-dark truncate max-w-[150px]">{r.title}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-primary shrink-0" /> {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{r.name}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">{getPriorityBadge(r.priority)}</td>
                    <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/laporan/${r.id}`}
                        className="inline-flex items-center gap-1 bg-neutral-bg hover:bg-neutral-gray text-dark px-3 py-1.5 rounded-lg border border-neutral-gray/80 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Tidak ada data laporan aduan warga ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
