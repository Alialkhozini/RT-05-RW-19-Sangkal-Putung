import { createServerClient } from '@/lib/supabase';
import { getCache, setCache, invalidateCache } from '@/lib/redis';
import { RtDemographics, DEFAULT_DEMOGRAPHICS } from '@/types/demographics';

export { DEFAULT_DEMOGRAPHICS };
export type { RtDemographics };

// TTL Cache (1 Jam)
const DEMOGRAPHICS_TTL = 3600;

/**
 * Mengambil data demografi & statistik RT
 */
export async function getDemographics(): Promise<RtDemographics> {
  const cacheKey = 'rt:demographics';
  const cached = await getCache<RtDemographics>(cacheKey);
  if (cached) return cached;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('rt_demographics')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_DEMOGRAPHICS;
    }

    await setCache(cacheKey, data, DEMOGRAPHICS_TTL);
    return data;
  } catch {
    return DEFAULT_DEMOGRAPHICS;
  }
}

/**
 * Memperbarui data demografi & statistik RT (Admin only)
 */
export async function updateDemographics(
  payload: Partial<Omit<RtDemographics, 'id'>>
): Promise<RtDemographics> {
  const supabase = await createServerClient();

  const dataToSave = {
    ...payload,
    id: 1,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('rt_demographics')
    .upsert(dataToSave, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan data statistik demografi: ${error.message}`);
  }

  await invalidateCache('rt:demographics');
  return data;
}
