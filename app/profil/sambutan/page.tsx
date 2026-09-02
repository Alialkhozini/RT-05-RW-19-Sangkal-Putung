import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Home, Users } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getRtProfile } from '@/services/profile.service';

export const revalidate = 300; // Cache 5 menit (ISR)

export default async function SambutanPage() {
  const profile = await getRtProfile();

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow pt-28 pb-16 bg-neutral-bg">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6 bg-white py-3 px-5 rounded-2xl border border-neutral-gray/60 shadow-sm w-fit">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Profil</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Sambutan Ketua RT</span>
          </nav>

          {/* Kartu Profil Utama */}
          <div className="bg-white rounded-3xl shadow-md border border-neutral-gray p-8 md:p-12 flex flex-col md:flex-row gap-10">
            {/* Sisi Kiri: Foto */}
            <div className="w-full md:w-64 flex flex-col items-center gap-4 shrink-0">
              <div className="relative w-48 h-64 md:w-full md:h-80 rounded-2xl overflow-hidden shadow-md border-4 border-neutral-bg">
                {profile.chairman_photo_url ? (
                  <Image
                    src={profile.chairman_photo_url}
                    alt={profile.chairman_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/30">
                    <Users className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-base font-extrabold text-dark leading-tight">{profile.chairman_name}</h2>
                <span className="text-xs text-primary font-extrabold uppercase tracking-wider block mt-1">
                  {profile.chairman_position}
                </span>
              </div>
            </div>

            {/* Sisi Kanan: Isi Pesan */}
            <div className="flex-1 flex flex-col gap-5 text-left border-t md:border-t-0 md:border-l border-neutral-gray pt-8 md:pt-0 md:pl-10">
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest">
                Sambutan Resmi
              </span>
              <h1 className="font-handwriting text-3xl md:text-5xl font-bold text-dark tracking-normal leading-tight">
                {profile.welcome_title}
              </h1>
              
              <div className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line space-y-4">
                {profile.welcome_message || (
                  <p>Selamat datang di platform informasi resmi warga RT 05 RW 19 Kelurahan Brebes.</p>
                )}
              </div>

              {/* Tanda Tangan */}
              <div className="flex flex-col gap-2 mt-6 border-t border-neutral-gray pt-6 w-fit">
                {profile.signature_url && (
                  <div className="relative w-36 h-16">
                    <Image
                      src={profile.signature_url}
                      alt="Tanda Tangan Ketua RT"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-dark">{profile.chairman_name}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {profile.chairman_position}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
