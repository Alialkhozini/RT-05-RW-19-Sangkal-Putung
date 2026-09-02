import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Home, Calendar, AlertCircle } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getHistory } from '@/services/profile.service';

export const revalidate = 300; // Cache 5 menit

export default async function SejarahPage() {
  const dbHistory = await getHistory();

  // Seed default history jika database masih kosong agar tampilan tetap premium
  const defaultHistory = [
    {
      id: 'default-1',
      year: '1998',
      title: 'Awal Terbentuknya Lingkungan',
      description: 'RT 05 RW 19 resmi dibentuk seiring dengan bertambahnya pemukiman penduduk di wilayah Sangkal Putung, Kelurahan Brebes. Pada awalnya kepengurusan berjalan sangat sederhana dengan fokus pada gotong royong dasar.',
      image_url: '',
    },
    {
      id: 'default-2',
      year: '2008',
      title: 'Pembangunan Sarana Pos Ronda',
      description: 'Warga secara swadaya membangun Pos Keamanan Lingkungan (Pos Ronda) untuk memperkuat sistem keamanan malam (Siskamling). Di tahun ini juga dirintis program kebersihan teratur.',
      image_url: '',
    },
    {
      id: 'default-3',
      year: '2015',
      title: 'Digitalisasi Awal & Pendataan Warga',
      description: 'Pengenalan pendataan warga berbasis spreadsheet digital sederhana untuk memudahkan pencatatan kependudukan yang sebelumnya menggunakan buku kas fisik.',
      image_url: '',
    },
    {
      id: 'default-4',
      year: '2022',
      title: 'Peningkatan Fasilitas & Jalan Lingkungan',
      description: 'Program pengaspalan jalan lingkungan selesai dilaksanakan berkat kolaborasi warga dan bantuan pemerintah daerah Kelurahan Brebes. Wilayah menjadi lebih bersih dan tertata.',
      image_url: '',
    },
    {
      id: 'default-5',
      year: '2026',
      title: 'Transformasi Digital Penuh',
      description: 'Peluncuran Website Digital RT 05 RW 19 untuk memudahkan seluruh pengurusan administrasi warga, pengaduan laporan mandiri, serta integrasi tanda tangan elektronik dan verifikasi QR.',
      image_url: '',
    },
  ];

  const historyEntries = dbHistory.length > 0 ? dbHistory : defaultHistory;

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow pt-28 pb-20 bg-neutral-bg">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 bg-white py-3 px-5 rounded-2xl border border-neutral-gray/60 shadow-sm w-fit">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Profil</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Sejarah RT</span>
          </nav>

          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
              Lini Masa Lingkungan
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
              Sejarah RT 05 RW 19
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-md">
              Perjalanan pertumbuhan dan transformasi digital komunitas warga Sangkal Putung dari masa ke masa.
            </p>
          </div>

          {/* Lini Masa Vertical Layout (Cocok untuk Seluler & Desktop) */}
          <div className="relative border-l-2 border-primary/20 ml-4 md:ml-32 pl-6 md:pl-10 space-y-12">
            {historyEntries.map((entry, index) => (
              <div key={entry.id} className="relative group">
                
                {/* Penanda Tahun (Desktop) */}
                <div className="hidden md:flex absolute -left-[140px] top-1.5 items-center gap-1.5 font-extrabold text-primary text-lg w-24 justify-end text-right">
                  <Calendar className="w-4.5 h-4.5" /> {entry.year}
                </div>

                {/* Bulatan Node Lini Masa */}
                <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-md group-hover:scale-125 transition-transform" />

                {/* Konten Sejarah */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md border border-neutral-gray transition-shadow">
                  {/* Penanda Tahun (Seluler) */}
                  <span className="inline-flex md:hidden items-center gap-1 text-xs font-bold text-primary mb-3 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5" /> Tahun {entry.year}
                  </span>
                  
                  <h3 className="text-lg font-extrabold text-dark mb-3">
                    {entry.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {entry.description}
                  </p>

                  {/* Foto Pendukung (Jika Ada) */}
                  {entry.image_url && (
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden mt-5 border border-neutral-gray">
                      <Image
                        src={entry.image_url}
                        alt={entry.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
