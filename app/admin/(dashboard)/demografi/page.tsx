import { getDemographics } from '@/services/demographic.service';
import DemographicsForm from '@/components/admin/DemographicsForm';
import { PieChart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Data termuat realtime di dasbor admin

export const metadata = {
  title: 'Manajemen Demografi & Statistik | Admin RT 05 RW 19',
};

export default async function AdminDemografiPage() {
  const demographics = await getDemographics();

  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-gray/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-primary/10 text-primary">
              <PieChart className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Statistik Kependudukan
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight">
            Manajemen Demografi & Statistik Warga
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Kelola rasio gender (laki-laki/perempuan), status hubungan keluarga (KK), dan metrik pelayanan digital yang tampil di beranda website warga.
          </p>
        </div>

        <Link
          href="/#statistik-wilayah"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-gray hover:bg-neutral-bg text-xs font-bold text-dark transition-colors shrink-0 self-start sm:self-center shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Lihat di Website</span>
        </Link>
      </div>

      {/* Form Manajemen Demografi */}
      <DemographicsForm initialData={demographics} />
    </div>
  );
}
