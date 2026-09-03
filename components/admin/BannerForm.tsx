'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Upload, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { saveBannerAction } from '@/app/actions/admin.actions';

interface BannerFormProps {
  initialData?: {
    id?: string;
    title: string;
    subtitle?: string;
    badge?: string;
    image_url: string;
    cta_text?: string;
    cta_link?: string;
    order_num?: number;
    is_active?: boolean;
  };
}

export default function BannerForm({ initialData }: BannerFormProps) {
  const router = useRouter();
  const bannerId = initialData?.id;

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    badge: initialData?.badge || 'WEBSITE RESMI RT 05 RW 19',
    image_url: initialData?.image_url || '/hero-banner.jpg',
    cta_text: initialData?.cta_text || '',
    cta_link: initialData?.cta_link || '',
    order_num: initialData?.order_num !== undefined ? initialData.order_num : 1,
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
  });

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || '/hero-banner.jpg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'order_num') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran berkas banner maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Judul banner wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await saveBannerAction(bannerId || null, formData, imageBase64 || undefined);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/banner');
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan banner hero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl text-left">
      {/* Tombol Kembali & Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/banner"
          className="p-2.5 bg-white hover:bg-neutral-bg rounded-xl border border-neutral-gray text-gray-500 hover:text-dark transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-dark tracking-tight">
            {bannerId ? 'Edit Banner Hero' : 'Tambah Banner Hero Baru'}
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Unggah gambar banner beresolusi 1920 x 1080 px dan atur teks yang muncul di carousel beranda.
          </p>
        </div>
      </div>

      {/* Alert Notifikasi */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>Banner hero berhasil disimpan! Mengalihkan ke daftar...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* 1. Unggah Gambar Banner */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-gray/80 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-neutral-gray/60 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                <Sliders className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider">
                Gambar Banner (1920 x 1080 px)
              </h2>
            </div>
            <span className="text-[11px] font-bold text-gray-400 bg-neutral-bg px-2.5 py-1 rounded-full">
              Rasio 16:9
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Pratinjau Gambar Banner 16:9 */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-bg border border-neutral-gray shadow-inner group">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Pratinjau Banner"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <Upload className="w-8 h-8 opacity-40" />
                  <span className="text-xs font-semibold">Belum ada gambar banner</span>
                </div>
              )}

              {/* Overlay preview teks mockup */}
              <div className="absolute inset-0 bg-gradient-to-b from-dark/50 via-dark/30 to-dark/80 flex flex-col items-center justify-center p-6 text-white text-center pointer-events-none">
                {formData.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/40 px-3 py-1 rounded-full mb-2 border border-primary/50">
                    {formData.badge}
                  </span>
                )}
                <h3 className="font-handwriting text-2xl md:text-4xl font-bold drop-shadow-md max-w-lg truncate">
                  {formData.title || 'Judul Banner Tampil Di Sini'}
                </h3>
                <p className="text-xs text-gray-200 mt-1 max-w-md line-clamp-2 drop-shadow">
                  {formData.subtitle || 'Subjudul deskripsi singkat banner hero.'}
                </p>
              </div>
            </div>

            {/* Input File Unggah */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-bg hover:bg-neutral-gray/80 text-dark font-bold text-xs px-5 py-3 rounded-xl border border-neutral-gray cursor-pointer transition-colors shadow-xs">
                <Upload className="w-4 h-4 text-primary" />
                <span>Pilih Berkas Banner Baru</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-gray-400 font-medium">
                Format didukung: JPG, PNG, WEBP. Rekomendasi ukuran: <strong>1920 x 1080 px</strong> (Maks 5MB).
              </span>
            </div>
          </div>
        </div>

        {/* 2. Informasi Konten Banner */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-gray/80 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-neutral-gray/60 pb-4">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider">
              Teks & Detail Informasi
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Badge Label (Tag Atas)"
              name="badge"
              value={formData.badge}
              onChange={handleInputChange}
              placeholder="Contoh: WEBSITE RESMI RT 05 RW 19"
            />

            <Input
              label="Judul Utama Banner"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Contoh: Selamat Datang di Website RT 05 RW 19"
              required
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-gray-700">Subjudul / Deskripsi Banner</label>
              <textarea
                name="subtitle"
                rows={3}
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Deskripsi singkat yang menjelaskan informasi atau ajakan..."
                className="w-full bg-neutral-bg rounded-xl border border-neutral-gray p-3 text-xs text-dark focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teks Tombol CTA (Opsional)"
                name="cta_text"
                value={formData.cta_text}
                onChange={handleInputChange}
                placeholder="Contoh: Ajukan Surat Sekarang"
              />
              <Input
                label="Tautan URL Tombol CTA (Opsional)"
                name="cta_link"
                value={formData.cta_link}
                onChange={handleInputChange}
                placeholder="Contoh: /layanan/surat"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Urutan Tampilan (Nomor Urut)"
                name="order_num"
                type="number"
                value={formData.order_num}
                onChange={handleInputChange}
                placeholder="1"
              />

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 p-3 bg-neutral-bg rounded-xl border border-neutral-gray cursor-pointer hover:bg-neutral-bg/80 transition-colors">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-dark">Status Aktif</span>
                    <span className="text-[10px] text-gray-400">Tampilkan banner ini di carousel beranda publik</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex items-center justify-end gap-3 pb-12">
          <Link
            href="/admin/banner"
            className="px-6 py-3 rounded-xl border border-neutral-gray text-xs font-bold text-gray-500 hover:bg-neutral-bg transition-colors"
          >
            Batal
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md hover:shadow-primary/30 transition-all flex items-center gap-2"
          >
            {loading ? 'Menyimpan...' : 'Simpan Banner'}
          </Button>
        </div>
      </form>
    </div>
  );
}
