import { getRtProfile } from '@/services/profile.service';
import SambutanForm from '@/components/admin/SambutanForm';

export const revalidate = 0; // Realtime

export default async function AdminSambutanPage() {
  const profile = await getRtProfile();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Sambutan Ketua RT</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Kelola foto formal ketua RT, nama lengkap, serta pesan sambutan selamat datang untuk website warga.</p>
      </div>

      <div className="mt-4">
        <SambutanForm initialData={profile} />
      </div>
    </div>
  );
}
