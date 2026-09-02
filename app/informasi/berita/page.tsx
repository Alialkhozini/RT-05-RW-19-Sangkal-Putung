import Link from 'next/link';
import { Home, ChevronRight, Search, Calendar, Tag, AlertCircle } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getPublishedNews } from '@/services/news.service';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function BeritaPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 6;

  const { news, total } = await getPublishedNews(page, limit, query);
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
            <span className="text-primary font-bold">Berita RT</span>
          </nav>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest">
                Kabar Warga
              </span>
              <h1 className="text-3xl font-extrabold text-dark tracking-tight leading-none">
                Berita & Kegiatan RT
              </h1>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Menyajikan informasi terupdate seputar wilayah RT 05 RW 19 Sangkal Putung.
              </p>
            </div>

            {/* Bilah Pencarian Halaman Berita */}
            <form action="/informasi/berita" method="GET" className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-neutral-gray/80 p-1.5 flex items-center gap-2">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Cari berita..."
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

          {/* Grid Berita */}
          {news.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-neutral-gray shadow-sm">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-semibold text-gray-400">Belum ada berita yang ditemukan.</p>
              {query && (
                <Link href="/informasi/berita" className="text-xs text-primary font-bold mt-2 inline-block hover:underline">
                  Atur Ulang Pencarian
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {news.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-md border border-neutral-gray/60 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Cover */}
                    <div className="relative h-48 bg-neutral-bg overflow-hidden">
                      {article.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/10">
                          <Search className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-6 flex-grow flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {article.category && (
                          <span className="text-primary flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {article.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-dark group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="mt-auto pt-4">
                        <Link
                          href={`/informasi/berita/${article.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover"
                        >
                          Selengkapnya &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
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
                        href={`/informasi/berita?page=${pageNum}${query ? `&q=${query}` : ''}`}
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
