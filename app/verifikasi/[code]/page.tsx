import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  ChevronRight, 
  Home, 
  FileText, 
  Calendar,
  Building,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { createServerClient } from '@/lib/supabase';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';

interface PageProps {
  params: Promise<{ code: string }>;
}

export const revalidate = 300; // Cache 5 menit (ISR)

export default async function VerifikasiDokumenPage(props: PageProps) {
  const params = await props.params;
  const code = params.code;

  const supabase = await createServerClient();

  // Query secara aman dari view public_verifications
  const { data, error } = await supabase
    .from('public_verifications')
    .select('*')
    .eq('verification_code', code.trim().toUpperCase())
    .maybeSingle();

  const isValid = !error && data !== null;

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow pt-28 pb-20 bg-neutral-bg">
        <div className="container mx-auto px-4 md:px-6 max-w-xl text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 mb-8 bg-white py-3 px-5 rounded-2xl border border-neutral-gray/60 shadow-sm w-fit mx-auto">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Verifikasi Dokumen</span>
          </nav>

          {isValid ? (
            /* ================= TAMPILAN DOKUMEN VALID ================= */
            <div className="bg-white rounded-3xl border border-neutral-gray p-8 md:p-10 shadow-lg flex flex-col items-center gap-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-50 border border-green-200 text-success-rt rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h1 className="text-xl font-extrabold text-success-rt leading-tight">✓ DOKUMEN TERVERIFIKASI</h1>
                <p className="text-[11px] text-gray-500 font-semibold leading-relaxed max-w-xs mx-auto">
                  Dokumen resmi digital ini sah diterbitkan oleh Pengurus RT 05 RW 19 Kelurahan Brebes.
                </p>
              </div>

              {/* Data Detail Dokumen Minimal */}
              <div className="w-full bg-neutral-bg rounded-2xl p-5 border border-neutral-gray flex flex-col gap-4 text-left font-semibold text-xs text-gray-500">
                <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Nomor Surat Resmi</span>
                  <span className="text-dark font-extrabold">{data.request_number}</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Jenis Dokumen</span>
                  <span className="text-dark font-extrabold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-primary" /> {data.letter_type}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Nama Pemohon (Warga)</span>
                  <span className="text-dark font-extrabold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-primary" /> {data.applicant_name}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-gray/50 pb-2.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Tanggal Terbit</span>
                  <span className="text-dark font-extrabold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> 
                    {new Date(data.generated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide shrink-0">Diterbitkan Oleh</span>
                  <span className="text-dark font-extrabold flex items-start gap-1 text-right leading-relaxed">
                    <Building className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>RT 05 RW 19 Sangkal Putung<br />Kelurahan Brebes</span>
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold p-4 rounded-xl leading-relaxed text-left flex gap-1.5 mt-2">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <span>Dokumen ini bermeterai digital TTE Ketua RT 05 RW 19. Integritas data terjamin dan dilindungi sistem verifikasi QR.</span>
              </div>
            </div>
          ) : (
            /* ================= TAMPILAN DOKUMEN TIDAK VALID ================= */
            <div className="bg-white rounded-3xl border border-neutral-gray p-8 md:p-10 shadow-lg flex flex-col items-center gap-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-red-50 border border-red-200 text-error-rt rounded-full flex items-center justify-center shadow-sm">
                <XCircle className="w-9 h-9" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h1 className="text-xl font-extrabold text-error-rt leading-tight">✕ DOKUMEN TIDAK DITEMUKAN</h1>
                <p className="text-[11px] text-gray-500 font-semibold leading-relaxed max-w-xs mx-auto">
                  Kode verifikasi <span className="font-extrabold text-primary">"{code}"</span> tidak terdaftar dalam database kami.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold p-4 rounded-xl leading-relaxed text-left flex gap-1.5 mt-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <span>Pastikan Anda memindai kode QR dari dokumen resmi cetak asli keluaran RT 05 RW 19 Sangkal Putung, Kelurahan Brebes. Hindari dokumen duplikasi ilegal.</span>
              </div>

              <Link
                href="/"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow-md w-full mt-2"
              >
                Kembali ke Beranda
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
