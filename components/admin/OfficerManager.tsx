'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, X, Shield, ArrowUpDown, Check, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveOfficerAction, removeOfficerAction } from '@/app/actions/admin.actions';

interface OfficerItem {
  id: string;
  name: string;
  position: string;
  photo_url?: string;
  order_num: number;
}

interface OfficerManagerProps {
  initialOfficers: OfficerItem[];
}

export default function OfficerManager({ initialOfficers }: OfficerManagerProps) {
  const router = useRouter();
  const [officers, setOfficers] = useState<OfficerItem[]>(initialOfficers);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    order_num: 10,
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // photo upload buffer
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order_num' ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto pengurus maksimal adalah 2MB.');
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
    if (!formData.name.trim() || !formData.position.trim()) {
      setError('Nama dan jabatan wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await saveOfficerAction(null, formData, photoBase64 || undefined) as any;
      if (response.success && response.officer) {
        setSuccess('Pengurus baru berhasil ditambahkan!');
        setFormData({ name: '', position: '', order_num: 10 });
        setPhotoBase64(null);
        setPhotoPreview(null);
        router.refresh();
        // Update local state sorted by order_num
        setOfficers((prev) => 
          [...prev, response.officer].sort((a, b) => a.order_num - b.order_num)
        );
        setTimeout(() => setSuccess(null), 2500);
      } else {
        setError('Gagal menambahkan pengurus.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}" dari susunan pengurus?`)) {
      return;
    }

    setDeleteLoadingId(id);
    setError(null);
    setSuccess(null);

    try {
      const response = await removeOfficerAction(id);
      if (response.success) {
        setSuccess('Pengurus berhasil dihapus.');
        setOfficers((prev) => prev.filter((o) => o.id !== id));
        router.refresh();
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError('Gagal menghapus pengurus.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menghapus.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-semibold text-xs text-gray-500">
      
      {/* Kolom Kiri: Form Add Officer (1/3) */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5">
          <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 flex items-center gap-1.5">
            <Plus className="w-4.5 h-4.5 text-primary" /> Tambah Pengurus RT
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
              <div className="relative w-24 h-28 rounded-xl overflow-hidden border border-neutral-gray">
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
              <label className="border-2 border-dashed border-neutral-gray rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-bg/30 w-full">
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                <div className="w-7 h-7 rounded-full bg-red-50 text-primary flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-dark">Pilih Foto Profil</span>
                <span className="text-[8px] text-gray-400 font-semibold">Maksimal 2MB (JPG, PNG)</span>
              </label>
            )}
          </div>

          <Input 
            label="Nama Lengkap Pengurus"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Contoh: Budi Santoso"
            required
          />

          <Input 
            label="Jabatan / Posisi"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Contoh: Sekretaris / Bendahara"
            required
          />

          <Input 
            label="Nomor Urut Hierarki Struktur"
            name="order_num"
            type="number"
            value={formData.order_num}
            onChange={handleInputChange}
            helperText="Nilai kecil tampil lebih atas (Kop: Ketua=1, Sekr=2, Bend=3)"
            required
          />

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md">
              Simpan Pengurus
            </Button>
          </div>
        </form>
      </div>

      {/* Kolom Kanan: Grid List Officers (2/3) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-5 min-h-[400px]">
          <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider border-b border-neutral-gray pb-3 flex items-center gap-1.5">
            <Shield className="w-4.5 h-4.5 text-primary" /> Susunan Pengurus Wilayah ({officers.length})
          </h2>

          {officers && officers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {officers.map((o) => (
                <div key={o.id} className="relative group bg-neutral-bg border border-neutral-gray rounded-2xl overflow-hidden shadow-sm flex flex-col items-center p-4">
                  {/* Photo */}
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-200 border border-neutral-gray mb-3 flex items-center justify-center shrink-0">
                    {o.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.photo_url} alt={o.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <div className="text-center flex flex-col gap-0.5 min-w-0 w-full mb-3">
                    <span className="text-[10px] font-extrabold text-dark truncate leading-tight">{o.name}</span>
                    <span className="text-[9px] text-primary font-bold">{o.position}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center justify-center gap-0.5">
                      <ArrowUpDown className="w-2.5 h-2.5" /> Urutan: {o.order_num}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(o.id, o.name)}
                    disabled={deleteLoadingId === o.id}
                    className="w-full bg-red-50 hover:bg-error-rt text-error-rt hover:text-white border border-red-100 hover:border-transparent py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> {deleteLoadingId === o.id ? '...' : 'Hapus'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center py-20 text-gray-400">
              <Shield className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Belum ada pengurus RT terdaftar.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
