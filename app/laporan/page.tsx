'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  ChevronRight, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  FileClock,
  Eye,
  MapPin,
  ShieldCheck,
  Tag
} from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { trackReportAction } from '@/app/actions/report.actions';

export default function PelacakanLaporanPage() {
  const [reportNumber, setReportNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNumber.trim() || !phone.trim()) {
      setError('Nomor Laporan dan Nomor WhatsApp wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await trackReportAction(reportNumber, phone);
      if (response.success && response.report) {
        setReportData(response.report);
      } else {
        setError(response.error || 'Laporan tidak ditemukan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi sistem. Mohon coba sesaat lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Helper status badge laporan
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Laporan Dikirim</span>;
      case 'received':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Diterima Pengurus</span>;
      case 'in_progress':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Ditindaklanjuti</span>;
      case 'resolved':
      case 'closed':
        return <span className="bg-green-50 text-success-rt border border-green-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Selesai / Selesai</span>;
      case 'rejected':
        return <span className="bg-red-50 text-error-rt border border-red-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Ditolak</span>;
      default:
        return null;
    }
  };

  // Helper priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-blue-100">Prioritas: Rendah</span>;
      case 'medium':
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-100">Prioritas: Sedang</span>;
      case 'high':
      case 'urgent':
        return <span className="bg-red-50 text-error-rt text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-100">Prioritas: Tinggi</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow pt-28 pb-20 bg-neutral-bg">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 bg-white py-3 px-5 rounded-2xl border border-neutral-gray/60 shadow-sm w-fit">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Layanan</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Pelacakan Laporan</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            {/* Sisi Kiri: Form Lacak */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-extrabold text-dark leading-tight">Lacak Laporan Warga</h1>
                  <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                    Masukkan nomor tiket laporan aduan dan nomor WhatsApp pelapor.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-3.5 rounded-xl flex items-start gap-1.5 leading-relaxed">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleTrackSubmit} className="flex flex-col gap-4">
                  <Input 
                    label="Nomor Tiket Laporan" 
                    placeholder="Contoh: LAP-2026-000001"
                    value={reportNumber}
                    onChange={(e) => setReportNumber(e.target.value)}
                  />
                  <Input 
                    label="Nomor WhatsApp" 
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    loading={loading}
                    className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Lacak Aduan
                  </Button>
                </form>
              </div>

              {/* Box Petunjuk */}
              <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex gap-3.5">
                <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-dark">Mengapa melacak?</span>
                  <span className="text-gray-500 font-semibold leading-relaxed">
                    Kode tiket laporan diawali <span className="font-bold text-primary">LAP-</span> diterbitkan agar warga dapat secara transparan memantau tahapan tindak lanjut yang dikerjakan pengurus RT.
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Hasil Pelacakan */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {reportData ? (
                <div className="bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 shadow-sm flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Info Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-gray pb-4">
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-6 h-6 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-primary tracking-wide leading-none">{reportData.report_number}</span>
                        <span className="text-xs text-gray-500 font-extrabold mt-1 truncate max-w-[200px]">{reportData.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(reportData.priority)}
                      {getStatusBadge(reportData.status)}
                    </div>
                  </div>

                  {/* Riwayat Detail */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nama Pelapor</span>
                      <span className="text-dark font-bold">{reportData.name}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Tanggal Dilaporkan</span>
                      <span className="text-dark font-bold">
                        {new Date(reportData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Kategori</span>
                      <span className="text-dark font-bold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-primary" /> {reportData.category}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Lokasi Kejadian</span>
                      <span className="text-dark font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {reportData.location || 'Tidak disebutkan'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2 sm:col-span-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Deskripsi Kejadian</span>
                      <span className="text-dark font-bold leading-relaxed">{reportData.description}</span>
                    </div>
                  </div>

                  {/* Foto Bukti (Jika Ada) */}
                  {reportData.photo_url && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-4 h-4 text-primary" /> Foto Bukti Kejadian
                      </span>
                      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-neutral-gray shadow-sm max-w-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={reportData.photo_url} alt={reportData.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {/* TIMELINE TRACKER LAPORAN */}
                  <div className="flex flex-col gap-5 mt-4 border-t border-neutral-gray pt-6">
                    <h3 className="text-xs font-bold text-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileClock className="w-4 h-4 text-primary" /> Lini Masa Pemrosesan Laporan
                    </h3>

                    <div className="relative border-l-2 border-neutral-gray pl-6 ml-3 space-y-8 text-left">
                      {/* Step 1: Dikirim */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-extrabold text-dark">Laporan Dikirim Warga</span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {new Date(reportData.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Updates Timeline (Riwayat report_updates dari DB) */}
                      {reportData.report_updates && reportData.report_updates.length > 0 ? (
                        reportData.report_updates.map((update: any, idx: number) => (
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
                        // Fallback jika belum ada data pembaruan tapi status sudah berubah
                        reportData.status !== 'submitted' && (
                          <div className="relative">
                            <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-dark">Laporan Sedang Ditinjau</span>
                              <span className="text-[9px] text-gray-400">Pengurus RT sedang mendiskusikan penanganan aduan.</span>
                            </div>
                          </div>
                        )
                      )}

                      {/* Status Terakhir Selesai */}
                      {['resolved', 'closed'].includes(reportData.status) && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                          <div className="flex flex-col gap-1.5 p-4 bg-green-50 rounded-2xl border border-green-100 max-w-md">
                            <span className="text-xs font-extrabold text-success-rt flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4" /> Masalah Terselesaikan
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">
                              Laporan aduan lingkungan ini telah selesai ditangani dengan sukses oleh kepengurusan RT 05 RW 19. Terima kasih atas partisipasi aktif Anda dalam menjaga keasrian lingkungan!
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-neutral-gray p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
                  <FileClock className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-base font-extrabold text-dark mb-1">Menunggu Input Pelacakan</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
                    Silakan masukkan Nomor Tiket Laporan dan Nomor WhatsApp pelapor di panel kiri untuk melacak status aduan secara dinamis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
