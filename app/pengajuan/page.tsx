'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  ChevronRight, 
  Search, 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Download, 
  MessageSquare,
  HelpCircle,
  FileClock,
  UserCheck
} from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { trackLetterRequestAction } from '@/app/actions/letter.actions';

export default function PelacakanSuratPage() {
  const [requestNumber, setRequestNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<any | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestNumber.trim() || !phone.trim()) {
      setError('Nomor Pengajuan dan Nomor WhatsApp wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setRequestData(null);

    try {
      const response = await trackLetterRequestAction(requestNumber, phone);
      if (response.success && response.request) {
        setRequestData(response.request);
      } else {
        setError(response.error || 'Pengajuan tidak ditemukan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi sistem. Mohon coba sesaat lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menentukan status lencana (badge)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Menunggu Persetujuan</span>;
      case 'processing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Sedang Diproses</span>;
      case 'revision':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Perlu Perbaikan</span>;
      case 'rejected':
        return <span className="bg-red-50 text-error-rt border border-red-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Ditolak</span>;
      case 'approved':
      case 'completed':
        return <span className="bg-green-50 text-success-rt border border-green-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Disetujui / Selesai</span>;
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
            <span className="text-primary font-bold">Pelacakan Surat</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sisi Kiri: Form Pencarian */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm text-left flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-extrabold text-dark leading-tight">Lacak Surat Warga</h1>
                  <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                    Masukkan nomor tiket pengajuan dan nomor WhatsApp yang digunakan saat mendaftar.
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
                    label="Nomor Pengajuan" 
                    placeholder="Contoh: REQ-2026-000001"
                    value={requestNumber}
                    onChange={(e) => setRequestNumber(e.target.value)}
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
                    Lacak Status
                  </Button>
                </form>
              </div>

              {/* Box Petunjuk */}
              <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm text-left flex gap-3.5">
                <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-dark">Bagaimana cara melacak?</span>
                  <span className="text-gray-500 font-semibold leading-relaxed">
                    Setiap kali Anda mengirim pengajuan, sistem akan memberikan nomor kode unik berawalan <span className="font-bold text-primary">REQ-</span>. Gunakan kode tersebut bersama dengan nomor HP Anda untuk masuk ke sistem pelacakan ini.
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Hasil Pelacakan & Lini Masa */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {requestData ? (
                <div className="bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 shadow-sm text-left flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Info Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-gray pb-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-6 h-6 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-primary tracking-wide leading-none">{requestData.request_number}</span>
                        <span className="text-xs text-gray-500 font-extrabold mt-1">{requestData.letter_types?.name}</span>
                      </div>
                    </div>
                    {getStatusBadge(requestData.status)}
                  </div>

                  {/* Riwayat Detail */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nama Pemohon</span>
                      <span className="text-dark font-bold">{requestData.applicant_name}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Tanggal Pengajuan</span>
                      <span className="text-dark font-bold">
                        {new Date(requestData.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2 sm:col-span-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Tujuan Pembuatan</span>
                      <span className="text-dark font-bold leading-relaxed">{requestData.purpose}</span>
                    </div>
                  </div>

                  {/* LINI MASA PENGURUSAN (TIMELINE TRACKER) */}
                  <div className="flex flex-col gap-5 mt-4 border-t border-neutral-gray pt-6">
                    <h3 className="text-xs font-bold text-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileClock className="w-4 h-4 text-primary" /> Lini Masa Pemrosesan
                    </h3>

                    <div className="relative border-l-2 border-neutral-gray pl-6 ml-3 space-y-8 text-left">
                      {/* Step 1: Dikirim */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-extrabold text-dark">Pengajuan Dikirim Warga</span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {new Date(requestData.submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Step 2: Diterima Admin */}
                      {['processing', 'revision', 'approved', 'rejected', 'completed'].includes(requestData.status) ? (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-extrabold text-dark">Diterima & Ditinjau Pengurus RT</span>
                            {requestData.reviewed_at && (
                              <span className="text-[10px] text-gray-400 font-semibold">
                                {new Date(requestData.reviewed_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative opacity-40">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-gray-300 border-4 border-white shadow" />
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-gray-500">Diterima Pengurus RT</span>
                            <span className="text-[9px] text-gray-400">Menunggu antrean review</span>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Sedang Diproses */}
                      {['processing', 'approved', 'completed'].includes(requestData.status) ? (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-dark">Pengecekan Keabsahan Dokumen</span>
                            <span className="text-[9px] text-gray-400">Data kependudukan warga sedang divalidasi</span>
                          </div>
                        </div>
                      ) : ['revision'].includes(requestData.status) ? (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-purple-600 border-4 border-white shadow flex items-center justify-center text-[8px] text-white">!</div>
                          <div className="flex flex-col gap-1.5 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                            <span className="text-xs font-extrabold text-purple-800 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Memerlukan Perbaikan
                            </span>
                            <p className="text-[11px] text-purple-700 leading-relaxed font-semibold">
                              Catatan Pengurus: <span className="font-extrabold underline">"{requestData.admin_note}"</span>
                            </p>
                            <span className="text-[9px] text-purple-500">Silakan hubungi pengurus RT melalui WA untuk merevisi pengajuan Anda.</span>
                          </div>
                        </div>
                      ) : ['rejected'].includes(requestData.status) ? (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-red-600 border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✕</div>
                          <div className="flex flex-col gap-1.5 p-4 bg-red-50 rounded-2xl border border-red-100">
                            <span className="text-xs font-extrabold text-error-rt flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Pengajuan Ditolak
                            </span>
                            <p className="text-[11px] text-red-700 leading-relaxed font-semibold">
                              Alasan Penolakan: <span className="font-extrabold">"{requestData.rejection_reason}"</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative opacity-40">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-gray-300 border-4 border-white shadow" />
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-gray-500">Pengecekan Keabsahan Dokumen</span>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Keputusan Akhir Selesai */}
                      {['approved', 'completed'].includes(requestData.status) ? (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-success-rt border-4 border-white shadow flex items-center justify-center text-[8px] text-white">✓</div>
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-dark">Surat Selesai Diterbitkan</span>
                              {requestData.approved_at && (
                                <span className="text-[10px] text-gray-400 font-semibold">
                                  Disetujui pada {new Date(requestData.approved_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>

                            {/* Tombol Unduh Dokumen PDF */}
                            {requestData.generated_documents?.file_url && (
                              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                                <div className="flex items-center gap-2 text-left">
                                  <UserCheck className="w-5 h-5 text-success-rt" />
                                  <div className="flex flex-col text-xs">
                                    <span className="font-bold text-success-rt">Dokumen Siap Diunduh</span>
                                    <span className="text-gray-500 font-semibold">Kode Verifikasi: {requestData.generated_documents.verification_code}</span>
                                  </div>
                                </div>
                                <a
                                  href={requestData.generated_documents.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-success-rt hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
                                >
                                  <Download className="w-3.5 h-3.5" /> Unduh Dokumen (PDF)
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative opacity-40">
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-gray-300 border-4 border-white shadow" />
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-gray-500">Penerbitan Surat Resmi</span>
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
                    Silakan masukkan Kode Nomor Pengajuan dan Nomor WhatsApp Anda di panel kiri untuk melacak status dokumen Anda secara dinamis.
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
