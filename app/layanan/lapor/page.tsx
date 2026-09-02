'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  ChevronRight, 
  AlertTriangle, 
  MessageSquare, 
  Phone, 
  Camera, 
  X, 
  CheckCircle,
  Clock,
  History,
  LifeBuoy
} from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitReportAction } from '@/app/actions/report.actions';

export default function LaporRtPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '+62 ',
    category: 'Keamanan' as any,
    title: '',
    description: '',
    location: '',
    priority: 'medium' as any,
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [successReport, setSuccessReport] = useState<{
    report_number: string;
    title: string;
    status: string;
    created_at: string;
  } | null>(null);

  const categories = [
    'Keamanan',
    'Kebersihan',
    'Fasilitas Umum',
    'Lingkungan',
    'Sosial',
    'Administrasi',
    'Lainnya',
  ];

  const priorities = [
    { value: 'low', label: 'Rendah', color: 'border-blue-100 hover:border-blue-400 checked:bg-blue-600', text: 'text-blue-700 bg-blue-50' },
    { value: 'medium', label: 'Sedang', color: 'border-amber-100 hover:border-amber-400 checked:bg-amber-600', text: 'text-amber-700 bg-amber-50' },
    { value: 'high', label: 'Tinggi', color: 'border-red-100 hover:border-red-400 checked:bg-red-600', text: 'text-error-rt bg-red-50' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Tipe foto harus berupa JPG atau PNG.');
      return;
    }

    // Validasi ukuran (maksimal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal adalah 5MB.');
      return;
    }

    setError(null);
    setPhoto(file);

    // Buat pratinjau gambar dan base64 string
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoBase64(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await submitReportAction(formData, photoBase64 || undefined);
      if (response.success && response.report) {
        setSuccessReport(response.report);
      } else {
        setError(response.error || 'Gagal mengirimkan laporan aduan.');
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan sistem. Mohon coba sesaat lagi.');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow pt-28 pb-20 bg-neutral-bg">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 bg-white py-3 px-5 rounded-2xl border border-neutral-gray/60 shadow-sm w-fit">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Layanan</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Lapor RT</span>
          </nav>

          {successReport ? (
            /* Tampilan Sukses Pengiriman */
            <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-neutral-gray p-8 shadow-sm flex flex-col items-center text-center gap-6 animate-in zoom-in duration-300">
              <div className="w-14 h-14 bg-green-50 border border-green-200 text-success-rt rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-extrabold text-dark leading-tight">Laporan Berhasil Terkirim</h2>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Laporan aduan Anda telah diterima sistem dan siap ditindaklanjuti oleh pengurus RT.
                </p>
              </div>

              <div className="w-full bg-neutral-bg rounded-2xl p-5 border border-neutral-gray flex flex-col gap-3.5 text-left font-semibold text-xs text-gray-500">
                <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Nomor Tiket Laporan</span>
                  <span className="text-primary font-extrabold">{successReport.report_number}</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Judul Aduan</span>
                  <span className="text-dark font-extrabold truncate max-w-[150px]">{successReport.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Status Pengaduan</span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    Terkirim
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full mt-2">
                <Link
                  href="/laporan"
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  Lacak Aduan Warga <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="bg-transparent hover:bg-neutral-bg text-gray-600 text-xs font-bold py-3 rounded-xl border border-neutral-gray"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : (
            /* Formulir Lapor RT */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              {/* Form Laporan */}
              <form onSubmit={handleFormSubmit} className="lg:col-span-2 bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                <div className="border-b border-neutral-gray pb-4 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider">
                    Formulir Laporan / Aduan RT
                  </h2>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-4 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Nama Pelapor"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={fieldErrors.name?.[0]}
                    placeholder="Masukkan nama Anda"
                  />
                  <Input 
                    label="Nomor WhatsApp"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={fieldErrors.phone?.[0]}
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Kategori Laporan
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-neutral-gray rounded-xl text-sm font-medium text-dark transition-all duration-200 outline-none focus:border-primary"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <Input 
                    label="Lokasi Kejadian (Opsional)"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    error={fieldErrors.location?.[0]}
                    placeholder="Nama jalan / nomor blok rumah"
                  />
                </div>

                <Input 
                  label="Judul Laporan"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={fieldErrors.title?.[0]}
                  placeholder="Inti laporan (Contoh: Lampir Jalan Mati)"
                />

                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Deskripsi Lengkap Kejadian
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ceritakan detail kejadian, kondisi, waktu, atau saran pengaduan Anda..."
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium text-dark transition-all duration-200 outline-none min-h-[120px] ${
                      fieldErrors.description?.[0] ? 'border-error-rt' : 'border-neutral-gray focus:border-primary'
                    }`}
                  />
                  {fieldErrors.description?.[0] && (
                    <span className="text-xs text-error-rt font-semibold">{fieldErrors.description[0]}</span>
                  )}
                </div>

                {/* Prioritas Laporan */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tingkat Prioritas Laporan
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {priorities.map((p) => (
                      <label
                        key={p.value}
                        className={`border rounded-xl p-3 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition-all ${
                          formData.priority === p.value
                            ? 'border-primary ring-1 ring-primary/10 font-bold bg-primary/5 text-primary'
                            : 'border-neutral-gray text-gray-500 bg-white hover:bg-neutral-bg'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p.value}
                          checked={formData.priority === p.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Unggah Gambar Pendukung */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Unggah Foto Bukti Kejadian (Opsional)
                  </span>

                  {photoPreview ? (
                    <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-neutral-gray">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Pratinjau Foto Aduan" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-4 right-4 bg-dark/80 text-white p-1.5 rounded-full hover:bg-dark transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-neutral-gray rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-bg/40 transition-colors">
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                      <div className="w-10 h-10 rounded-full bg-red-50 text-primary flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-dark mt-1">Klik untuk mengunggah</span>
                      <span className="text-[9px] text-gray-400 font-semibold">Maksimal file 5MB (JPG, PNG)</span>
                    </label>
                  )}
                </div>

                <div className="border-t border-neutral-gray pt-6 mt-2 flex items-center justify-between">
                  <Link
                    href="/"
                    className="bg-transparent border border-neutral-gray hover:bg-neutral-bg text-gray-600 text-xs font-bold px-5 py-3 rounded-xl transition-all"
                  >
                    Kembali
                  </Link>
                  <Button
                    type="submit"
                    loading={loading}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md"
                  >
                    Kirim Laporan
                  </Button>
                </div>
              </form>

              {/* Sisi Kanan: Hubungi & Cek Laporan */}
              <div className="flex flex-col gap-6">
                {/* Lacak Laporan Card */}
                <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-primary" /> Lacak Pengaduan Anda
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Sudah mengirimkan laporan aduan sebelumnya? Periksa perkembangan tindak lanjut pengaduan Anda di halaman pelacakan laporan.
                  </p>
                  <Link
                    href="/laporan"
                    className="bg-neutral-bg hover:bg-neutral-gray text-dark border border-neutral-gray/80 text-xs font-bold w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    Lacak Status Laporan &rarr;
                  </Link>
                </div>

                {/* Kontak Darurat */}
                <div className="bg-gradient-to-br from-primary to-red-800 text-white rounded-3xl p-6 shadow-md flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-red-100">
                    <LifeBuoy className="w-4 h-4 text-red-100" /> Darurat / Urgent?
                  </h3>
                  <p className="text-xs text-red-100 leading-relaxed font-medium">
                    Untuk kejadian berbahaya yang mendesak dan butuh penanganan segera (seperti kebakaran, kemalingan, pertikaian), langsung hubungi kontak darurat Ketua RT.
                  </p>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-neutral-bg text-primary text-xs font-bold w-full py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Phone className="w-4 h-4" /> Hubungi Ketua RT via WA
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
