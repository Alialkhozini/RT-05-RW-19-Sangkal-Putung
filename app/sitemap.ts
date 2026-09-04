import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.rt5rw19.my.id';

  // Halaman-halaman statis utama
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/layanan/surat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/layanan/lapor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pengajuan`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/laporan`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/informasi/berita`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/informasi/pengumuman`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/profil/pengurus`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/profil/sambutan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/profil/sejarah`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Ambil data dinamis berita dan pengumuman
  let dynamicNews: MetadataRoute.Sitemap = [];
  let dynamicAnnouncements: MetadataRoute.Sitemap = [];

  try {
    const supabase = createPublicClient();
    
    // Ambil berita terpublikasi
    const { data: newsList } = await supabase
      .from('news')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .limit(100);

    if (newsList) {
      dynamicNews = newsList.map((item) => ({
        url: `${baseUrl}/informasi/berita/${item.slug}`,
        lastModified: new Date(item.updated_at || item.published_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    // Ambil pengumuman terpublikasi
    const { data: announcementList } = await supabase
      .from('announcements')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .limit(100);

    if (announcementList) {
      dynamicAnnouncements = announcementList.map((item) => ({
        url: `${baseUrl}/informasi/pengumuman/${item.slug}`,
        lastModified: new Date(item.updated_at || item.published_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn('Sitemap dynamic data fetch fallback:', error);
  }

  return [...staticRoutes, ...dynamicNews, ...dynamicAnnouncements];
}
