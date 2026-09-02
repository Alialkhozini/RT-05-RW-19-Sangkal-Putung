import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Phone, 
  Eye, 
  Tag, 
  FileClock,
  ExternalLink
} from 'lucide-react';
import { adminGetReportById } from '@/services/report.service';
import ReportUpdateForm from '@/components/admin/ReportUpdateForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Realtime

export default async function AdminLaporanDetailPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const report = await adminGetReportById(id);

  if (!report) {
    notFound();
  }

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
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-blue-100">Rendah</span>;
      case 'medium':
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-amber-100">Sedang</span>;
      case 'high':
      case 'urgent':
        return <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-red-100">Tinggi</span>;
      default:
        return null;
    }
  };

  const waLink = `https://wa.me/${report.phone.replace(/[^0-9]/g, '')}`;

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Tombol Kembali */}
      <Link
        href="/admin/laporan"
        className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Laporan
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Informasi Detail Laporan & Riwayat Lini Masa (2/3 lebar) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Card Detail Laporan */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-gray pb-4">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-primary tracking-wide leading-none">{report.report_number}</span>
                  <span className="text-xs text-gray-500 font-extrabold mt-1">{report.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(report.priority)}
                {getStatusBadge(report.status)}
              </div>
            </div>

            {/* Riwayat Detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nama Pelapor</span>
                <span className="text-dark font-extrabold">{report.name}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Tanggal Dilaporkan</span>
                <span className="text-dark font-extrabold">
                  {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Kategori Laporan</span>
                <span className="text-dark font-extrabold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-primary" /> {report.category}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nomor WhatsApp</span>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-extrabold flex items-center gap-0.5">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" /> {report.phone} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2 sm:col-span-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Lokasi Kejadian</span>
                <span className="text-dark font-extrabold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {report.location || 'Tidak dicantumkan'}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2 sm:col-span-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Isi Laporan / Keluhan Warga</span>
                <p className="text-dark font-bold leading-relaxed whitespace-pre-line mt-1">{report.description}</p>
              </div>
            </div>

            {/* Foto Bukti */}
            {report.photo_url && (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-4 h-4 text-primary" /> Foto Bukti Kejadian
                </span>
                <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-neutral-gray shadow-sm max-w-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={report.photo_url} alt={report.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* Lini Masa Penanganan */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-gray pb-4">
              <FileClock className="w-4 h-4 text-primary" /> Riwayat Penanganan Aduan
            </h3>

            <div className="relative border-l-2 border-neutral-gray pl-6 ml-3 space-y-8 text-left">
              {/* Step Awal: Dikirim */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-dark">Laporan Dikirim Warga</span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {new Date(report.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Pembaruan dinamis */}
              {report.report_updates && report.report_updates.length > 0 ? (
                report.report_updates.map((update: any) => (
                  <div key={update.id} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-extrabold text-dark capitalize">
                        {update.status === 'received' && 'Laporan Diterima Pengurus'}
                        {update.status === 'in_progress' && 'Sedang Ditindaklanjuti'}
                        {update.status === 'resolved' && 'Laporan Selesai Ditangani'}
                        {update.status === 'closed' && 'Aduan Ditutup'}
                        {update.status === 'rejected' && 'Laporan Ditolak / Tidak Valid'}
                      </span>
                      {update.note && (
                        <p className="text-[11px] text-gray-500 font-semibold bg-neutral-bg p-3 rounded-xl border border-neutral-gray w-fit max-w-md">
                          {update.note}
                        </p>
                      )}
                      <span className="text-[9px] text-gray-400 font-semibold">
                        {new Date(update.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 font-semibold py-4">Belum ada catatan pembaruan dari pengurus RT.</div>
              )}
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Update Status Form (1/3 lebar) */}
        <div className="lg:col-span-1">
          <ReportUpdateForm reportId={report.id} currentStatus={report.status} />
        </div>

      </div>
    </div>
  );
}
