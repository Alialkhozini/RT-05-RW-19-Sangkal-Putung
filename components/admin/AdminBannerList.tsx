'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  Sliders,
  ArrowUpRight
} from 'lucide-react';
import { HeroBanner } from '@/services/banner.service';
import { deleteBannerAction, toggleBannerStatusAction } from '@/app/actions/admin.actions';

interface AdminBannerListProps {
  initialBanners: HeroBanner[];
}

export default function AdminBannerList({ initialBanners }: AdminBannerListProps) {
  const [banners, setBanners] = useState<HeroBanner[]>(initialBanners);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Toggle status aktif/non-aktif banner
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    setError(null);
    setSuccess(null);

    try {
      await toggleBannerStatusAction(id, !currentStatus);
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_active: !currentStatus } : b))
      );
      setSuccess(`Status banner berhasil diubah menjadi ${!currentStatus ? 'Aktif' : 'Non-aktif'}.`);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status banner.');
    } finally {
      setLoadingId(null);
    }
  };

  // Hapus banner
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus banner "${title}"?`)) return;

    setLoadingId(id);
    setError(null);
    setSuccess(null);

    try {
      await deleteBannerAction(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setSuccess('Banner berhasil dihapus.');
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus banner.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-dark tracking-tight">
            Manajemen Banner Hero Carousel
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Kelola gambar latar beranda beresolusi 1920 x 1080 px, teks promosi, dan urutan carousel slider publik.
          </p>
        </div>
        <Link
          href="/admin/banner/tambah"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-sm hover:shadow-primary/20 transition-all duration-200 shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Banner Baru</span>
        </Link>
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
          <span>{success}</span>
        </div>
      )}

      {/* Grid Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${
              banner.is_active ? 'border-neutral-gray/80' : 'border-neutral-gray/50 opacity-75'
            }`}
          >
            {/* Pratinjau Banner 16:9 */}
            <div className="relative aspect-video bg-dark overflow-hidden group">
              <Image
                src={banner.image_url || '/hero-banner.jpg'}
                alt={banner.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent p-4 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  <span className="bg-dark/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-white/20">
                    Urutan #{banner.order_num}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      banner.is_active
                        ? 'bg-green-500/90 text-white'
                        : 'bg-gray-500/90 text-white'
                    }`}
                  >
                    {banner.is_active ? 'Aktif di Beranda' : 'Non-aktif'}
                  </span>
                </div>

                <div>
                  {banner.badge && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400">
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {banner.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Konten Keterangan */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                {banner.subtitle || 'Tidak ada deskripsi tambahan.'}
              </p>

              {/* Aksi Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-gray/60">
                {/* Tombol Toggle Status */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                  disabled={loadingId === banner.id}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    banner.is_active
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {banner.is_active ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Sembunyikan</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Aktifkan</span>
                    </>
                  )}
                </button>

                {/* Tombol Edit & Hapus */}
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/banner/${banner.id}/edit`}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-neutral-bg rounded-xl transition-colors"
                    title="Edit Banner"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id, banner.title)}
                    disabled={loadingId === banner.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Hapus Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-gray/80 shadow-xs flex flex-col items-center gap-3">
          <Sliders className="w-12 h-12 text-gray-300" />
          <h3 className="text-sm font-bold text-dark">Belum ada banner hero</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            Silakan tambahkan banner hero baru berukuran 1920 x 1080 px untuk ditampilkan di carousel beranda publik.
          </p>
          <Link
            href="/admin/banner/tambah"
            className="mt-2 inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Banner
          </Link>
        </div>
      )}
    </div>
  );
}
