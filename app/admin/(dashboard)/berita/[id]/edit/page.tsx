import { notFound } from 'next/navigation';
import { getNewsById } from '@/services/news.service';
import NewsForm from '@/components/admin/NewsForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Realtime

export default async function AdminEditNewsPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const newsItem = await getNewsById(id);

  if (!newsItem) {
    notFound();
  }

  // Format data awal untuk dikirim ke formulir edit
  const initialData = {
    title: newsItem.title,
    slug: newsItem.slug,
    excerpt: newsItem.excerpt || undefined,
    content: newsItem.content,
    cover_image: newsItem.cover_image || undefined,
    category: newsItem.category || undefined,
    status: newsItem.status as 'draft' | 'published',
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Edit Artikel Berita</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Perbaiki isi konten, ubah kategori, atau ganti foto sampul berita warga.</p>
      </div>

      <div className="mt-4">
        <NewsForm newsId={id} initialData={initialData} />
      </div>
    </div>
  );
}
