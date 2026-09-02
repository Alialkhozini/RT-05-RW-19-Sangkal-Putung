import SettingsForm from '@/components/admin/SettingsForm';
import { getSiteSettings } from '@/services/profile.service';

export const revalidate = 0; // Memuat data terbaru secara realtime

export default async function AdminSettingsPage() {
  const initialSettings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Pengaturan & Branding Website</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Konfigurasikan detail alamat sekretariat RT, WhatsApp pelayanan, stempel stiker, stempel cap basah, dan tanda tangan elektronik Ketua RT.</p>
      </div>

      <div className="mt-4">
        <SettingsForm initialSettings={initialSettings} />
      </div>
    </div>
  );
}
