import Link from 'next/link';
import Image from 'next/image';
import { 
  FileText, 
  MessageSquare, 
  Info, 
  Users, 
  ArrowRight, 
  Calendar, 
  Tag, 
  Search, 
  CheckCircle,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import DemographicStatistics from '@/components/public/DemographicStatistics';
import HeroCarousel from '@/components/public/HeroCarousel';
import { getRtProfile } from '@/services/profile.service';
import { getActiveBanners } from '@/services/banner.service';
import { getPublishedNews } from '@/services/news.service';
import { getPublishedAnnouncements } from '@/services/announcement.service';

export const revalidate = 60; // Regenerasi halaman setiap 60 detik (ISR)

export default async function HomePage() {
  // Ambil data dinamis secara paralel untuk optimasi kecepatan load
  const [banners, profile, latestNewsData, latestAnnData] = await Promise.all([
    getActiveBanners(),
    getRtProfile(),
    getPublishedNews(1, 3),
    getPublishedAnnouncements(1, 3),
  ]);

  const latestNews = latestNewsData.news;
  const latestAnn = latestAnnData.announcements;

  const quickServices = [
    {
      title: 'Surat Menyurat',
      description: 'Ajukan kebutuhan surat pengantar dan keterangan secara online dengan mudah.',
      href: '/layanan/surat',
      icon: FileText,
      color: 'bg-red-50 text-primary border-red-100 hover:border-primary',
    },
    {
      title: 'Lapor RT',
      description: 'Sampaikan aduan, laporan keamanan, kebersihan, atau aspirasi lingkungan.',
      href: '/layanan/lapor',
      icon: MessageSquare,
      color: 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-600',
    },
    {
      title: 'Informasi RT',
      description: 'Dapatkan berita lingkungan, agenda kegiatan, dan pengumuman terbaru.',
      href: '/informasi/berita',
      icon: Info,
      color: 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-600',
    },
    {
      title: 'Profil RT',
      description: 'Kenali susunan pengurus, sejarah, dan profil wilayah RT 05 RW 19.',
      href: '/profil/sambutan',
      icon: Users,
      color: 'bg-green-50 text-green-700 border-green-100 hover:border-green-600',
    },
  ];

  return (
    <>
      <PublicNavbar />

      <main className="flex-grow">
        {/* ================= HERO SECTION (CAROUSEL & SLIDER) ================= */}
        <HeroCarousel banners={banners} />

        {/* ================= QUICK SERVICES CARDS ================= */}
        <section className="py-16 bg-neutral-bg">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-24 relative z-20">
              {quickServices.map((service) => {
                const IconComp = service.icon;
                return (
                  <Link 
                    key={service.title} 
                    href={service.href}
                    className={`block bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border transition-all duration-300 hover:-translate-y-1.5 ${service.color}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 shrink-0 border border-neutral-gray/20">
                      <IconComp className="w-6 h-6 text-current" />
                    </div>
                    <h3 className="text-base font-bold text-dark mb-2">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {service.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= SAMBUTAN KETUA RT ================= */}
        <section className="py-16 bg-white border-y border-neutral-gray">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="bg-neutral-bg/60 border border-neutral-gray/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              {/* Foto Ketua RT */}
              <div className="w-56 h-72 relative rounded-2xl overflow-hidden shadow-md border-4 border-white shrink-0">
                {profile.chairman_photo_url ? (
                  <Image
                    src={profile.chairman_photo_url}
                    alt={profile.chairman_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  // Default avatar/photo placeholder
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/30">
                    <Users className="w-20 h-20" />
                  </div>
                )}
                {/* Badge Nama */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark to-transparent p-4 text-white text-center">
                  <h4 className="text-sm font-bold truncate">{profile.chairman_name}</h4>
                  <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider truncate">
                    {profile.chairman_position}
                  </p>
                </div>
              </div>

              {/* Teks Sambutan */}
              <div className="flex-1 flex flex-col gap-4 text-left">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Pesan Dari RT
                </span>
                <h2 className="font-handwriting text-3xl md:text-5xl font-bold text-dark tracking-normal leading-tight">
                  {profile.welcome_title}
                </h2>
                <div className="text-sm text-gray-500 leading-relaxed font-medium whitespace-pre-line max-w-xl">
                  {profile.welcome_message || 'Selamat datang di portal informasi resmi warga RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.'}
                </div>
                
                {/* Tanda Tangan */}
                <div className="flex items-center gap-4 mt-3">
                  {profile.signature_url && (
                    <div className="relative w-28 h-12">
                      <Image 
                        src={profile.signature_url} 
                        alt="Tanda Tangan Ketua RT" 
                        fill
                        className="object-contain"
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

                <div className="mt-4">
                  <Link 
                    href="/profil/sambutan"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover group"
                  >
                    Baca Selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BERITA TERBARU ================= */}
        <section className="py-20 bg-neutral-bg">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex items-end justify-between border-b border-neutral-gray pb-5 mb-10">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Kabar Lingkungan
                </span>
                <h2 className="font-handwriting text-3xl md:text-5xl font-bold text-dark tracking-normal leading-none">
                  Berita Terbaru
                </h2>
              </div>
              <Link 
                href="/informasi/berita"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
              >
                Lihat Semua Berita <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {latestNews.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-gray shadow-sm">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-semibold text-gray-400">Belum ada berita yang dipublikasikan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {latestNews.map((article) => (
                  <article 
                    key={article.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-neutral-gray/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group"
                  >
                    {/* Cover Image */}
                    <div className="relative h-48 bg-neutral-bg overflow-hidden">
                      {article.cover_image ? (
                        <Image
                          src={article.cover_image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/10">
                          <Info className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    {/* Card Content */}
                    <div className="p-6 flex-grow flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {article.category && (
                          <span className="flex items-center gap-1 text-primary">
                            <Tag className="w-3 h-3" /> {article.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-dark line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="mt-auto pt-4">
                        <Link 
                          href={`/informasi/berita/${article.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:text-primary-hover"
                        >
                          Selengkapnya <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= PENGUMUMAN PENTING ================= */}
        <section className="py-20 bg-white border-t border-neutral-gray">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex items-end justify-between border-b border-neutral-gray pb-5 mb-10">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Maklumat RT
                </span>
                <h2 className="font-handwriting text-3xl md:text-5xl font-bold text-dark tracking-normal leading-none">
                  Pengumuman Resmi
                </h2>
              </div>
              <Link 
                href="/informasi/pengumuman"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
              >
                Lihat Semua Pengumuman <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {latestAnn.length === 0 ? (
              <div className="bg-neutral-bg/60 rounded-3xl p-12 text-center border border-neutral-gray/60 shadow-sm">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-semibold text-gray-400">Belum ada pengumuman terbaru.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestAnn.map((ann) => (
                  <div 
                    key={ann.id}
                    className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-neutral-gray hover:-translate-y-1 transition-all flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> 
                        {new Date(ann.published_at || ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="bg-red-50 text-primary border border-red-100 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                        Penting
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 flex-grow">
                      <h3 className="text-base font-bold text-dark line-clamp-2">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
                        {ann.content.replace(/<[^>]*>/g, '')} {/* Strip HTML for excerpt */}
                      </p>
                    </div>
                    <div className="border-t border-neutral-gray pt-4 mt-2">
                      <Link
                        href={`/informasi/pengumuman/${ann.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group hover:text-primary-hover"
                      >
                        Selengkapnya <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= STATISTIK RT ================= */}
        <section className="py-20 bg-neutral-bg border-y border-neutral-gray">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center flex flex-col items-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Informasi Wilayah
              </span>
              <h2 className="font-handwriting text-3xl md:text-5xl font-bold text-dark tracking-normal leading-none">
                Statistik RT 05 RW 19
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Data demografi dan operasional pelayanan digital di wilayah lingkungan kami.
              </p>
            </div>

            <DemographicStatistics />
          </div>
        </section>


      </main>

      <Footer />
    </>
  );
}
