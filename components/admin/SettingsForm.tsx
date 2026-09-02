'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Upload, 
  Check, 
  AlertTriangle,
  FileText,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { saveSettingsAction } from '@/app/actions/admin.actions';

interface SettingsFormProps {
  initialSettings: {
    id: number;
    website_name: string;
    tagline: string;
    address: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    social_media?: any;
    logo_url?: string;
    favicon_url?: string;
    rt_info?: string;
    letter_format?: string;
    signature_url?: string;
    stamp_url?: string;
  };
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({ ...initialSettings });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buffer base64 untuk unggah berkas
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings.logo_url || null);

  const [stampBase64, setStampBase64] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(initialSettings.stamp_url || null);

  const [sigBase64, setSigBase64] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(initialSettings.signature_url || null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp' | 'sig') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran berkas gambar maksimal adalah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'logo') {
        setLogoBase64(base64);
        setLogoPreview(base64);
      } else if (type === 'stamp') {
        setStampBase64(base64);
        setStampPreview(base64);
      } else if (type === 'sig') {
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
      const response = await saveSettingsAction(
        formData,
        logoBase64 || undefined,
        stampBase64 || undefined,
        sigBase64 || undefined
      );

      if (response.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Gagal memperbarui pengaturan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat memperbarui pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 text-left max-w-4xl">
      {success && (
        <div className="bg-green-50 border border-green-200 text-success-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>Pengaturan umum website berhasil diperbarui!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom Kiri: Pengaturan Umum */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <div className="border-b border-neutral-gray pb-4 mb-2 flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-primary" />
            <h2 className="text-xs font-extrabold text-dark uppercase tracking-wider">Identitas Wilayah RT</h2>
          </div>

          <Input 
            label="Nama Website / Identitas RT"
            name="website_name"
            value={formData.website_name}
            onChange={handleInputChange}
            required
          />

          <Input 
            label="Slogan / Tagline RT"
            name="tagline"
            value={formData.tagline}
            onChange={handleInputChange}
            required
          />

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alamat Kantor / Sekretariat RT</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-neutral-gray focus:border-primary rounded-xl text-sm font-medium text-dark outline-none min-h-[80px]"
            />
          </div>

          <div className="border-b border-neutral-gray pb-4 mb-2 mt-4 flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-primary" />
            <h2 className="text-xs font-extrabold text-dark uppercase tracking-wider">Kontak Pelayanan & Format Surat</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input 
              label="Nomor WhatsApp"
              name="whatsapp"
              value={formData.whatsapp || ''}
              onChange={handleInputChange}
              placeholder="Contoh: 62812..."
            />
            <Input 
              label="Nomor Telepon"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
            />
            <Input 
              label="Email Resmi RT"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              type="email"
            />
          </div>

          <Input 
            label="Format Penomoran Surat Resmi RT"
            name="letter_format"
            value={formData.letter_format || ''}
            onChange={handleInputChange}
            helperText="Variabel: {{number}} (Nomor urut), {{month}} (Bulan romawi), {{year}} (Tahun)"
            required
          />

          <div className="border-t border-neutral-gray pt-6 mt-4">
            <Button type="submit" loading={loading} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md">
              Simpan Pengaturan
            </Button>
          </div>
        </div>

        {/* Kolom Kanan: Branding & E-Signature / Stamp Uploads */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm text-left flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-primary" /> Logo Wilayah
            </span>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-20 h-20 bg-neutral-bg border border-neutral-gray rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-gray-300">RT05</span>
                )}
              </div>
              <label className="bg-neutral-bg hover:bg-neutral-gray border border-neutral-gray text-dark text-[10px] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5" /> Unggah Logo
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e, 'logo')} />
              </label>
            </div>
          </div>

          {/* E-Signature Upload */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm text-left flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-4 h-4 text-primary" /> Tanda Tangan Ketua RT
            </span>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full h-24 bg-neutral-bg border border-neutral-gray rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                {sigPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sigPreview} alt="Tanda Tangan" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-gray-300">Belum diunggah</span>
                )}
              </div>
              <label className="bg-neutral-bg hover:bg-neutral-gray border border-neutral-gray text-dark text-[10px] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5" /> Unggah TTD
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e, 'sig')} />
              </label>
            </div>
          </div>

          {/* Stempel / Stamp Upload */}
          <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm text-left flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Building className="w-4 h-4 text-primary" /> Cap / Stempel RT
            </span>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 bg-neutral-bg border border-neutral-gray rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                {stampPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stampPreview} alt="Stempel RT" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-gray-300">Stempel RT</span>
                )}
              </div>
              <label className="bg-neutral-bg hover:bg-neutral-gray border border-neutral-gray text-dark text-[10px] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5" /> Unggah Stempel
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e, 'stamp')} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
