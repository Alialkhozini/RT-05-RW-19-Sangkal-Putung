import NewsForm from '@/components/admin/NewsForm';

export default function AdminAddNewsPage() {
  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-dark tracking-tight">Tulis Berita Warga</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Buat publikasi kabar, kegiatan, atau agenda rapat terbaru di lingkungan RT 05 RW 19.</p>
      </div>

      <div className="mt-4">
        <NewsForm />
      </div>
    </div>
  );
}
