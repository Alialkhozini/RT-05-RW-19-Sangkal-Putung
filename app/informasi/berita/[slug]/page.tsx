import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Calendar, Tag, ArrowLeft } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getNewsBySlug } from '@/services/news.service';

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
            <Link href="/informasi/berita" className="hover:text-primary transition-colors">
              Berita
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Tombol Kembali */}
          <Link
            href="/informasi/berita"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Berita
          </Link>

          {/* Artikel Main Container */}
          <article className="bg-white rounded-3xl overflow-hidden shadow-md border border-neutral-gray p-6 md:p-10 flex flex-col gap-6">
            {/* Meta Data */}
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {article.category && (
                <span className="text-primary flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {article.category}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-sm font-semibold text-gray-400 border-l-4 border-primary pl-4 py-1.5 leading-relaxed bg-neutral-bg/30 pr-2 rounded-r-xl">
                {article.excerpt}
              </p>
            )}

            {/* Cover Image */}
            {article.cover_image && (
              <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-neutral-gray/80 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content (Rich Text / HTML) */}
            <div 
              className="prose prose-sm md:prose-base max-w-none text-dark leading-relaxed font-medium space-y-4 pt-4 border-t border-neutral-gray"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
