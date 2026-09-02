import Link from 'next/link';
import { 
  FileText, 
  MessageSquare, 
  Newspaper, 
  Clock, 
  ArrowRight,
  Plus,
  Users,
  Activity,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 0; // Dasbor selalu memuat data terbaru secara realtime (no cache)

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  // Ambil statistik data secara paralel
  const [
    { count: totalLetters },
    { count: pendingLetters },
    { count: totalReports },
    { count: publishedNews },
    { data: latestLetters },
    { data: latestReports },
    { data: activityLogs }
  ] = await Promise.all([
    supabase.from('letter_requests').select('*', { count: 'exact', head: true }),
    supabase.from('letter_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('letter_requests').select('*, letter_types(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('admin_activity_logs').select('*, profiles(email)').order('created_at', { ascending: false }).limit(5)
  ]);

  const statCards = [
    { label: 'Total Pengajuan Surat', value: totalLetters || 0, icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-100', href: '/admin/pengajuan-surat' },
    { label: 'Menunggu Persetujuan', value: pendingLetters || 0, icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-100', href: '/admin/pengajuan-surat?status=pending' },
    { label: 'Laporan Warga Masuk', value: totalReports || 0, icon: MessageSquare, color: 'bg-purple-50 text-purple-700 border-purple-100', href: '/admin/laporan' },
    { label: 'Berita Dipublikasikan', value: publishedNews || 0, icon: Newspaper, color: 'bg-green-50 text-green-700 border-green-100', href: '/admin/berita' },
  ];

  // Helper status badge surat
  const getLetterStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Menunggu</span>;
      case 'processing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Diproses</span>;
      case 'revision':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Revisian</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Ditolak</span>;
      case 'approved':
      case 'completed':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Selesai</span>;
      default:
        return null;
    }
  };

  // Helper status badge laporan
  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Masuk</span>;
      case 'received':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Diterima</span>;
      case 'in_progress':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Diproses</span>;
      case 'resolved':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Selesai</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Ditolak</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* 1. Header Ringkasan */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-dark tracking-tight leading-none">Ringkasan Operasional</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Data statistik keseluruhan layanan digital dan konten informasi RT 05 RW 19.</p>
      </div>

      {/* 2. Grid Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between ${card.color}`}
            >
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-extrabold tracking-tight leading-none">{card.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{card.label}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center border border-current/10">
                <IconComponent className="w-5 h-5 text-current" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Panel Utama (Dua Kolom: Transaksi vs Log Aktivitas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Tabel Layanan Terbaru (2/3 lebar) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Box 3.1: Pengajuan Surat Terbaru */}
          <div className="bg-white rounded-3xl border border-neutral-gray shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-gray flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-primary" /> Pengajuan Surat Terbaru
              </h2>
              <Link href="/admin/pengajuan-surat" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-0.5">
                Semua Surat <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-bg border-b border-neutral-gray font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Tiket</th>
                    <th className="px-6 py-3">Pemohon</th>
                    <th className="px-6 py-3">Jenis Surat</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-gray font-semibold text-gray-600">
                  {latestLetters && latestLetters.length > 0 ? (
                    latestLetters.map((l: any) => (
                      <tr key={l.id} className="hover:bg-neutral-bg/50">
                        <td className="px-6 py-4">
                          <Link href={`/admin/pengajuan-surat/${l.id}`} className="text-primary font-bold hover:underline">
                            {l.request_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-bold text-dark">{l.applicant_name}</td>
                        <td className="px-6 py-4">{l.letter_types?.name}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(l.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-6 py-4 text-right">{getLetterStatusBadge(l.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        Belum ada pengajuan surat warga.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Box 3.2: Laporan Warga Terbaru */}
          <div className="bg-white rounded-3xl border border-neutral-gray shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-gray flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4.5 h-4.5 text-primary" /> Laporan Warga Terbaru
              </h2>
              <Link href="/admin/laporan" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-0.5">
                Semua Aduan <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-bg border-b border-neutral-gray font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Tiket</th>
                    <th className="px-6 py-3">Judul Aduan</th>
                    <th className="px-6 py-3">Pelapor</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-gray font-semibold text-gray-600">
                  {latestReports && latestReports.length > 0 ? (
                    latestReports.map((r: any) => (
                      <tr key={r.id} className="hover:bg-neutral-bg/50">
                        <td className="px-6 py-4">
                          <Link href={`/admin/laporan/${r.id}`} className="text-primary font-bold hover:underline">
                            {r.report_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-bold text-dark truncate max-w-[150px]">{r.title}</td>
                        <td className="px-6 py-4">{r.name}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-6 py-4 text-right">{getReportStatusBadge(r.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        Belum ada laporan pengaduan masuk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Log Aktivitas Admin (1/3 lebar) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5 h-full">
            <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-gray pb-4">
              <Activity className="w-4.5 h-4.5 text-primary" /> Aktivitas Admin Terbaru
            </h2>

            <div className="flex flex-col gap-5 overflow-y-auto max-h-[500px] text-xs font-semibold">
              {activityLogs && activityLogs.length > 0 ? (
                activityLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-3 items-start border-b border-neutral-gray/40 pb-4 last:border-b-0 last:pb-0">
                    <div className="w-7 h-7 rounded-lg bg-red-50 text-primary border border-red-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-dark font-extrabold line-clamp-1">{log.profiles?.email || 'admin'}</span>
                      <span className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">{log.description}</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} Pkl {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Activity className="w-10 h-10 text-gray-300 mb-2" />
                  Belum ada log aktivitas tersimpan.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
