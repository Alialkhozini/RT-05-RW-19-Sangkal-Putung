'use client';

import React from 'react';
import InteractiveDonutChart, { ChartSegment } from './InteractiveDonutChart';
import { Users, Home, FileText, CheckCircle, Info, Sparkles } from 'lucide-react';

export default function DemographicStatistics() {
  // Data Demografi Jenis Kelamin
  const genderData: ChartSegment[] = [
    {
      label: 'Laki-laki',
      value: 85,
      color: '#2563EB', // Blue
      unit: 'orang',
    },
    {
      label: 'Perempuan',
      value: 75,
      color: '#EC4899', // Pink
      unit: 'orang',
    },
  ];

  // Data Status Hubungan dalam Keluarga (Status KK)
  const familyStatusData: ChartSegment[] = [
    {
      label: 'Kepala Keluarga',
      value: 48,
      color: '#8B5CF6', // Purple
      unit: 'orang',
    },
    {
      label: 'Istri',
      value: 44,
      color: '#EC4899', // Pink
      unit: 'orang',
    },
    {
      label: 'Anak',
      value: 62,
      color: '#3B82F6', // Blue
      unit: 'orang',
    },
    {
      label: 'Anggota Keluarga',
      value: 6,
      color: '#F59E0B', // Amber
      unit: 'orang',
    },
  ];

  const quickStats = [
    { label: 'Total Warga', value: '160 Jiwa', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Kepala Keluarga', value: '48 KK', icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Layanan Mandiri', value: '24 Jam', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tindak Lanjut', value: '98%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-10">
      {/* 2 Kolom Chart Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Kartu 1: Total Warga Berdasarkan Jenis Kelamin */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md hover:shadow-xl border border-neutral-gray/70 transition-all duration-300 flex flex-col items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-pink-100/40 rounded-full blur-2xl -z-10 group-hover:scale-125 transition-transform duration-500" />
          
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Demografi Gender
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-dark text-center mb-6">
            Rasio Gender Warga
          </h3>

          <InteractiveDonutChart
            data={genderData}
            centerLabel="Warga"
            centerValue={160}
            unit="orang"
            tooltipTheme="dark"
          />

          <div className="mt-8 pt-4 border-t border-neutral-gray/60 w-full flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Rasio Pria: 53.1%</span>
            <span>Rasio Wanita: 46.9%</span>
          </div>
        </div>

        {/* Kartu 2: Status Hubungan dalam Keluarga (Status KK) */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md hover:shadow-xl border border-neutral-gray/70 transition-all duration-300 flex flex-col items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/40 to-amber-100/40 rounded-full blur-2xl -z-10 group-hover:scale-125 transition-transform duration-500" />
          
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Home className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Struktur Kependudukan
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-dark text-center mb-6">
            Rasio Status Kartu Keluarga
          </h3>

          <InteractiveDonutChart
            data={familyStatusData}
            centerLabel="Total KK"
            centerValue={48}
            unit="orang"
            tooltipTheme="light"
          />

          <div className="mt-8 pt-4 border-t border-neutral-gray/60 w-full flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Total Terdaftar: 48 KK</span>
            <span>4 Kategori Kependudukan</span>
          </div>
        </div>
      </div>

      {/* Petunjuk Interaksi */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-white/80 py-2 px-4 rounded-full border border-neutral-gray/60 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
        <span>Arahkan kursor atau sentuh segmen lingkaran untuk melihat rincian angka & persentase.</span>
      </div>

      {/* Ringkasan Ringkas 4 Metrik Pendukung */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl">
        {quickStats.map((stat) => {
          const IconComp = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md border border-neutral-gray/60 flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <IconComp className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base md:text-lg font-extrabold text-dark tracking-tight leading-tight">
                  {stat.value}
                </span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
