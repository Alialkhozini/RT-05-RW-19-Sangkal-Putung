import { createServerClient } from '@/lib/supabase';
import { getCache, setCache, invalidateCache, invalidateCachePattern } from '@/lib/redis';

const NEWS_TTL = 900; // 15 Menit

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mengambil berita yang dipublikasikan untuk halaman utama dan daftar berita publik.
 */
export async function getPublishedNews(
  page: number = 1,
  limit: number = 6,
  query: string = '',
  category: string = ''
): Promise<{ news: News[]; total: number }> {
  // Hanya lakukan caching jika tidak ada pencarian kata kunci (query)
  const isCacheable = !query;
  const cacheKey = `news:list:${page}:${limit}:${category || 'all'}`;

  if (isCacheable) {
    const cached = await getCache<{ news: News[]; total: number }>(cacheKey);
    if (cached) return cached;
  }

  const supabase = await createServerClient();
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('news')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`);
  }

  const { data, count, error } = await dbQuery;

  if (error || !data) {
    return { news: [], total: 0 };
  }

  const result = { news: data as News[], total: count || 0 };

  if (isCacheable) {
    await setCache(cacheKey, result, NEWS_TTL);
  }

  return result;
}

/**
 * Mengambil detail berita berdasarkan slug (halaman publik).
 */
export async function getNewsBySlug(slug: string): Promise<News | null> {
  const cacheKey = `news:${slug}`;
  const cached = await getCache<News>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;

  await setCache(cacheKey, data, NEWS_TTL);
  return data;
}

/**
 * Mengambil semua berita (draft & published) untuk keperluan admin.
 */
export async function getAllNewsForAdmin(): Promise<News[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as News[];
}

export async function getNewsById(id: string): Promise<News | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as News;
}

/**
 * Membuat berita baru.
 */
export async function createNews(payload: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> {
  const supabase = await createServerClient();
  
  const published_at = payload.status === 'published' ? new Date().toISOString() : undefined;
  
  const { data, error } = await supabase
    .from('news')
    .insert([{ ...payload, published_at }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Invalidate list cache
  await invalidateCachePattern('news:list:*');
  return data as News;
}

/**
 * Memperbarui berita.
 */
export async function updateNews(
  id: string,
  payload: Partial<Omit<News, 'id' | 'created_at' | 'updated_at'>>
): Promise<News> {
  const supabase = await createServerClient();
  
  // Ambil slug berita lama untuk menghapus cache slug lama
  const oldNews = await getNewsById(id);
  const oldSlug = oldNews?.slug;

  const updatePayload = { ...payload, updated_at: new Date().toISOString() };
  
  // Jika berubah dari draft ke published
  if (payload.status === 'published' && oldNews?.status === 'draft') {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('news')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Hapus cache list dan detail
  await invalidateCachePattern('news:list:*');
  if (oldSlug) await invalidateCache(`news:${oldSlug}`);
  if (data.slug) await invalidateCache(`news:${data.slug}`);

  return data as News;
}

/**
 * Menghapus berita.
 */
export async function deleteNews(id: string): Promise<void> {
  const supabase = await createServerClient();
  const oldNews = await getNewsById(id);
  const slug = oldNews?.slug;

  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw new Error(error.message);

  // Hapus cache list dan detail
  await invalidateCachePattern('news:list:*');
  if (slug) await invalidateCache(`news:${slug}`);
}
