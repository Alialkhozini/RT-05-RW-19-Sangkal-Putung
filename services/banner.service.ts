import { createServerClient } from '@/lib/supabase';
import { getCache, setCache, invalidateCache } from '@/lib/redis';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image_url: string;
  cta_text?: string;
  cta_link?: string;
  order_num: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Data default banner awal (1920 x 1080 px) sebagai fallback
export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'default-banner-1',
    title: 'Selamat Datang di Website RT 05 RW 19',
    subtitle: 'Pusat informasi resmi, transparansi, dan layanan publik mandiri warga Sangkal Putung, Kelurahan Brebes.',
    badge: 'WEBSITE RESMI RT 05 RW 19',
    image_url: '/hero-banner.jpg',
    order_num: 1,
    is_active: true,
  },
  {
    id: 'default-banner-2',
    title: 'Gotong Royong & Guyub Rukun Warga',
    subtitle: 'Membangun lingkungan yang asri, aman, nyaman, dan harmonis bersama seluruh warga RT 05 RW 19.',
    badge: 'KEBERSAMAAN WARGA',
    image_url: '/hero-banner.jpg',
    order_num: 2,
    is_active: true,
  },
  {
    id: 'default-banner-3',
    title: 'Layanan Pengajuan Surat Digital 24 Jam',
    subtitle: 'Kemudahan administrasi surat pengantar warga tanpa harus antre, cepat, dan terverifikasi digital.',
    badge: 'PELAYANAN MANDIRI',
    image_url: '/hero-banner.jpg',
    order_num: 3,
    is_active: true,
  },
];

/**
 * Mengambil daftar banner aktif untuk beranda publik (Carousel).
 */
export async function getActiveBanners(): Promise<HeroBanner[]> {
  const cacheKey = 'homepage:banners:active';
  const cached = await getCache<HeroBanner[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) return cached;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('order_num', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Coba ambil dari hero_content jika ada
      const { data: singleHero } = await supabase.from('hero_content').select('*').single();
      if (singleHero && singleHero.title) {
        const fallback = [
          {
            id: 'legacy-hero',
            title: singleHero.title,
            subtitle: singleHero.subtitle || DEFAULT_HERO_BANNERS[0].subtitle,
            badge: singleHero.badge || DEFAULT_HERO_BANNERS[0].badge,
            image_url: singleHero.image_url || '/hero-banner.jpg',
            order_num: 1,
            is_active: true,
          },
          ...DEFAULT_HERO_BANNERS.slice(1),
        ];
        await setCache(cacheKey, fallback, 300);
        return fallback;
      }

      await setCache(cacheKey, DEFAULT_HERO_BANNERS, 300);
      return DEFAULT_HERO_BANNERS;
    }

    await setCache(cacheKey, data, 300);
    return data;
  } catch (err) {
    console.error('Gagal mengambil banner aktif, menggunakan fallback:', err);
    return DEFAULT_HERO_BANNERS;
  }
}

/**
 * Mengambil semua banner untuk keperluan admin.
 */
export async function getAllBannersAdmin(): Promise<HeroBanner[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('order_num', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_HERO_BANNERS;
    }

    return data;
  } catch (err) {
    console.error('Gagal mengambil semua banner admin:', err);
    return DEFAULT_HERO_BANNERS;
  }
}

/**
 * Mengambil detail banner berdasarkan ID.
 */
export async function getBannerById(id: string): Promise<HeroBanner | null> {
  // Cek apakah ID default
  const defaultFound = DEFAULT_HERO_BANNERS.find(b => b.id === id);
  if (defaultFound) return defaultFound;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error(`Gagal mengambil banner ID ${id}:`, err);
    return null;
  }
}

/**
 * Mendapatkan nomor urut banner berikutnya (maksimum yang ada + 1).
 */
export async function getNextBannerOrder(): Promise<number> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from('hero_banners')
      .select('order_num')
      .order('order_num', { ascending: false })
      .limit(1);

    if (data && data.length > 0 && typeof data[0].order_num === 'number') {
      return Math.max(1, data[0].order_num + 1);
    }
    return 1;
  } catch (err) {
    return 1;
  }
}

/**
 * Membuat banner baru dengan validasi nomor urut >= 1 dan otomatisasi nomor urut berikutnya.
 */
export async function createBanner(payload: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>): Promise<HeroBanner> {
  const supabase = await createServerClient();
  
  let orderNum = payload.order_num;
  if (!orderNum || orderNum < 1) {
    orderNum = await getNextBannerOrder();
  }

  const { data, error } = await supabase
    .from('hero_banners')
    .insert([{
      ...payload,
      order_num: orderNum,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membuat banner: ${error.message}`);
  }

  await invalidateCache('homepage:banners:active');
  return data;
}

/**
 * Memperbarui banner.
 */
export async function updateBanner(id: string, payload: Partial<HeroBanner>): Promise<HeroBanner> {
  const supabase = await createServerClient();
  
  const updateData: any = {
    ...payload,
    updated_at: new Date().toISOString()
  };

  if (payload.order_num !== undefined) {
    updateData.order_num = Math.max(1, payload.order_num);
  }

  const { data, error } = await supabase
    .from('hero_banners')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui banner: ${error.message}`);
  }

  await invalidateCache('homepage:banners:active');
  return data;
}

/**
 * Menghapus banner.
 */
export async function deleteBanner(id: string): Promise<boolean> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('hero_banners')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Gagal menghapus banner: ${error.message}`);
  }

  await invalidateCache('homepage:banners:active');
  return true;
}

/**
 * Mengubah status aktif/non-aktif banner.
 */
export async function toggleBannerStatus(id: string, is_active: boolean): Promise<boolean> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('hero_banners')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Gagal mengubah status banner: ${error.message}`);
  }

  await invalidateCache('homepage:banners:active');
  return true;
}
