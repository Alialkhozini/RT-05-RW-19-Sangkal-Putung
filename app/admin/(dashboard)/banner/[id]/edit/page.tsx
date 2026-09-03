import { notFound } from 'next/navigation';
import BannerForm from '@/components/admin/BannerForm';
import { getBannerById } from '@/services/banner.service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage(props: PageProps) {
  const params = await props.params;
  const banner = await getBannerById(params.id);

  if (!banner) {
    notFound();
  }

  return (
    <div>
      <BannerForm initialData={banner} />
    </div>
  );
}
