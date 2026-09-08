export interface RtDemographics {
  id: number;
  // Gender
  male_count: number;
  female_count: number;
  // Status Kartu Keluarga
  family_heads_count: number;
  wives_count: number;
  children_count: number;
  other_members_count: number;
  // 4 Kartu Metrik Ringkas
  quick_total_warga: string;
  quick_total_kk: string;
  quick_layanan_mandiri: string;
  quick_tindak_lanjut: string;
  updated_at?: string;
}

export const DEFAULT_DEMOGRAPHICS: RtDemographics = {
  id: 1,
  male_count: 85,
  female_count: 75,
  family_heads_count: 48,
  wives_count: 44,
  children_count: 62,
  other_members_count: 6,
  quick_total_warga: '160 Jiwa',
  quick_total_kk: '48 KK',
  quick_layanan_mandiri: '24 Jam',
  quick_tindak_lanjut: '98%',
};
