'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Home, 
  Save, 
  RefreshCw, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { RtDemographics } from '@/types/demographics';
import { saveDemographicsAction } from '@/app/actions/admin.actions';

interface DemographicsFormProps {
  initialData: RtDemographics;
}

export default function DemographicsForm({ initialData }: DemographicsFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<RtDemographics>({
    ...initialData,
    male_count: Number(initialData.male_count) || 85,
    female_count: Number(initialData.female_count) || 75,
    family_heads_count: Number(initialData.family_heads_count) || 48,
    wives_count: Number(initialData.wives_count) || 44,
    children_count: Number(initialData.children_count) || 62,
    other_members_count: Number(initialData.other_members_count) || 6,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Perhitungan Realtime
  const totalWargaCalc = Number(formData.male_count) + Number(formData.female_count);
  const malePct = totalWargaCalc > 0 ? ((Number(formData.male_count) / totalWargaCalc) * 100).toFixed(1) : '0';
  const femalePct = totalWargaCalc > 0 ? ((Number(formData.female_count) / totalWargaCalc) * 100).toFixed(1) : '0';

  const totalKKMembers = 
    Number(formData.family_heads_count) + 
    Number(formData.wives_count) + 
    Number(formData.children_count) + 
    Number(formData.other_members_count);

  const handleNumberChange = (field: keyof RtDemographics, rawValue: string) => {
    // Hanya izinkan angka positif 0-9 (cegah minus dan karakter non-digit)
    const cleanDigits = rawValue.replace(/\D/g, '');
    const num = cleanDigits === '' ? 0 : parseInt(cleanDigits, 10);
    setFormData((prev) => ({ ...prev, [field]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await saveDemographicsAction({
        ...formData,
        quick_total_warga: `${totalWargaCalc} Jiwa`,
        quick_total_kk: `${formData.family_heads_count} KK`,
        quick_layanan_mandiri: '24 Jam',
        quick_tindak_lanjut: '98%',
      });

      if (res?.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError('Gagal menyimpan data statistik demografi.');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
      {/* Notifikasi Status */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-extrabold">Perubahan Berhasil Disimpan!</p>
            <p className="text-xs text-emerald-600 font-medium">Data statistik demografi di halaman website warga telah diperbarui.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-extrabold">Gagal Menyimpan</p>
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* 2 Kolom Form Utama Sesuai Desain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Data Demografi Gender */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-gray/70 shadow-sm flex flex-col justify-between gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-gray/60">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-dark leading-tight">Data Demografi Jenis Kelamin</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Jumlah jiwa penduduk berdasarkan gender</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Jumlah Laki-laki <span className="text-blue-600 font-semibold">(orang)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.male_count}
                  onChange={(e) => handleNumberChange('male_count', e.target.value)}
                  onKeyDown={(e) => { if (['-', 'e', 'E', '+', '.'].includes(e.key)) e.preventDefault(); }}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-gray focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-dark transition-all"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  {malePct}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Jumlah Perempuan <span className="text-pink-600 font-semibold">(orang)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.female_count}
                  onChange={(e) => handleNumberChange('female_count', e.target.value)}
                  onKeyDown={(e) => { if (['-', 'e', 'E', '+', '.'].includes(e.key)) e.preventDefault(); }}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-gray focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-dark transition-all"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  {femalePct}%
                </span>
              </div>
            </div>

            {/* Rekap Total Otomatis */}
            <div className="mt-2 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">Total Warga (Kalkulasi):</span>
              <span className="text-base font-extrabold text-blue-700">{totalWargaCalc} Jiwa</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Data Status Kartu Keluarga */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-gray/70 shadow-sm flex flex-col justify-between gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-gray/60">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-dark leading-tight">Data Status Hubungan Keluarga</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Rincian status kedudukan dalam Kartu Keluarga (KK)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Kepala Keluarga <span className="text-purple-600 font-semibold">(KK)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.family_heads_count}
                onChange={(e) => handleNumberChange('family_heads_count', e.target.value)}
                onKeyDown={(e) => { if (['-', 'e', 'E', '+', '.'].includes(e.key)) e.preventDefault(); }}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-gray focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-dark transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Istri <span className="text-pink-600 font-semibold">(orang)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.wives_count}
                onChange={(e) => handleNumberChange('wives_count', e.target.value)}
                onKeyDown={(e) => { if (['-', 'e', 'E', '+', '.'].includes(e.key)) e.preventDefault(); }}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-gray focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-dark transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Anak <span className="text-blue-600 font-semibold">(orang)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.children_count}
                onChange={(e) => handleNumberChange('children_count', e.target.value)}
                onKeyDown={(e) => { if (['-', 'e', 'E', '+', '.'].includes(e.key)) e.preventDefault(); }}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-gray focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-dark transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Anggota Lainnya <span className="text-amber-600 font-semibold">(orang)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.other_members_count}
                onChange={(e) => handleNumberChange('other_members_count', e.target.value)}
                onKeyDown={(e) => { if (['-', 'e', 'E', '+', '.'].includes(e.key)) e.preventDefault(); }}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-gray focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-dark transition-all"
                required
              />
            </div>
          </div>

          <div className="mt-2 p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">Total Terdata di KK:</span>
            <span className="text-base font-extrabold text-purple-700">{totalKKMembers} Jiwa ({formData.family_heads_count} KK)</span>
          </div>
        </div>
      </div>

      {/* ================= TOMBOL SIMPAN ================= */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover active:bg-red-800 text-white text-xs font-extrabold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyimpan Data...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Statistik</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
