'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, Upload, Eye, Newspaper, ArrowLeft, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { saveNewsAction } from '@/app/actions/admin.actions';
import { compressImageClient } from '@/lib/client-image-compressor';

interface NewsFormProps {
  newsId?: string;
  initialData?: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    cover_image?: string;
    category?: string;
    status: 'draft' | 'published';
  };
}

export default function NewsForm({ newsId, initialData }: NewsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
    status: initialData?.status || 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Unggah berkas gambar base64
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.cover_image || null);

  // Auto-generate slug dari judul berita
  useEffect(() => {
    if (!newsId && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter non-alphanumeric
        .replace(/\s+/g, '-') // Ganti spasi dengan strip
        .replace(/-+/g, '-'); // Gabungkan strip ganda
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, newsId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const compressedBase64 = await compressImageClient(file, 1920, 1080, 0.85);
      setCoverBase64(compressedBase64);
      setCoverPreview(compressedBase64);
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      setError('Gagal membaca gambar. Silakan gunakan format JPG, PNG, atau WebP.');
    }
  };

  const handleRemoveCover = () => {
    setCoverBase64(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.slug.trim()) {
      setError('Judul, slug, dan isi konten berita wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        cover_image: coverPreview, // pertahankan gambar lama jika tidak ada unggah baru
      };
      
      const response = await saveNewsAction(
        newsId || null,
        payload,
        coverBase64 || undefined
      ) as any;

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/berita');
          router.refresh();
        }, 1500);
      } else {
        setError(response.error || 'Gagal menyimpan berita.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menyimpan berita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin/berita" className="p-2 bg-white hover:bg-neutral-bg rounded-xl border border-neutral-gray text-gray-500 hover:text-dark transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          {newsId ? 'Edit Artikel' : 'Tulis Artikel Baru'}
        </span>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>Berita berhasil disimpan! Mengalihkan ke daftar berita...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Judul, Ringkasan, Konten Utama (2/3 lebar) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 flex flex-col gap-5 shadow-sm">
          <div className="border-b border-neutral-gray pb-4 mb-2 flex items-center gap-2">
            <Newspaper className="w-4.5 h-4.5 text-primary" />
            <h2 className="text-xs font-extrabold text-dark uppercase tracking-wider">Isi Artikel Berita</h2>
          </div>

          <Input 
            label="Judul Berita"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Masukkan judul berita utama"
            required
          />

          <Input 
            label="Slug URL (Kunci Unik)"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="slug-url-berita"
            helperText="Digunakan untuk alamat URL link berita, otomatis dibuat dari judul"
            required
            disabled={!!newsId} // Kunci slug jika mengedit berita untuk konsistensi link
          />

          <div className="w-full flex flex-col gap-1.5 font-semibold text-xs text-gray-500">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Ringkasan Pendek (Excerpt)</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Tuliskan ringkasan 2-3 kalimat mengenai isi berita..."
              className="w-full px-4 py-3 bg-white border border-neutral-gray focus:border-primary rounded-xl text-sm font-medium text-dark outline-none min-h-[70px]"
            />
          </div>

          <div className="w-full flex flex-col gap-1.5 font-semibold text-xs text-gray-500">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Konten Berita Lengkap</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Tulis isi berita lengkap di sini (mendukung penulisan tag HTML dasar untuk format tulisan)..."
              required
              className="w-full px-4 py-3 bg-white border border-neutral-gray focus:border-primary rounded-xl text-sm font-medium text-dark outline-none min-h-[220px]"
            />
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Penerbitan & Gambar Sampul */}
        <div className="lg:col-span-1 flex flex-col gap-6 font-semibold text-xs text-gray-500">
          
          {/* Metadata Penerbitan */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-neutral-gray pb-2 mb-1">
              Pengaturan Terbit
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Pilih Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-neutral-gray rounded-xl font-medium outline-none focus:border-primary text-dark text-xs"
              >
                <option value="">Pilih Kategori...</option>
                <option value="Kerja Bakti">Kerja Bakti</option>
                <option value="Rapat Warga">Rapat Warga</option>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Agustusan">Kegiatan Warga</option>
                <option value="Kesehatan">Kesehatan / Posyandu</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Umum">Umum</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Status Berita</label>
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
                Simpan Artikel
              </Button>
            </div>
          </div>

          {/* Gambar Sampul (Cover Image Upload) */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Upload className="w-4 h-4 text-primary" /> Foto Sampul Berita
            </span>

            {coverPreview ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-neutral-gray">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-3 right-3 bg-dark/80 text-white p-1.5 rounded-full hover:bg-dark transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-gray rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-bg/30">
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                <div className="w-8 h-8 rounded-full bg-red-50 text-primary flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-dark mt-1">Unggah foto sampul</span>
                <span className="text-[8px] text-gray-400 font-semibold">Maksimal 5MB (JPG, PNG)</span>
              </label>
            )}
          </div>

        </div>

      </div>
    </form>
  );
}
