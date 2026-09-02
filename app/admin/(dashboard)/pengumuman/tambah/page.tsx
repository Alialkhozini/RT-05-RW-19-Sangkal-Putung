import AnnouncementForm from '@/components/admin/AnnouncementForm';

export default function AdminAddAnnouncementPage() {
  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Buat Pengumuman Baru</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Tulis edaran resmi, jadwal ronda malam, info kerja bakti, dll.</p>
      </div>

      <div className="mt-4">
        <AnnouncementForm />
      </div>
    </div>
  );
}
