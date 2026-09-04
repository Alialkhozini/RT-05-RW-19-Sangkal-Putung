import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Calendar, ArrowLeft, Paperclip, Download, Bell, User } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import ShareButtons from '@/components/public/ShareButtons';
import { getAnnouncementBySlug } from '@/services/announcement.service';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DetailPengumumanPage(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

  const announcement = await getAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

  const formattedDate = new Date(announcement.published_at || announcement.created_at).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow pt-32 md:pt-36 pb-24 bg-neutral-bg min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Navigasi Atas: Breadcrumb & Tombol Kembali */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <nav className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-white py-2.5 px-4 rounded-xl border border-neutral-gray shadow-xs">
              <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Beranda
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <Link href="/informasi/pengumuman" className="hover:text-primary transition-colors">
                Pengumuman
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-primary font-bold truncate max-w-[160px] sm:max-w-[240px]">
                {announcement.title}
              </span>
            </nav>

            <Link
              href="/informasi/pengumuman"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary bg-white py-2.5 px-4 rounded-xl border border-neutral-gray shadow-xs transition-all hover:bg-neutral-bg"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Link>
          </div>

          {/* Kartu Utama Pengumuman */}
          <article className="bg-white rounded-3xl overflow-hidden shadow-lg border border-neutral-gray p-6 sm:p-8 md:p-12 flex flex-col gap-8">
            {/* Header Pengumuman: Tag & Tanggal */}
            <div className="flex flex-col gap-4 border-b border-neutral-gray pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold uppercase px-3.5 py-1 rounded-full">
                    <Bell className="w-3.5 h-3.5" /> Pengumuman Resmi
                  </span>
                  <span className="bg-red-50 text-red-600 border border-red-100 text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full">
                    Penting
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {formattedDate}
                  </span>
                </div>
              </div>

              {/* Judul Pengumuman */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight md:leading-snug">
                {announcement.title}
              </h1>
            </div>

            {/* Isi Konten Pengumuman */}
            <div
              className="text-gray-800 text-sm sm:text-base md:text-[17px] leading-relaxed font-normal space-y-4 break-words whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />

            {/* Area Unduh Berkas Lampiran */}
            {announcement.attachment_url && (
              <div className="bg-neutral-bg/70 border border-neutral-gray rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-gray flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-dark">Berkas Pendukung Dokumen</span>
                    <span className="text-[11px] text-gray-400 font-semibold mt-0.5">
                      Silakan unduh dokumen resmi pengumuman ini.
                    </span>
                  </div>
                </div>
                <a
                  href={announcement.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                </a>
              </div>
            )}

            {/* Bagian Tombol Bagikan */}
            <div className="pt-4 border-t border-neutral-gray">
              <ShareButtons title={announcement.title} />
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
