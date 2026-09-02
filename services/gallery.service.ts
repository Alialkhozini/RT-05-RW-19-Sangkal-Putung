import { createServerClient } from '@/lib/supabase';
import { getCache, setCache, invalidateCache } from '@/lib/redis';

const GALLERY_TTL = 1800; // 30 Menit

export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mengambil seluruh item galeri (Publik & Admin).
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const cacheKey = 'gallery:list';
  const cached = await getCache<GalleryItem[]>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  await setCache(cacheKey, data, GALLERY_TTL);
  return data as GalleryItem[];
}

/**
 * Menambahkan foto galeri baru.
 */
export async function addGalleryItem(payload: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryItem> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('galleries')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);

  await invalidateCache('gallery:list');
  return data as GalleryItem;
}

/**
 * Menghapus foto galeri.
 */
export async function deleteGalleryItem(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('galleries').delete().eq('id', id);
  if (error) throw new Error(error.message);

  await invalidateCache('gallery:list');
}
