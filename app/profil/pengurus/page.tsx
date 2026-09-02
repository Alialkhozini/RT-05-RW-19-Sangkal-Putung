import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Home, Users } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getOfficers } from '@/services/profile.service';

export const revalidate = 300; // Cache 5 menit

export default async function PengurusPage() {
  const dbOfficers = await getOfficers();

  // Seed default pengurus jika database kosong agar desain tetap kokoh dan premium
  const defaultOfficers = [
    {
      id: 'default-1',
      name: 'Bpk. Budi Santoso',
      position: 'Ketua RT 05',
      photo_url: '',
      description: 'Bertanggung jawab memimpin jalannya roda kepengurusan RT, mewakili warga dalam rapat RW/Kelurahan, dan mengambil keputusan strategis.',
      order_num: 1,
    },
    {
      id: 'default-2',
      name: 'Bpk. Ahmad Fauzi',
      position: 'Sekretaris RT',
      photo_url: '',
      description: 'Mengelola administrasi surat-menyurat warga, pencatatan log data kependudukan, dan mencatat notulensi rapat warga.',
      order_num: 2,
    },
    {
      id: 'default-3',
      name: 'Ibu Siti Aminah',
      position: 'Bendahara RT',
      photo_url: '',
      description: 'Mengelola keuangan kas RT, mencatat iuran bulanan warga, menyusun laporan bulanan, dan mendanai program kerja warga.',
      order_num: 3,
    },
    {
      id: 'default-4',
      name: 'Bpk. Joko Susilo',
      position: 'Seksi Keamanan',
      photo_url: '',
      description: 'Mengoordinasi jadwal ronda malam (Siskamling), menjaga kondusivitas lingkungan, serta memantau ketertiban warga.',
      order_num: 4,
    },
    {
      id: 'default-5',
      name: 'Bpk. Hendra Wijaya',
      position: 'Seksi Kebersihan & Lingkungan',
      photo_url: '',
      description: 'Mengatur jadwal pengangkutan sampah warga, koordinasi kegiatan kerja bakti bulanan, serta penghijauan wilayah.',
      order_num: 5,
    },
    {
      id: 'default-6',
      name: 'Ibu Rina Lestari',
      position: 'Seksi Sosial & Pemberdayaan Perempuan',
      photo_url: '',
      description: 'Mengelola kegiatan PKK, posyandu balita & lansia, bantuan kedukaan warga, serta kegiatan perayaan hari nasional.',
      order_num: 6,
    },
  ];

  const officers = dbOfficers.length > 0 ? dbOfficers : defaultOfficers;

  // Kelompokkan pengurus berdasarkan hierarki untuk tata letak premium
  const ketua = officers.filter(o => o.position.toLowerCase().includes('ketua'));
  const sekretarisBendahara = officers.filter(o => 
    o.position.toLowerCase().includes('sekretaris') || 
    o.position.toLowerCase().includes('bendahara')
  );
  const seksiSeksi = officers.filter(o => 
    !o.position.toLowerCase().includes('ketua') && 
    !o.position.toLowerCase().includes('sekretaris') && 
    !o.position.toLowerCase().includes('bendahara')
  );

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
            <span className="text-gray-400">Profil</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Susunan Pengurus</span>
          </nav>

          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
              Struktur Organisasi
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
              Susunan Pengurus RT 05 RW 19
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto">
              Dedikasi jajaran pengurus dalam melayani kepentingan warga, menjaga kerukunan, dan mewujudkan lingkungan yang asri.
            </p>
          </div>

          <div className="flex flex-col gap-12">
            {/* TINGKAT 1: KETUA RT */}
            {ketua.length > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ketua RT</span>
                {ketua.map((o) => (
                  <div 
                    key={o.id}
                    className="bg-white rounded-3xl p-6 shadow-md border-2 border-primary/20 w-full max-w-sm flex flex-col items-center text-center gap-4 transition-all duration-300 hover:shadow-xl hover:border-primary"
                  >
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-bg shadow-inner">
                      {o.photo_url ? (
                        <Image src={o.photo_url} alt={o.name} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/30">
                          <Users className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-extrabold text-dark leading-tight">{o.name}</h3>
                      <span className="text-xs text-primary font-extrabold uppercase tracking-wider block mt-1">
                        {o.position}
                      </span>
                    </div>
                    {o.description && (
                      <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xs">
                        {o.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hubungan Antar Hirarki (Garis Struktur Penghubung) */}
            <div className="hidden md:flex justify-center -my-6">
              <div className="w-0.5 h-12 bg-neutral-gray" />
            </div>

            {/* TINGKAT 2: SEKRETARIS & BENDAHARA */}
            {sekretarisBendahara.length > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Administrasi & Keuangan</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
                  {sekretarisBendahara.map((o) => (
                    <div 
                      key={o.id}
                      className="bg-white rounded-3xl p-6 shadow-md border border-neutral-gray flex flex-col items-center text-center gap-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-neutral-bg shadow-inner">
                        {o.photo_url ? (
                          <Image src={o.photo_url} alt={o.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/30">
                            <Users className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-extrabold text-dark leading-tight">{o.name}</h3>
                        <span className="text-[11px] text-primary font-extrabold uppercase tracking-wider block mt-1">
                          {o.position}
                        </span>
                      </div>
                      {o.description && (
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                          {o.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TINGKAT 3: SEKSI-SEKSI */}
            {seksiSeksi.length > 0 && (
              <div className="flex flex-col items-center mt-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Seksi Bidang Pelayanan</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {seksiSeksi.map((o) => (
                    <div 
                      key={o.id}
                      className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-gray flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-bg">
                        {o.photo_url ? (
                          <Image src={o.photo_url} alt={o.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/30">
                            <Users className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-xs font-extrabold text-dark leading-tight">{o.name}</h3>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mt-0.5">
                          {o.position}
                        </span>
                      </div>
                      {o.description && (
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1">
                          {o.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
