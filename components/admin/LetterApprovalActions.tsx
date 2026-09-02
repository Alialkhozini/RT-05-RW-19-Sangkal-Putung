'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Download, 
  FileText,
  Edit3,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
  approveLetterRequestAction, 
  rejectLetterRequestAction, 
  requestRevisionLetterRequestAction 
} from '@/app/actions/letter.actions';

interface ApprovalProps {
  requestId: string;
  currentStatus: string;
  generatedFileUrl?: string;
  verificationCode?: string;
}

export default function LetterApprovalActions({ 
  requestId, 
  currentStatus, 
  generatedFileUrl,
  verificationCode 
}: ApprovalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State untuk form input penolakan & revisi
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

  const handleApprove = async () => {
    if (!confirm('Apakah Anda yakin ingin menyetujui pengajuan ini? Tindakan ini akan menggenerasi dokumen PDF resmi secara otomatis.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await approveLetterRequestAction(requestId);
      if (result.success) {
        setSuccess(`Pengajuan disetujui! Nomor surat terbit: ${result.letterNumber}`);
        router.refresh();
      } else {
        setError(result.error || 'Gagal memproses persetujuan pengajuan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menyetujui.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError('Alasan penolakan wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await rejectLetterRequestAction(requestId, rejectReason);
      if (response.success) {
        setSuccess('Pengajuan surat berhasil ditolak.');
        setShowRejectForm(false);
        router.refresh();
      } else {
        setError(response.error || 'Gagal menolak pengajuan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menolak.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim()) {
      setError('Catatan perbaikan wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await requestRevisionLetterRequestAction(requestId, revisionNote);
      if (response.success) {
        setSuccess('Permintaan revisi data berhasil dikirim ke warga.');
        setShowRevisionForm(false);
        router.refresh();
      } else {
        setError(response.error || 'Gagal memproses permintaan revisi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat meminta revisi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-gray rounded-3xl p-6 shadow-sm flex flex-col gap-5 text-left font-semibold text-xs text-gray-500">
      <h3 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 mb-2 flex items-center gap-1.5">
        <Clock className="w-4.5 h-4.5 text-primary" /> Panel Otorisasi & Keputusan
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-3.5 rounded-xl flex items-start gap-1.5 leading-relaxed">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-3.5 rounded-xl flex items-start gap-1.5 leading-relaxed">
          <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* TAMPILAN STATUS SELESAI */}
      {currentStatus === 'completed' && generatedFileUrl && (
        <div className="flex flex-col gap-4">
          <div className="bg-green-50 border border-green-200 text-success-rt rounded-2xl p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold">Surat Telah Diterbitkan</span>
              <span className="text-gray-500 font-semibold leading-relaxed">Dokumen PDF resmi sudah digenerasi, ditandatangani secara elektronik, dan dicap basah stempel RT.</span>
              <span className="text-[10px] text-gray-400 font-bold mt-1">Kode Verifikasi QR: {verificationCode}</span>
            </div>
          </div>
          <a
            href={generatedFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-success-rt hover:bg-green-700 text-white text-xs font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-4.5 h-4.5" /> Unduh Hasil PDF Surat
          </a>
        </div>
      )}

      {currentStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 text-error-rt rounded-2xl p-4 flex gap-3">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-bold">Pengajuan Ditolak</span>
            <span className="text-gray-500 font-semibold leading-relaxed">Status pengajuan ditutup oleh admin dan ditolak terbit.</span>
          </div>
        </div>
      )}

      {/* PANEL TOMBOL AKSI JIKA STATUS BELUM FINISH */}
      {['pending', 'processing', 'revision'].includes(currentStatus) && (
        <div className="flex flex-col gap-3">
          {/* Form Rejection */}
          {showRejectForm ? (
            <form onSubmit={handleReject} className="flex flex-col gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-150">
              <span className="text-xs font-bold text-red-800">Alasan Penolakan Surat</span>
              <textarea
                placeholder="Tuliskan alasan penolakan secara jelas agar dibaca pemohon..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-red-200 focus:border-red-400 rounded-xl text-xs font-medium text-dark outline-none min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button type="submit" loading={loading} variant="danger" size="sm" className="flex-grow">
                  Tolak Pengajuan
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowRejectForm(false)} className="bg-white">
                  Batal
                </Button>
              </div>
            </form>
          ) : showRevisionForm ? (
            /* Form Revision */
            <form onSubmit={handleRevision} className="flex flex-col gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 animate-in slide-in-from-top-2 duration-150">
              <span className="text-xs font-bold text-purple-800">Catatan Perbaikan Dokumen</span>
              <textarea
                placeholder="Tuliskan bagian data pemohon yang perlu diperbaiki..."
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-purple-200 focus:border-purple-400 rounded-xl text-xs font-medium text-dark outline-none min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button type="submit" loading={loading} variant="primary" size="sm" className="flex-grow bg-purple-700 hover:bg-purple-800">
                  Minta Revisi
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowRevisionForm(false)} className="bg-white">
                  Batal
                </Button>
              </div>
            </form>
          ) : (
            /* Main Buttons Panel */
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleApprove}
                loading={loading}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4.5 h-4.5" /> Setujui Pengajuan & Terbitkan
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowRevisionForm(true)}
                  disabled={loading}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center justify-center gap-1 font-bold"
                >
                  <Edit3 className="w-4 h-4 text-purple-600" /> Minta Revisi
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  variant="outline"
                  className="border-red-200 text-error-rt hover:bg-red-50 flex items-center justify-center gap-1 font-bold"
                >
                  <X className="w-4 h-4 text-error-rt" /> Tolak Surat
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
