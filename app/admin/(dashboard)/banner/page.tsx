import { getAllBannersAdmin } from '@/services/banner.service';
import AdminBannerList from '@/components/admin/AdminBannerList';

export const revalidate = 0; // Data termuat realtime di dasbor admin

export default async function AdminBannerPage() {
  const banners = await getAllBannersAdmin();

  return (
    <div>
      <AdminBannerList initialBanners={banners} />
    </div>
  );
}
