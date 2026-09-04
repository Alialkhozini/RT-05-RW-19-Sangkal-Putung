import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Calendar, Tag, ArrowLeft, Clock, User, Newspaper } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import ShareButtons from '@/components/public/ShareButtons';
import { getNewsBySlug, getPublishedNews } from '@/services/news.service';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DetailBeritaPage(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

  const article = await getNewsBySlug(slug);

  // Jika berita tidak ditemukan, arahkan ke halaman 404
  if (!article) {
    notFound();
  }

  // Ambil berita terbaru lainnya untuk rekomendasi bacaan di bawah
  const { news: recentNewsList } = await getPublishedNews(1, 4);
  const otherNews = recentNewsList.filter((item) => item.slug !== slug).slice(0, 3);

  const formattedDate = new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', {
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
              <Link href="/informasi/berita" className="hover:text-primary transition-colors">
                Berita
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-primary font-bold truncate max-w-[160px] sm:max-w-[240px]">
                {article.title}
              </span>
            </nav>

            <Link
              href="/informasi/berita"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary bg-white py-2.5 px-4 rounded-xl border border-neutral-gray shadow-xs transition-all hover:bg-neutral-bg"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Link>
          </div>

          {/* Kartu Utama Artikel Berita */}
          <article className="bg-white rounded-3xl overflow-hidden shadow-lg border border-neutral-gray p-6 sm:p-8 md:p-12 flex flex-col gap-8">
            {/* Header Artikel: Kategori & Tanggal & Penulis */}
            <div className="flex flex-col gap-4 border-b border-neutral-gray pb-6">
              <div className="flex flex-wrap items-center gap-3">
                {article.category && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold uppercase px-3.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" /> {article.category}
                  </span>
                )}
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {formattedDate}
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" /> Pengurus RT 05 RW 19
                  </span>
                </div>
              </div>

              {/* Judul Berita */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight md:leading-snug">
                {article.title}
              </h1>

              {/* Ringkasan / Excerpt Singkat */}
              {article.excerpt && (
                <p className="text-sm md:text-base font-medium text-gray-600 border-l-4 border-primary pl-4 py-2 italic bg-primary/5 rounded-r-2xl leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Foto Utama / Cover Berita */}
            {article.cover_image && (
              <div className="w-full rounded-2xl overflow-hidden border border-neutral-gray bg-neutral-bg/40 shadow-xs flex items-center justify-center p-2 sm:p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full max-h-[500px] object-contain rounded-xl"
                />
              </div>
            )}

            {/* Isi Konten Berita */}
            <div
              className="text-gray-800 text-sm sm:text-base md:text-[17px] leading-relaxed font-normal space-y-4 break-words whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Bagian Tombol Bagikan */}
            <div className="pt-4 border-t border-neutral-gray">
              <ShareButtons title={article.title} />
            </div>
          </article>

          {/* Bagian Berita Lainnya */}
          {otherNews.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-primary" />
                  <h2 className="text-lg md:text-xl font-extrabold text-dark">
                    Berita Terkini Lainnya
                  </h2>
                </div>
                <Link
                  href="/informasi/berita"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Lihat Semua Berita &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {otherNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/informasi/berita/${item.slug}`}
                    className="bg-white rounded-2xl border border-neutral-gray overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col group"
                  >
                    {item.cover_image ? (
                      <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-40 w-full bg-primary/5 flex items-center justify-center text-primary">
                        <Newspaper className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-grow justify-between gap-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <h3 className="text-sm font-bold text-dark group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                      </div>
                      <span className="text-xs font-extrabold text-primary flex items-center gap-1 mt-2">
                        Baca Selengkapnya &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
