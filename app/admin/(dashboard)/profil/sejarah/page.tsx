import { getHistory } from '@/services/profile.service';
import HistoryManager from '@/components/admin/HistoryManager';

export const revalidate = 0; // Realtime

export default async function AdminHistoryPage() {
  const history = await getHistory();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Lini Masa Sejarah RT</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Kelola lini masa rekam jejak pembangunan, pencapaian prestasi, dan sejarah berdirinya RT 05 RW 19.</p>
      </div>

      <div className="mt-4">
        <HistoryManager initialHistory={history} />
      </div>
    </div>
  );
}
