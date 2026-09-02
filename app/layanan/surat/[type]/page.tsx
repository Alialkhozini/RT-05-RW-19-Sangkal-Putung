import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Landmark, Clock, HelpCircle, ShieldCheck } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import LetterRequestForm from '@/components/forms/LetterRequestForm';
import { getActiveLetterTypes } from '@/services/letter.service';

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function RequestDetailPage(props: PageProps) {
  const params = await props.params;
  const type = params.type;

  // Dapatkan jenis-jenis surat aktif (memicu auto-seeding jika database kosong)
  const activeTypes = await getActiveLetterTypes();
  const letterType = activeTypes.find((t) => t.slug === type);

  if (!letterType) {
    notFound();
  }

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
            <Link href="/layanan/surat" className="hover:text-primary transition-colors">
              Layanan Surat
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Ajukan {letterType.name}</span>
          </nav>

          {/* Section Header */}
          <div className="text-left flex flex-col gap-2 mb-10 pb-5 border-b border-neutral-gray/80">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest">
              Formulir Layanan
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-dark tracking-tight leading-none">
              Pengajuan {letterType.name}
            </h1>
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-2xl mt-1">
              {letterType.description} Lengkapi seluruh informasi data diri Anda di bawah ini dengan benar untuk mempercepat verifikasi dokumen oleh pengurus RT.
            </p>
          </div>

          {/* Main Form Component */}
          <LetterRequestForm letterType={letterType} />
        </div>
      </main>

      <Footer />
    </>
  );
}
