import { notFound } from 'next/navigation';
import { getAnnouncementById } from '@/services/announcement.service';
import AnnouncementForm from '@/components/admin/AnnouncementForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Realtime

export default async function AdminEditAnnouncementPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  // Format data awal untuk dikirim ke formulir edit
  const initialData = {
    title: announcement.title,
    slug: announcement.slug,
    content: announcement.content,
    status: announcement.status as 'draft' | 'published',
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Edit Edaran Pengumuman</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Perbaiki detail pengumuman, sesuaikan ringkasan, atau kelola status sematan.</p>
      </div>

      <div className="mt-4">
        <AnnouncementForm annId={id} initialData={initialData} />
      </div>
    </div>
  );
}
