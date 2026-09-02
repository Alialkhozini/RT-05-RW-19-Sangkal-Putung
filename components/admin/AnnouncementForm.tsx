'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, ArrowLeft, Bell, Pin } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { saveAnnouncementAction } from '@/app/actions/admin.actions';

interface AnnouncementFormProps {
  annId?: string;
  initialData?: {
    title: string;
    slug: string;
    content: string;
    status: 'draft' | 'published';
  };
}

export default function AnnouncementForm({ annId, initialData }: AnnouncementFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    status: initialData?.status || 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generate slug dari judul
  useEffect(() => {
    if (!annId && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, annId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.slug.trim()) {
      setError('Judul, slug, dan isi konten pengumuman wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await saveAnnouncementAction(annId || null, formData) as any;

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/pengumuman');
          router.refresh();
        }, 1500);
      } else {
        setError(response.error || 'Gagal menyimpan pengumuman.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left max-w-4xl">
      {/* Back navigation */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin/pengumuman" className="p-2 bg-white hover:bg-neutral-bg rounded-xl border border-neutral-gray text-gray-500 hover:text-dark transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          {annId ? 'Edit Pengumuman' : 'Tulis Pengumuman Baru'}
        </span>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>Pengumuman berhasil disimpan! Mengalihkan ke daftar...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Judul, Ringkasan, Konten Utama */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 flex flex-col gap-5 shadow-sm">
          <div className="border-b border-neutral-gray pb-4 mb-2 flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-primary" />
            <h2 className="text-xs font-extrabold text-dark uppercase tracking-wider">Konten Edaran Pengumuman</h2>
          </div>

          <Input 
            label="Judul Pengumuman"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Masukkan judul pengumuman resmi"
            required
          />

          <Input 
            label="Slug URL"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="slug-url-pengumuman"
            required
            disabled={!!annId}
          />

          <div className="w-full flex flex-col gap-1.5 font-semibold text-xs text-gray-500">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Isi Konten Pengumuman Lengkap</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Tulis edaran lengkap di sini..."
              required
              className="w-full px-4 py-3 bg-white border border-neutral-gray focus:border-primary rounded-xl text-sm font-medium text-dark outline-none min-h-[220px]"
            />
          </div>
        </div>

        {/* Kolom Kanan: Status & Pinned */}
        <div className="lg:col-span-1 flex flex-col gap-6 font-semibold text-xs text-gray-500">
          
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-neutral-gray pb-2 mb-1">
              Pengaturan Penerbitan
            </span>

             <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Status Terbit</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-neutral-gray rounded-xl font-medium outline-none focus:border-primary text-dark text-xs"
              >
                <option value="draft">Draft (Simpan Sementara)</option>
                <option value="published">Terbit (Tampilkan ke Publik)</option>
              </select>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md">
                Simpan Pengumuman
              </Button>
            </div>
          </div>

        </div>

      </div>
    </form>
  );
}
