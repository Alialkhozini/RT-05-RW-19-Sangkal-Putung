import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { adminGetLetterRequestById } from '@/services/letter.service';
import LetterApprovalActions from '@/components/admin/LetterApprovalActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Realtime

export default async function AdminLetterDetailPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const request = await adminGetLetterRequestById(id);

  if (!request) {
    notFound();
  }

  // Helper status badge surat
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Menunggu Persetujuan</span>;
      case 'processing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Sedang Diproses</span>;
      case 'revision':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Perlu Perbaikan</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Ditolak</span>;
      case 'approved':
      case 'completed':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Selesai / Terbit</span>;
      default:
        return null;
    }
  };

  const waLink = `https://wa.me/${request.phone.replace(/[^0-9]/g, '')}`;

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Tombol Kembali */}
      <Link
        href="/admin/pengajuan-surat"
        className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pengajuan
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Rincian Lengkap Pemohon (2/3 lebar) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 shadow-sm flex flex-col gap-6">
            {/* Header Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-gray pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-primary tracking-wide leading-none">{request.request_number}</span>
                  <span className="text-xs text-gray-500 font-extrabold mt-1">{request.letter_types?.name}</span>
                </div>
              </div>
              {getStatusBadge(request.status)}
            </div>

            {/* Warning Kerahasiaan Data (Admin View Alert) */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold p-3.5 rounded-2xl flex items-start gap-1.5 leading-relaxed">
              <ShieldAlert className="w-4.5 h-4.5 text-blue-700 shrink-0 mt-0.5" />
              <span>Data pribadi kependudukan warga di bawah ini ditampilkan secara utuh demi validitas penerbitan surat resmi. Jagalah kerahasiaan data ini.</span>
            </div>

            {/* Rincian Tabel Identitas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nama Lengkap (KTP)</span>
                <span className="text-dark font-extrabold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary shrink-0" /> {request.applicant_name}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Tanggal Diajukan</span>
                <span className="text-dark font-extrabold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> 
                  {new Date(request.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nomor Induk Kependudukan (NIK)</span>
                <span className="text-dark font-extrabold tracking-wider">{request.nik}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nomor Kartu Keluarga (KK)</span>
                <span className="text-dark font-extrabold tracking-wider">{request.kk_number}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Tempat / Tanggal Lahir</span>
                <span className="text-dark font-extrabold">
                  {request.birth_place || '-'}, {request.birth_date ? new Date(request.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Nomor WhatsApp</span>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-extrabold flex items-center gap-0.5">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" /> {request.phone} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2 sm:col-span-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Alamat Domisili Pemohon</span>
                <span className="text-dark font-extrabold leading-relaxed flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {request.address}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-neutral-gray/30 pb-2 sm:col-span-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Tujuan / Keperluan Pembuatan</span>
                <span className="text-dark font-extrabold leading-relaxed">{request.purpose}</span>
              </div>
            </div>

            {/* Riwayat Catatan Admin Terakhir */}
            {request.admin_note && (
              <div className="bg-neutral-bg rounded-2xl p-4 border border-neutral-gray text-xs font-semibold">
                <span className="text-gray-400 uppercase tracking-wider text-[9px] block mb-1">Catatan Tambahan Admin</span>
                <p className="text-dark font-bold">"{request.admin_note}"</p>
              </div>
            )}

            {/* Riwayat Penolakan Terakhir */}
            {request.status === 'rejected' && request.rejection_reason && (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-xs font-semibold text-error-rt">
                <span className="text-red-400 uppercase tracking-wider text-[9px] block mb-1">Alasan Penolakan</span>
                <p className="font-extrabold">"{request.rejection_reason}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Aksi Otorisasi (1/3 lebar) */}
        <div className="lg:col-span-1">
          <LetterApprovalActions 
            requestId={request.id}
            currentStatus={request.status}
            generatedFileUrl={request.generated_documents?.file_url}
            verificationCode={request.generated_documents?.verification_code}
          />
        </div>

      </div>
    </div>
  );
}
