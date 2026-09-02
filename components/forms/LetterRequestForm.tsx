'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  HelpCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  User,
  Phone,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { submitLetterRequestAction } from '@/app/actions/letter.actions';

const letterRequestSchema = z.object({
  applicant_name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nik: z.string().length(16, 'NIK harus tepat 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  kk_number: z.string().length(16, 'No. KK harus tepat 16 digit').regex(/^\d+$/, 'No. KK harus berupa angka'),
  birth_place: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
  birth_date: z.string().nonempty('Tanggal lahir harus diisi'),
  address: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  phone: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').regex(/^\+?[0-9]+$/, 'Nomor WhatsApp tidak valid'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  purpose: z.string().min(5, 'Keperluan minimal 5 karakter'),
});

type FormData = z.infer<typeof letterRequestSchema>;

interface FormProps {
  letterType: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function LetterRequestForm({ letterType }: FormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    request_number: string;
    applicant_name: string;
    status: string;
    submitted_at: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(letterRequestSchema),
    defaultValues: {
      applicant_name: '',
      nik: '',
      kk_number: '',
      birth_place: '',
      birth_date: '',
      address: '',
      phone: '+62 ',
      email: '',
      purpose: '',
    },
  });

  const onNextToReview = async () => {
    // Validasi semua field sebelum lanjut ke review step
    const isValid = await trigger();
    if (isValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmitForm = async () => {
    setLoading(true);
    setGeneralError(null);
    
    const payload = {
      ...getValues(),
      letter_type_id: letterType.id,
    };

    try {
      const response = await submitLetterRequestAction(payload);
      if (response.success && response.request) {
        setSuccessData(response.request);
        setStep(3);
      } else {
        setGeneralError(response.error || 'Terjadi kesalahan saat memproses pengajuan Anda.');
      }
    } catch (err) {
      setGeneralError('Gagal mengirimkan data ke server. Mohon periksa koneksi Anda.');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Alur Langkah Visual (Indicator Steps) */}
      <div className="flex items-center justify-center max-w-lg mx-auto w-full mb-4">
        {[
          { label: 'Isi Formulir', stepNum: 1 },
          { label: 'Review Data', stepNum: 2 },
          { label: 'Selesai', stepNum: 3 }
        ].map((item, idx, arr) => (
          <div key={item.stepNum} className="flex items-center flex-grow last:flex-grow-0">
            <div className="flex flex-col items-center gap-1.5">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === item.stepNum
                    ? 'bg-primary text-white shadow-md'
                    : step > item.stepNum
                    ? 'bg-success-rt text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > item.stepNum ? '✓' : item.stepNum}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step === item.stepNum ? 'text-primary' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div className={`h-0.5 flex-grow mx-4 -mt-5 ${
                step > item.stepNum ? 'bg-success-rt' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Tampilan Error Umum */}
      {generalError && (
        <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-4 rounded-2xl flex items-center gap-2 max-w-lg mx-auto w-full">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* ================= STEP 1: FORMULIR INPUT ================= */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Utama */}
          <form className="lg:col-span-2 bg-white rounded-3xl border border-neutral-gray p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <div className="border-b border-neutral-gray pb-4 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider">
                Data Diri Pemohon
              </h2>
            </div>

            <Input 
              label="Nama Lengkap (Sesuai KTP)"
              placeholder="Masukkan nama lengkap"
              error={errors.applicant_name?.message}
              {...register('applicant_name')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Nomor Induk Kependudukan (NIK)"
                placeholder="16 Digit NIK"
                maxLength={16}
                error={errors.nik?.message}
                {...register('nik')}
              />
              <Input 
                label="Nomor Kartu Keluarga (KK)"
                placeholder="16 Digit Nomor KK"
                maxLength={16}
                error={errors.kk_number?.message}
                {...register('kk_number')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Tempat Lahir"
                placeholder="Kota / Kabupaten Lahir"
                error={errors.birth_place?.message}
                {...register('birth_place')}
              />
              <Input 
                label="Tanggal Lahir"
                type="date"
                error={errors.birth_date?.message}
                {...register('birth_date')}
              />
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Alamat Lengkap (Domisili Saat Ini)
              </label>
              <textarea
                placeholder="Nama Jalan, Blok, Nomor Rumah"
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium text-dark transition-all duration-200 outline-none placeholder:text-gray-400 min-h-[90px] ${
                  errors.address 
                    ? 'border-error-rt focus:border-error-rt' 
                    : 'border-neutral-gray focus:border-primary'
                }`}
                {...register('address')}
              />
              {errors.address && (
                <span className="text-xs text-error-rt font-semibold">{errors.address.message}</span>
              )}
            </div>

            <div className="border-b border-neutral-gray pb-4 mb-2 mt-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider">
                Detail Keperluan & Kontak
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Nomor WhatsApp"
                placeholder="+62 atau 08"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input 
                label="Alamat Email (Opsional)"
                placeholder="nama@email.com"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tujuan / Keperluan Pembuatan Surat
              </label>
              <textarea
                placeholder="Misal: Persyaratan melamar pekerjaan, Pembuatan rekening bank, Pendaftaran sekolah, dll."
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium text-dark transition-all duration-200 outline-none placeholder:text-gray-400 min-h-[90px] ${
                  errors.purpose 
                    ? 'border-error-rt focus:border-error-rt' 
                    : 'border-neutral-gray focus:border-primary'
                }`}
                {...register('purpose')}
              />
              {errors.purpose && (
                <span className="text-xs text-error-rt font-semibold">{errors.purpose.message}</span>
              )}
            </div>

            <div className="border-t border-neutral-gray pt-6 mt-4 flex items-center justify-between gap-4">
              <Link
                href="/layanan/surat"
                className="bg-transparent border border-neutral-gray hover:bg-neutral-bg text-gray-600 text-sm font-bold px-5 py-3 rounded-xl transition-all"
              >
                Kembali
              </Link>
              <Button
                type="button"
                onClick={onNextToReview}
                className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-1"
              >
                Lanjutkan Ke Review <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Sisi Kanan: Petunjuk & Ketentuan */}
          <div className="flex flex-col gap-6 text-left">
            <div className="bg-white rounded-3xl border border-neutral-gray p-6 shadow-sm">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" /> Syarat Ketentuan
              </h3>
              <ul className="flex flex-col gap-3 text-xs text-gray-500 leading-relaxed font-semibold">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Pastikan seluruh NIK dan No. KK sesuai dengan KTP dan Kartu Keluarga fisik asli Anda.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Pengajuan diproses dalam waktu estimasi maksimal 1x24 jam oleh pengurus RT.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Dokumen digital hasil persetujuan bermeterai digital TTE Ketua RT bisa diunduh via web.</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex gap-3 text-left">
              <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-amber-800">Estimasi Pemrosesan</span>
                <span className="text-gray-500 font-semibold leading-relaxed">
                  Setelah dikirim, Pengurus RT 05 RW 19 akan memproses surat dalam estimasi <span className="font-extrabold text-amber-800">1x24 Jam</span>. Notifikasi pelacakan bisa dipantau secara mandiri.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: REVIEW DATA ================= */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl border border-neutral-gray p-6 md:p-10 shadow-sm text-left flex flex-col gap-6">
          <div className="border-b border-neutral-gray pb-4 mb-2 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider">
              Tinjau Ulang Data Pengajuan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold">
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Jenis Surat</span>
              <span className="text-dark font-extrabold">{letterType.name}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Nama Pemohon</span>
              <span className="text-dark font-extrabold">{getValues('applicant_name')}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">NIK</span>
              <span className="text-dark font-extrabold">{getValues('nik')}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Nomor Kartu Keluarga</span>
              <span className="text-dark font-extrabold">{getValues('kk_number')}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Tempat / Tgl Lahir</span>
              <span className="text-dark font-extrabold">
                {getValues('birth_place')}, {new Date(getValues('birth_date')).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Nomor WhatsApp</span>
              <span className="text-dark font-extrabold">{getValues('phone')}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2 sm:col-span-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Alamat Domisili</span>
              <span className="text-dark leading-relaxed font-bold">{getValues('address')}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-neutral-gray/40 pb-2 sm:col-span-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Tujuan Pembuatan</span>
              <span className="text-dark leading-relaxed font-bold">{getValues('purpose')}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold p-4 rounded-xl flex gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>Mohon pastikan seluruh data kependudukan di atas sudah sesuai KTP Anda. Setelah dikirim, data tidak dapat diubah kecuali pengurus RT meminta revisi.</span>
          </div>

          <div className="border-t border-neutral-gray pt-6 mt-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setStep(1)}
              className="bg-transparent border border-neutral-gray hover:bg-neutral-bg text-gray-600 text-sm font-bold px-5 py-3 rounded-xl transition-all"
            >
              Ubah Data
            </button>
            <Button
              onClick={onSubmitForm}
              loading={loading}
              className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-3 rounded-xl transition-all"
            >
              Kirim Pengajuan
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: SUKSES SUBMIT ================= */}
      {step === 3 && successData && (
        <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-neutral-gray p-8 shadow-sm flex flex-col items-center text-center gap-6">
          <div className="w-14 h-14 bg-green-50 border border-green-200 text-success-rt rounded-full flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-extrabold text-dark leading-tight">Pengajuan Berhasil Dikirim</h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Pengajuan surat Anda telah terdaftar dalam sistem RT 05 RW 19 Sangkal Putung.
            </p>
          </div>

          {/* Info Nomor Pengajuan */}
          <div className="w-full bg-neutral-bg rounded-2xl p-5 border border-neutral-gray flex flex-col gap-3.5 text-left font-semibold text-xs text-gray-500">
            <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Nomor Pengajuan</span>
              <span className="text-primary font-extrabold">{successData.request_number}</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Pemohon</span>
              <span className="text-dark font-extrabold">{successData.applicant_name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Jenis Surat</span>
              <span className="text-dark font-extrabold">{letterType.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Status Awal</span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Menunggu
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full mt-2">
            <Link
              href="/pengajuan"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              Lacak Pengajuan <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="bg-transparent hover:bg-neutral-bg text-gray-600 text-xs font-bold py-3 rounded-xl border border-neutral-gray"
            >
              Kembali ke Beranda
            </Link>
          </div>

          <div className="text-[10px] text-gray-400 font-bold border-t border-neutral-gray pt-4 w-full">
            *Simpan Nomor Pengajuan di atas untuk melacak status persetujuan dokumen Anda.
          </div>
        </div>
      )}
    </div>
  );
}
