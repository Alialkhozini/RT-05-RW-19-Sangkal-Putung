import { getOfficers } from '@/services/profile.service';
import OfficerManager from '@/components/admin/OfficerManager';

export const revalidate = 0; // Realtime

export default async function AdminOfficersPage() {
  const officers = await getOfficers();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Susunan Pengurus RT</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Kelola daftar pengurus wilayah RT 05 RW 19 Sangkal Putung (Sekretaris, Bendahara, Seksi-seksi).</p>
      </div>

      <div className="mt-4">
        <OfficerManager initialOfficers={officers} />
      </div>
    </div>
  );
}
