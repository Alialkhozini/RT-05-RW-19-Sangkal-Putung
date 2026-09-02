'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Tag, Calendar, AlertCircle, Check } from 'lucide-react';
import { removeNewsAction } from '@/app/actions/admin.actions';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
  category?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
}

interface AdminNewsListProps {
  initialNews: NewsItem[];
}

export default function AdminNewsList({ initialNews }: AdminNewsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berita "${title}"?`)) {
      return;
    }

    setLoadingId(id);
    setError(null);
    setSuccess(null);

    try {
      const response = await removeNewsAction(id);
      if (response.success) {
        setSuccess('Berita berhasil dihapus!');
        router.refresh();
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError('Gagal menghapus berita.');
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
                <th className="px-6 py-4">Sampul</th>
                <th className="px-6 py-4">Judul Berita</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tanggal Terbit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray font-semibold text-gray-600">
              {initialNews && initialNews.length > 0 ? (
                initialNews.map((n) => (
                  <tr key={n.id} className="hover:bg-neutral-bg/50">
                    <td className="px-6 py-4 shrink-0">
                      <div className="relative w-12 h-9 rounded-lg bg-neutral-bg overflow-hidden border border-neutral-gray">
                        {n.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={n.cover_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Tag className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-dark truncate max-w-[200px]">
                      <a href={`/informasi/berita/${n.slug}`} target="_blank" className="hover:text-primary transition-colors">
                        {n.title}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-primary shrink-0" /> {n.category || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {n.published_at 
                        ? new Date(n.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(n.status)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link
                        href={`/admin/berita/${n.id}/edit`}
                        className="inline-flex items-center gap-1 bg-neutral-bg hover:bg-neutral-gray text-dark px-2.5 py-1.5 rounded-lg border border-neutral-gray/80 font-bold"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(n.id, n.title)}
                        disabled={loadingId === n.id}
                        className="inline-flex items-center gap-1 bg-red-50 hover:bg-error-rt text-error-rt hover:text-white px-2.5 py-1.5 rounded-lg border border-red-100 hover:border-transparent font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {loadingId === n.id ? '...' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Belum ada berita yang ditulis.</p>
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
