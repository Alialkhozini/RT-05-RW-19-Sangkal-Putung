import Link from 'next/link';
import { Home, ChevronRight, Image as ImageIcon } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Footer from '@/components/public/Footer';
import { getGalleryItems } from '@/services/gallery.service';

export const revalidate = 900; // Cache 15 menit (ISR)

export default async function GaleriPage() {
  const dbItems = await getGalleryItems();

  // Seed default galeri jika database kosong agar desain tetap premium dan menarik
  const defaultItems = [
    {
      id: 'def-1',
      title: 'Kerja Bakti Lingkungan',
      description: 'Kegiatan membersihkan saluran air dan pemangkasan tanaman liar untuk mencegah banjir dan sarang nyamuk.',
      image_url: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&q=80&w=800',
      category: 'Kerja Bakti',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'def-2',
      title: 'Rapat Koordinasi Bulanan',
      description: 'Pertemuan rutin pengurus RT dan warga untuk membahas kas bulanan, aspirasi warga, dan rencana kegiatan mendatang.',
      image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      category: 'Rapat Warga',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'def-3',
      title: 'Lomba Kemerdekaan RI',
      description: 'Keseruan anak-anak dan warga RT 05 dalam mengikuti berbagai perlombaan memperingati HUT RI di lapangan lingkungan.',
      image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=800',
      category: 'Kegiatan Sosial',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'def-4',
      title: 'Posyandu Balita & Lansia',
      description: 'Layanan pemeriksaan kesehatan berkala, imunisasi balita, dan konsultasi kesehatan lansia di posyandu binaan RT.',
      image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      category: 'Kesehatan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'def-5',
      title: 'Senam Pagi Bersama',
      description: 'Kegiatan senam kebugaran jasmani warga RT 05 yang diadakan setiap hari Minggu pagi untuk memupuk pola hidup sehat.',
      image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
      category: 'Olahraga',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'def-6',
      title: 'Siskamling & Ronda Malam',
      description: 'Petugas ronda malam berpatroli menjaga keamanan dan ketertiban lingkungan RT 05 Sangkal Putung.',
      image_url: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=800',
      category: 'Keamanan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const items = dbItems.length > 0 ? dbItems : defaultItems;

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
            <span className="text-primary font-bold">Galeri Kegiatan</span>
          </nav>

          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
              Dokumentasi Lingkungan
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
              Galeri Kegiatan Warga
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto">
              Koleksi foto dokumentasi momen kebersamaan, gotong royong, dan keceriaan warga RT 05 RW 19 Sangkal Putung.
            </p>
          </div>

          {/* Grid Galeri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-md border border-neutral-gray/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Image Wrap */}
                <div className="relative h-60 bg-neutral-bg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.title || 'Foto Galeri'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.category && (
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-primary border border-neutral-gray text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-xl shadow-sm">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-5 text-left flex flex-col gap-1.5">
                  {item.title && (
                    <h3 className="text-sm font-extrabold text-dark group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
