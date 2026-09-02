'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Bell, Calendar, AlertCircle, Check, Pin } from 'lucide-react';
import { removeAnnouncementAction } from '@/app/actions/admin.actions';

interface AnnouncementItem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
}

interface AdminAnnouncementListProps {
  initialAnnouncements: AnnouncementItem[];
}

export default function AdminAnnouncementList({ initialAnnouncements }: AdminAnnouncementListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`)) {
      return;
    }

    setLoadingId(id);
    setError(null);
    setSuccess(null);

    try {
      const response = await removeAnnouncementAction(id);
      if (response.success) {
        setSuccess('Pengumuman berhasil dihapus!');
        router.refresh();
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError('Gagal menghapus pengumuman.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menghapus.');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <span className="bg-green-50 text-green-700 border border-green-200 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">Published</span>
    ) : (
      <span className="bg-gray-50 text-gray-500 border border-gray-200 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">Draft</span>
    );
  };

  return (
    <div className="flex flex-col gap-4 text-left font-semibold text-xs text-gray-500">
      {success && (
        <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
          <Check className="w-4.5 h-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-neutral-gray shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-bg border-b border-neutral-gray font-bold text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Judul Pengumuman</th>
                <th className="px-6 py-4">Tanggal Terbit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray font-semibold text-gray-600">
              {initialAnnouncements && initialAnnouncements.length > 0 ? (
                initialAnnouncements.map((a) => (
                  <tr key={a.id} className="hover:bg-neutral-bg/50">
                    <td className="px-6 py-4 font-bold text-dark truncate max-w-[350px]">
                      <a href={`/informasi/pengumuman/${a.slug}`} target="_blank" className="hover:text-primary transition-colors flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-primary shrink-0" /> {a.title}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {a.published_at 
                        ? new Date(a.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(a.status)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link
                        href={`/admin/pengumuman/${a.id}/edit`}
                        className="inline-flex items-center gap-1 bg-neutral-bg hover:bg-neutral-gray text-dark px-2.5 py-1.5 rounded-lg border border-neutral-gray/80 font-bold"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        disabled={loadingId === a.id}
                        className="inline-flex items-center gap-1 bg-red-50 hover:bg-error-rt text-error-rt hover:text-white px-2.5 py-1.5 rounded-lg border border-red-100 hover:border-transparent font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {loadingId === a.id ? '...' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Belum ada pengumuman yang ditulis.</p>
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
