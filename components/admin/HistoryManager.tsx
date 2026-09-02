'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, X, Calendar, BookOpen, Check, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveHistoryAction, removeHistoryAction } from '@/app/actions/admin.actions';

interface HistoryItem {
  id: string;
  year: string;
  title: string;
  description: string;
  image_url?: string;
}

interface HistoryManagerProps {
  initialHistory: HistoryItem[];
}

export default function HistoryManager({ initialHistory }: HistoryManagerProps) {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(initialHistory);
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // photo upload buffer
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Ukuran foto sejarah maksimal adalah 3MB.');
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
    if (!formData.year.trim() || !formData.title.trim() || !formData.description.trim()) {
      setError('Tahun, judul peristiwa, dan deskripsi wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await saveHistoryAction(null, formData, photoBase64 || undefined);
      if (response.success && response.history) {
        setSuccess('Peristiwa sejarah baru berhasil ditambahkan!');
        setFormData({ year: '', title: '', description: '' });
        setPhotoBase64(null);
        setPhotoPreview(null);
        router.refresh();
        // Update local state sorted by year desc
        setHistoryItems((prev) => 
          [...prev, response.history].sort((a, b) => b.year.localeCompare(a.year))
        );
        setTimeout(() => setSuccess(null), 2500);
      } else {
        setError('Gagal menambahkan sejarah.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus peristiwa "${title}"?`)) {
      return;
    }

    setDeleteLoadingId(id);
    setError(null);
    setSuccess(null);

    try {
      const response = await removeHistoryAction(id);
      if (response.success) {
        setSuccess('Peristiwa berhasil dihapus.');
        setHistoryItems((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError('Gagal menghapus peristiwa.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menghapus.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-semibold text-xs text-gray-500">
      
      {/* Kolom Kiri: Form Add History (1/3) */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5">
          <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 flex items-center gap-1.5">
            <Plus className="w-4.5 h-4.5 text-primary" /> Tambah Lini Masa Sejarah
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

          {/* Upload Foto */}
          <div className="flex flex-col gap-1.5 items-center">
            {photoPreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-neutral-gray">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 bg-dark/80 text-white p-1 rounded-full hover:bg-dark transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-gray rounded-xl p-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-bg/30 w-full">
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                <div className="w-7 h-7 rounded-full bg-red-50 text-primary flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-dark">Pilih Foto Dokumentasi</span>
                <span className="text-[8px] text-gray-400 font-semibold">Maksimal 3MB (JPG, PNG)</span>
              </label>
            )}
          </div>

          <Input 
            label="Tahun Kejadian"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            placeholder="Contoh: 1998 atau 2012"
            required
          />

          <Input 
            label="Judul Peristiwa Sejarah"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Contoh: Peresmian Gapura Utama"
            required
          />

          <div className="flex flex-col gap-1.5 font-semibold text-xs text-gray-500">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Deskripsi Kejadian</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Ceritakan detail perkembangan pembangunan wilayah..."
              className="w-full px-3 py-2 bg-white border border-neutral-gray focus:border-primary rounded-xl text-xs font-medium text-dark outline-none min-h-[90px]"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md">
              Simpan Sejarah
            </Button>
          </div>
        </form>
      </div>

      {/* Kolom Kanan: Grid List Events (2/3) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5 min-h-[400px]">
          <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5 text-primary" /> Lini Masa Sejarah Wilayah ({historyItems.length})
          </h2>

          {historyItems && historyItems.length > 0 ? (
            <div className="relative border-l-2 border-neutral-gray pl-6 ml-4 space-y-6 text-left">
              {historyItems.map((item) => (
                <div key={item.id} className="relative bg-neutral-bg border border-neutral-gray rounded-2xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
                  {/* Circle Pin */}
                  <div className="absolute -left-[32px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-white shadow" />
                  
                  {/* Photo if exists */}
                  {item.image_url && (
                    <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-gray-200 border border-neutral-gray shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-primary flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Tahun {item.year}
                    </span>
                    <span className="text-[11px] font-extrabold text-dark truncate leading-tight">{item.title}</span>
                    <p className="text-[10px] text-gray-500 font-semibold leading-relaxed line-clamp-3">{item.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="sm:self-center shrink-0">
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deleteLoadingId === item.id}
                      className="bg-red-50 hover:bg-error-rt text-error-rt hover:text-white border border-red-100 hover:border-transparent p-2 rounded-xl transition-all cursor-pointer shadow-sm"
                      title="Hapus peristiwa"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Belum ada peristiwa sejarah yang dicatat.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
