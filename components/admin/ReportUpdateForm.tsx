'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateReportStatusAction } from '@/app/actions/admin.actions';

interface ReportUpdateFormProps {
  reportId: string;
  currentStatus: string;
}

export default function ReportUpdateForm({ reportId, currentStatus }: ReportUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateReportStatusAction(reportId, status as any, note) as any;
      if (response.success) {
        setSuccess(true);
        setNote('');
        router.refresh();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(response.error || 'Gagal memperbarui status laporan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat memperbarui status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-gray rounded-3xl p-6 shadow-sm flex flex-col gap-5 text-left font-semibold text-xs text-gray-500">
      <h3 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 mb-2 flex items-center gap-1">
        <ShieldCheck className="w-4.5 h-4.5 text-primary" /> Update Status & Lini Masa
      </h3>

      {success && (
        <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-3 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Status aduan berhasil diperbarui!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Pilih Status Baru</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-neutral-gray rounded-xl font-medium outline-none focus:border-primary text-dark text-xs"
        >
          <option value="submitted">Terkirim (submitted)</option>
          <option value="received">Diterima Pengurus (received)</option>
          <option value="in_progress">Sedang Ditindaklanjuti (in_progress)</option>
          <option value="resolved">Selesai Ditangani (resolved)</option>
          <option value="rejected">Ditolak / Tidak Valid (rejected)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Catatan Tindak Lanjut (Warga Bisa Melihat)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tuliskan keterangan tindakan yang sedang dikerjakan... (Contoh: Lampu jalan baru sedang dipesan, estimasi tiba 2 hari)"
          required
          className="w-full px-3 py-2 bg-white border border-neutral-gray focus:border-primary rounded-xl text-xs font-medium text-dark outline-none min-h-[90px]"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading} className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md active:scale-95">
          Perbarui Perkembangan
        </Button>
      </div>
    </form>
  );
}
