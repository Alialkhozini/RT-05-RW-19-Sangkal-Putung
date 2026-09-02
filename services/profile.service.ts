import { createServerClient, createAdminClient } from '@/lib/supabase';
import { getCache, setCache, invalidateCache } from '@/lib/redis';

// TTL Cache (1 Jam)
const PROFILE_TTL = 3600;

export interface SiteSettings {
  id: number;
  website_name: string;
  tagline: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  social_media?: any;
  logo_url?: string;
  favicon_url?: string;
  rt_info?: string;
  letter_format?: string;
  signature_url?: string;
  stamp_url?: string;
}

export interface HeroContent {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  cta_text: string;
  secondary_cta_text: string;
  image_url?: string;
}

export interface RtProfile {
  id: number;
  welcome_title: string;
  welcome_message: string;
  chairman_name: string;
  chairman_position: string;
  chairman_photo_url?: string;
  signature_url?: string;
}

export interface RtOfficer {
  id: string;
  name: string;
  position: string;
  photo_url?: string;
  description?: string;
  order_num: number;
}

export interface RtHistory {
  id: string;
  year: string;
  title: string;
  description: string;
  image_url?: string;
  order_num: number;
}

// ----------------------------------------------------
// 1. SITE SETTINGS SERVICE
// ----------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const cacheKey = 'site:settings';
  const cached = await getCache<SiteSettings>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    // Default fallback
    return {
      id: 1,
      website_name: 'RT 05 RW 19 Sangkal Putung',
      tagline: 'Bersama Membangun Lingkungan yang Nyaman dan Terhubung',
      address: 'RT 05 RW 19, Sangkal Putung, Kelurahan Brebes',
      letter_format: '{{number}}/RT05-RW19/{{month}}/{{year}}',
    };
  }

  await setCache(cacheKey, data, PROFILE_TTL);
  return data;
}

export async function updateSiteSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('site_settings')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  await invalidateCache('site:settings');
  return data;
}

// ----------------------------------------------------
// 2. HERO CONTENT SERVICE
// ----------------------------------------------------
export async function getHeroContent(): Promise<HeroContent> {
  const cacheKey = 'homepage:hero';
  const cached = await getCache<HeroContent>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return {
      id: 1,
      badge: 'WEBSITE RESMI RT 05 RW 19',
      title: 'Selamat Datang di Website RT 05 RW 19',
      subtitle: 'Pusat informasi dan layanan masyarakat RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.',
      cta_text: 'Ajukan Surat',
      secondary_cta_text: 'Lapor RT',
    };
  }

  await setCache(cacheKey, data, PROFILE_TTL);
  return data;
}

export async function updateHeroContent(payload: Partial<HeroContent>): Promise<HeroContent> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('hero_content')
    .update(payload)
    .eq('id', 1)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await invalidateCache('homepage:hero');
  return data;
}

// ----------------------------------------------------
// 3. RT PROFILE SERVICE (Sambutan Ketua RT)
// ----------------------------------------------------
export async function getRtProfile(): Promise<RtProfile> {
  const cacheKey = 'rt:profile';
  const cached = await getCache<RtProfile>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_profile')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return {
      id: 1,
      welcome_title: 'Sambutan Ketua RT 05 RW 19',
      welcome_message: 'Selamat Datang di Website RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.',
      chairman_name: 'Bpk. Budi Santoso',
      chairman_position: 'Ketua RT 05 RW 19',
    };
  }

  await setCache(cacheKey, data, PROFILE_TTL);
  return data;
}

export async function updateRtProfile(payload: Partial<RtProfile>): Promise<RtProfile> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_profile')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await invalidateCache('rt:profile');
  return data;
}

// ----------------------------------------------------
// 4. OFFICERS SERVICE (Susunan Pengurus)
// ----------------------------------------------------
export async function getOfficers(): Promise<RtOfficer[]> {
  const cacheKey = 'rt:officers';
  const cached = await getCache<RtOfficer[]>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_officers')
    .select('*')
    .order('order_num', { ascending: true });

  if (error) return [];

  await setCache(cacheKey, data, PROFILE_TTL);
  return data;
}

export async function addOfficer(officer: Omit<RtOfficer, 'id'>): Promise<RtOfficer> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_officers')
    .insert([officer])
    .select()
    .single();

  if (error) throw new Error(error.message);

  await invalidateCache('rt:officers');
  return data;
}

export async function updateOfficer(id: string, payload: Partial<RtOfficer>): Promise<RtOfficer> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_officers')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await invalidateCache('rt:officers');
  return data;
}

export async function deleteOfficer(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('rt_officers')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  await invalidateCache('rt:officers');
}

// ----------------------------------------------------
// 5. HISTORY SERVICE (Sejarah Lini Masa)
// ----------------------------------------------------
export async function getHistory(): Promise<RtHistory[]> {
  const cacheKey = 'rt:history';
  const cached = await getCache<RtHistory[]>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_history')
    .select('*')
    .order('order_num', { ascending: true });

  if (error) return [];

  await setCache(cacheKey, data, PROFILE_TTL);
  return data;
}

export async function addHistory(history: Omit<RtHistory, 'id'>): Promise<RtHistory> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_history')
    .insert([history])
    .select()
    .single();

  if (error) throw new Error(error.message);

  await invalidateCache('rt:history');
  return data;
}

export async function updateHistory(id: string, payload: Partial<RtHistory>): Promise<RtHistory> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('rt_history')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await invalidateCache('rt:history');
  return data;
}

export async function deleteHistory(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('rt_history')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  await invalidateCache('rt:history');
}
