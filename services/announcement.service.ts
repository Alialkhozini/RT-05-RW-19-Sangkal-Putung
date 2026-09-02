import { createServerClient } from '@/lib/supabase';
import { getCache, setCache, invalidateCache, invalidateCachePattern } from '@/lib/redis';

const ANNOUNCEMENT_TTL = 900; // 15 Menit

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  attachment_url?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mengambil pengumuman yang dipublikasikan (Publik).
 */
export async function getPublishedAnnouncements(
  page: number = 1,
  limit: number = 6,
  query: string = ''
): Promise<{ announcements: Announcement[]; total: number }> {
  const isCacheable = !query;
  const cacheKey = `announcements:list:${page}:${limit}`;

  if (isCacheable) {
    const cached = await getCache<{ announcements: Announcement[]; total: number }>(cacheKey);
    if (cached) return cached;
  }

  const supabase = await createServerClient();
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
  }

  const { data, count, error } = await dbQuery;

  if (error || !data) {
    return { announcements: [], total: 0 };
  }

  const result = { announcements: data as Announcement[], total: count || 0 };

  if (isCacheable) {
    await setCache(cacheKey, result, ANNOUNCEMENT_TTL);
  }

  return result;
}

/**
 * Mengambil detail pengumuman berdasarkan slug (Publik).
 */
export async function getAnnouncementBySlug(slug: string): Promise<Announcement | null> {
  const cacheKey = `announcement:${slug}`;
  const cached = await getCache<Announcement>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;

  await setCache(cacheKey, data, ANNOUNCEMENT_TTL);
  return data;
}

/**
 * Mengambil semua pengumuman untuk keperluan admin.
 */
export async function getAllAnnouncementsForAdmin(): Promise<Announcement[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Announcement[];
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Announcement;
}

/**
 * Membuat pengumuman baru.
 */
export async function createAnnouncement(
  payload: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>
): Promise<Announcement> {
  const supabase = await createServerClient();
  
  const published_at = payload.status === 'published' ? new Date().toISOString() : undefined;
  
  const { data, error } = await supabase
    .from('announcements')
    .insert([{ ...payload, published_at }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Invalidate list cache
  await invalidateCachePattern('announcements:list:*');
  return data as Announcement;
}

/**
 * Memperbarui pengumuman.
 */
export async function updateAnnouncement(
  id: string,
  payload: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>
): Promise<Announcement> {
  const supabase = await createServerClient();
  
  const oldAnn = await getAnnouncementById(id);
  const oldSlug = oldAnn?.slug;

  const updatePayload = { ...payload, updated_at: new Date().toISOString() };
  
  if (payload.status === 'published' && oldAnn?.status === 'draft') {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('announcements')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Hapus cache list dan detail
  await invalidateCachePattern('announcements:list:*');
  if (oldSlug) await invalidateCache(`announcement:${oldSlug}`);
  if (data.slug) await invalidateCache(`announcement:${data.slug}`);

  return data as Announcement;
}

/**
 * Menghapus pengumuman.
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = await createServerClient();
  const oldAnn = await getAnnouncementById(id);
  const slug = oldAnn?.slug;

  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw new Error(error.message);

  // Hapus cache list dan detail
  await invalidateCachePattern('announcements:list:*');
  if (slug) await invalidateCache(`announcement:${slug}`);
}
