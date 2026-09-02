'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Trash2, Tag, Calendar, AlertTriangle, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addGalleryAction, removeGalleryAction } from '@/app/actions/admin.actions';

interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  category?: string;
  created_at: string;
}

interface GalleryManagerProps {
  initialItems: GalleryItem[];
}

export default function GalleryManager({ initialItems }: GalleryManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Kegiatan',
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Unggah gambar base64
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const categories = ['Kegiatan', 'Rapat Warga', 'Kerja Bakti', 'Sosial', 'Pembangunan', 'Lainnya'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto galeri maksimal adalah 5MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoBase64) {
      setError('Harap pilih foto terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await addGalleryAction(formData, photoBase64);
      if (response.success && response.item) {
        setSuccess('Foto berhasil ditambahkan ke galeri warga!');
        setFormData({ title: '', description: '', category: 'Kegiatan' });
        setPhotoBase64(null);
        setPhotoPreview(null);
        router.refresh();
        // Update local state agar instan tampil
        setItems((prev) => [response.item, ...prev]);
        setTimeout(() => setSuccess(null), 2500);
      } else {
        setError('Gagal menambahkan foto.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat mengunggah foto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini dari galeri?')) {
      return;
    }

    setDeleteLoadingId(id);
    setError(null);
    setSuccess(null);

    try {
      const response = await removeGalleryAction(id);
      if (response.success) {
        setSuccess('Foto berhasil dihapus dari galeri.');
        setItems((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError('Gagal menghapus foto.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menghapus.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-semibold text-xs text-gray-500">
      
      {/* Kolom Kiri: Form Unggah Foto Baru (1/3 lebar) */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5">
          <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 flex items-center gap-1.5">
            <Upload className="w-4.5 h-4.5 text-primary" /> Unggah Galeri Foto
          </h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Area Input File */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Pilih File Foto</label>
            {photoPreview ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-neutral-gray">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-3 right-3 bg-dark/80 text-white p-1.5 rounded-full hover:bg-dark transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-gray rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-bg/30">
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" required />
                <div className="w-8 h-8 rounded-full bg-red-50 text-primary flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-dark mt-1">Pilih foto warga</span>
                <span className="text-[8px] text-gray-400 font-semibold">Maksimal 5MB (JPG, PNG)</span>
              </label>
            )}
          </div>

          <Input 
            label="Judul Foto (Opsional)"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Contoh: Gotong Royong Saluran Air"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Kategori Kegiatan</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-neutral-gray rounded-xl font-medium outline-none focus:border-primary text-dark text-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Keterangan / Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ceritakan singkat suasana dalam foto..."
              className="w-full px-3 py-2 bg-white border border-neutral-gray focus:border-primary rounded-xl text-xs font-medium text-dark outline-none min-h-[70px]"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md">
              Unggah ke Galeri
            </Button>
          </div>
        </form>
      </div>

      {/* Kolom Kanan: Grid Galeri Foto Terpasang (2/3 lebar) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5 min-h-[400px]">
          <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 flex items-center gap-1.5">
            <ImageIcon className="w-4.5 h-4.5 text-primary" /> Galeri Foto Terunggah ({items.length})
          </h2>

          {items && items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative group bg-neutral-bg border border-neutral-gray rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {/* Image wrapper */}
                  <div className="relative w-full h-32 overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                    
                    {/* Delete button overlay (styled beautifully) */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteLoadingId === item.id}
                      className="absolute top-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg shadow transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Category tag */}
                    {item.category && (
                      <span className="absolute bottom-2.5 left-2.5 bg-dark/70 text-white text-[8px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" /> {item.category}
                      </span>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="p-3 text-left flex flex-col gap-1">
                    <span className="text-[10px] font-extrabold text-dark truncate leading-tight">{item.title || 'Tanpa Judul'}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center py-20 text-gray-400">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Belum ada foto yang diunggah ke galeri.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
