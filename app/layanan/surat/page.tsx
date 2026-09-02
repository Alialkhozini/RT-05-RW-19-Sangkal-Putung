import Link from 'next/link';
import { Home, ChevronRight, Mail, ArrowRight, ShieldCheck, History, Landmark, HomeIcon, Briefcase, HeartHandshake, FilePlus2, FileEdit } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getActiveLetterTypes } from '@/services/letter.service';

export const revalidate = 900; // Cache 15 menit

export default async function LayananSuratPage() {
  const dbLetterTypes = await getActiveLetterTypes();

  // Seed default jenis surat jika database masih kosong untuk demo
  const defaultLetterTypes = [
    {
      id: 'type-1',
      name: 'Surat Pengantar',
      slug: 'surat-pengantar',
      description: 'Diperlukan sebagai pengantar awal dari RT untuk pengurusan KTP, KK, pernikahan, atau keperluan administrasi kependudukan lainnya.',
      icon_name: 'Landmark',
      is_active: true,
    },
    {
      id: 'type-2',
      name: 'Keterangan Domisili',
      slug: 'keterangan-domisili',
      description: 'Surat resmi yang menerangkan bahwa warga benar bertempat tinggal dan menetap di wilayah RT 05 RW 19 Sangkal Putung.',
      icon_name: 'HomeIcon',
      is_active: true,
    },
    {
      id: 'type-3',
      name: 'Keterangan Usaha',
      slug: 'keterangan-usaha',
      description: 'Pengantar untuk pembuatan SKU (Surat Keterangan Usaha) bagi warga yang memiliki usaha mikro, kecil, atau menengah di lingkungan RT.',
      icon_name: 'Briefcase',
      is_active: true,
    },
    {
      id: 'type-4',
      name: 'Keterangan Tidak Mampu',
      slug: 'keterangan-tidak-mampu',
      description: 'Surat pengantar untuk pengajuan bantuan sosial, keringanan biaya pendidikan/sekolah, atau layanan kesehatan gratis (sktm).',
      icon_name: 'HeartHandshake',
      is_active: true,
    },
    {
      id: 'type-5',
      name: 'Pengantar Administrasi',
      slug: 'pengantar-administrasi',
      description: 'Dokumen pendukung untuk keperluan instansi luar, seperti perbankan, kepolisian (SKCK), pendaftaran sekolah/kuliah, dll.',
      icon_name: 'FilePlus2',
      is_active: true,
    },
    {
      id: 'type-6',
      name: 'Keterangan Lainnya',
      slug: 'keterangan-lainnya',
      description: 'Formulir pengajuan surat untuk kebutuhan spesifik yang tidak tercantum pada opsi reguler. Tuliskan rincian kebutuhan Anda dengan jelas.',
      icon_name: 'FileEdit',
      is_active: true,
    },
  ];

  const letterTypes = dbLetterTypes.length > 0 ? dbLetterTypes : defaultLetterTypes;

  // Pemetaan ikon string ke komponen Lucide
  const iconMap: Record<string, any> = {
    Landmark: Landmark,
    HomeIcon: HomeIcon,
    Briefcase: Briefcase,
    HeartHandshake: HeartHandshake,
    FilePlus2: FilePlus2,
    FileEdit: FileEdit,
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
            <span className="text-primary font-bold">Surat Menyurat</span>
          </nav>

          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
              Layanan Surat Menyurat
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">
              Ajukan kebutuhan administratif secara mandiri. Sistem pelayanan mandiri dirancang untuk mempercepat birokrasi dan mempermudah akses warga RT 05 RW 19.
            </p>
          </div>

          {/* Grid Kartu Surat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {letterTypes.map((type) => {
              const IconComponent = iconMap[type.icon_name || 'Landmark'] || Landmark;
              return (
                <div
                  key={type.id}
                  className="bg-white rounded-3xl p-6 shadow-md border border-neutral-gray hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary border border-red-100 flex items-center justify-center shrink-0 shadow-sm">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base font-extrabold text-dark group-hover:text-primary transition-colors">
                        {type.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-neutral-gray pt-5 mt-6">
                    <Link
                      href={`/layanan/surat/${type.slug}`}
                      className="bg-red-50 hover:bg-primary hover:text-white text-primary text-xs font-bold w-full py-2.5 rounded-xl border border-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                      Ajukan Surat <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner Privasi & Pelacakan */}
          <div className="bg-white border border-neutral-gray rounded-3xl p-8 mt-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-4 text-left max-w-xl">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 border border-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-extrabold text-dark">Privasi & Keamanan Data Warga</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Seluruh informasi Kartu Keluarga (KK), NIK, dan data sensitif lainnya dienkripsi dan diproses secara privat. Kami menjamin kerahasiaan data warga yang diunggah ke portal ini.
                </p>
              </div>
            </div>
            
            <Link
              href="/pengajuan"
              className="bg-white hover:bg-neutral-bg text-dark border border-neutral-gray/80 text-xs font-bold px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 flex items-center justify-center gap-2 active:scale-95"
            >
              <History className="w-4 h-4 text-primary" /> Cek Riwayat & Lacak Surat
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
