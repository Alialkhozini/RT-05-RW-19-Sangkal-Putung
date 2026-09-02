import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Calendar, ArrowLeft, Paperclip, Download } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
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

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow pt-28 pb-20 bg-neutral-bg">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 bg-white py-3 px-5 rounded-2xl border border-neutral-gray/60 shadow-sm w-fit">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/informasi/pengumuman" className="hover:text-primary transition-colors">
              Pengumuman
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold truncate max-w-[200px]">{announcement.title}</span>
          </nav>

          {/* Tombol Kembali */}
          <Link
            href="/informasi/pengumuman"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pengumuman
          </Link>

          {/* Pengumuman Main Container */}
          <article className="bg-white rounded-3xl overflow-hidden shadow-md border border-neutral-gray p-6 md:p-10 flex flex-col gap-6">
            {/* Meta Data */}
            <div className="flex items-center justify-between border-b border-neutral-gray pb-4">
              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {new Date(announcement.published_at || announcement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="bg-red-50 text-primary border border-red-100 text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full">
                Penting
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-dark tracking-tight leading-tight">
              {announcement.title}
            </h1>

            {/* Content (Rich Text / HTML) */}
            <div 
              className="prose prose-sm md:prose-base max-w-none text-dark leading-relaxed font-medium space-y-4 pt-2"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />

            {/* Download Attachment Area */}
            {announcement.attachment_url && (
              <div className="bg-neutral-bg border border-neutral-gray rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-gray flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-dark">Berkas Pendukung Dokumen</span>
                    <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Silakan unduh dokumen resmi pengumuman ini.</span>
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
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
