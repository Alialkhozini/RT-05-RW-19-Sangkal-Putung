'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertTriangle, Upload, Eye, Users } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { saveSambutanAction } from '@/app/actions/admin.actions';

interface SambutanFormProps {
  initialData: {
    id: number;
    welcome_title: string;
    welcome_message: string;
    chairman_name: string;
    chairman_position: string;
    chairman_photo_url?: string;
    signature_url?: string;
  };
}

export default function SambutanForm({ initialData }: SambutanFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({ ...initialData });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // base64 file upload buffers
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData.chairman_photo_url || null);

  const [sigBase64, setSigBase64] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(initialData.signature_url || null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'sig') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran berkas gambar maksimal adalah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'photo') {
        setPhotoBase64(base64);
        setPhotoPreview(base64);
      } else {
        setSigBase64(base64);
        setSigPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await saveSambutanAction(
        formData,
        photoBase64 || undefined,
        sigBase64 || undefined
      );

      if (response.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 2500);
      } else {
        setError('Gagal menyimpan profil sambutan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 text-left max-w-4xl font-semibold text-xs text-gray-500">
      {success && (
        <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>Profil sambutan ketua RT berhasil diperbarui!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Judul & Pesan Sambutan */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <div className="border-b border-neutral-gray pb-4 mb-2 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-primary" />
            <h2 className="text-xs font-extrabold text-dark uppercase tracking-wider">Konten Sambutan Ketua RT</h2>
          </div>

          <Input 
            label="Judul Pesan / Sambutan"
            name="welcome_title"
            value={formData.welcome_title}
            onChange={handleInputChange}
            placeholder="Contoh: Sambutan Hangat Ketua RT"
            required
          />

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Isi Lengkap Sambutan RT</label>
            <textarea
              name="welcome_message"
              value={formData.welcome_message}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-neutral-gray focus:border-primary rounded-xl text-sm font-medium text-dark outline-none min-h-[220px]"
            />
          </div>

          <div className="border-t border-neutral-gray pt-6 mt-4">
            <Button type="submit" loading={loading} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md">
              Simpan Sambutan
            </Button>
          </div>
        </div>

        {/* Kolom Kanan: Identitas & Media */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Identitas RT */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-neutral-gray pb-2 mb-1">
              Identitas Ketua RT
            </span>
            <Input 
              label="Nama Lengkap Ketua RT"
              name="chairman_name"
              value={formData.chairman_name}
              onChange={handleInputChange}
              required
            />
            <Input 
              label="Jabatan"
              name="chairman_position"
              value={formData.chairman_position}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Upload Foto Formal */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col items-center gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-neutral-gray pb-2 mb-1 w-full text-left">
              Foto Formal Ketua RT
            </span>
            <div className="relative w-28 h-36 bg-neutral-bg border border-neutral-gray rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-gray-300">Foto RT</span>
              )}
            </div>
            <label className="bg-neutral-bg hover:bg-neutral-gray border border-neutral-gray text-dark text-[10px] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5" /> Ganti Foto
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e, 'photo')} />
            </label>
          </div>

          {/* TTE Signature */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col items-center gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-neutral-gray pb-2 mb-1 w-full text-left">
              Tanda Tangan Digital
            </span>
            <div className="relative w-full h-20 bg-neutral-bg border border-neutral-gray rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              {sigPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sigPreview} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-gray-300">Belum diunggah</span>
              )}
            </div>
            <label className="bg-neutral-bg hover:bg-neutral-gray border border-neutral-gray text-dark text-[10px] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5" /> Ganti TTD
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e, 'sig')} />
            </label>
          </div>
        </div>

      </div>
    </form>
  );
}
