import Link from 'lucide-react';
import { 
  FileText, 
  Search, 
  Calendar, 
  AlertCircle,
  Eye,
  Tag
} from 'lucide-react';
import { adminGetLetterRequests } from '@/services/letter.service';
import LinkItem from 'next/link';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export const revalidate = 0; // Realtime

export default async function AdminPengajuanSuratPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const status = searchParams.status || 'all';
  const query = searchParams.q || '';

  const requests = await adminGetLetterRequests({
    status,
    search: query,
  });

  // Helper status badge surat
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Menunggu</span>;
      case 'processing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Diproses</span>;
      case 'revision':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Perbaikan</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Ditolak</span>;
      case 'approved':
      case 'completed':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Selesai</span>;
      default:
        return null;
    }
  };

  const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Menunggu', value: 'pending' },
    { label: 'Diproses', value: 'processing' },
    { label: 'Perbaikan', value: 'revision' },
    { label: 'Ditolak', value: 'rejected' },
    { label: 'Selesai', value: 'completed' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Pengajuan Surat Warga</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Review data diri warga, setujui, tolak, atau minta perbaikan data pengajuan surat.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-neutral-gray rounded-3xl p-5 shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {tabs.map((tab) => (
            <LinkItem
              key={tab.value}
              href={`/admin/pengajuan-surat?status=${tab.value}${query ? `&q=${query}` : ''}`}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                status === tab.value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-bg hover:bg-neutral-gray text-gray-600'
              }`}
            >
              {tab.label}
            </LinkItem>
          ))}
        </div>

        {/* Search Input */}
        <form method="GET" action="/admin/pengajuan-surat" className="w-full md:w-72 bg-neutral-bg rounded-xl border border-neutral-gray/80 p-1.5 flex items-center gap-2 text-xs font-semibold">
          <input
            type="hidden"
            name="status"
            value={status}
          />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari nama / NIK / tiket..."
            className="flex-1 bg-transparent border-none text-xs font-medium text-dark pl-2 outline-none"
          />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-neutral-gray shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-bg border-b border-neutral-gray font-bold text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Tiket</th>
                <th className="px-6 py-4">Nama Pemohon</th>
                <th className="px-6 py-4">Jenis Surat</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Prioritas / Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray font-semibold text-gray-600">
              {requests && requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-bg/50">
                    <td className="px-6 py-4 font-bold text-primary">{r.request_number}</td>
                    <td className="px-6 py-4 font-bold text-dark">{r.applicant_name}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" /> {r.letter_types?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <LinkItem
                        href={`/admin/pengajuan-surat/${r.id}`}
                        className="inline-flex items-center gap-1 bg-neutral-bg hover:bg-neutral-gray text-dark px-3 py-1.5 rounded-lg border border-neutral-gray/80 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Tinjau
                      </LinkItem>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Tidak ada data pengajuan surat ditemukan.</p>
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
