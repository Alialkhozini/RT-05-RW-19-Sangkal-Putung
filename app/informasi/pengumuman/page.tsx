import Link from 'next/link';
import { Home, ChevronRight, Search, Calendar, AlertCircle, Paperclip } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getPublishedAnnouncements } from '@/services/announcement.service';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function PengumumanPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 6;

  const { announcements, total } = await getPublishedAnnouncements(page, limit, query);
  const totalPages = Math.ceil(total / limit);

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
            <span className="text-gray-400">Informasi</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">Pengumuman</span>
          </nav>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest">
                Maklumat RT
              </span>
              <h1 className="text-3xl font-extrabold text-dark tracking-tight leading-none">
                Pengumuman Resmi
              </h1>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Pemberitahuan, agenda kerja bakti, rapat warga, dan maklumat kepengurusan RT.
              </p>
            </div>

            {/* Bilah Pencarian Pengumuman */}
            <form action="/informasi/pengumuman" method="GET" className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-neutral-gray/80 p-1.5 flex items-center gap-2">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Cari pengumuman..."
                className="flex-1 bg-transparent border-none text-xs font-medium text-dark pl-2 outline-none"
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Pencarian Aktif Hint */}
          {query && (
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-neutral-gray mb-8 text-xs font-semibold text-gray-500">
              Hasil pencarian untuk kata kunci: <span className="text-primary font-bold">"{query}"</span> ({total} ditemukan)
            </div>
          )}

          {/* List Pengumuman */}
          {announcements.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-neutral-gray shadow-sm">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-semibold text-gray-400">Belum ada pengumuman yang ditemukan.</p>
              {query && (
                <Link href="/informasi/pengumuman" className="text-xs text-primary font-bold mt-2 inline-block hover:underline">
                  Atur Ulang Pencarian
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-neutral-gray/60 hover:shadow-xl transition-shadow flex flex-col gap-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(ann.published_at || ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="bg-red-50 text-primary border border-red-100 text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full">
                        Penting
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 flex-grow">
                      <h3 className="text-base font-extrabold text-dark group-hover:text-primary transition-colors">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3">
                        {ann.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>

                    {/* Lampiran File (Jika Ada) */}
                    {ann.attachment_url && (
                      <div className="bg-neutral-bg rounded-xl p-3 flex items-center justify-between border border-neutral-gray">
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 truncate max-w-[200px]">
                          <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" /> Dokumen Lampiran
                        </span>
                        <a
                          href={ann.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-extrabold text-primary hover:underline shrink-0"
                        >
                          Unduh Berkas
                        </a>
                      </div>
                    )}

                    <div className="border-t border-neutral-gray pt-4 mt-2">
                      <Link
                        href={`/informasi/pengumuman/${ann.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary"
                      >
                        Selengkapnya &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Link
                        key={pageNum}
                        href={`/informasi/pengumuman?page=${pageNum}${query ? `&q=${query}` : ''}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                          page === pageNum
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white hover:bg-neutral-bg text-gray-600 border border-neutral-gray/80'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
