import BannerForm from '@/components/admin/BannerForm';
import { getNextBannerOrder } from '@/services/banner.service';

export default async function AddBannerPage() {
  const nextOrder = await getNextBannerOrder();

  return (
    <div>
      <BannerForm initialData={{ order_num: nextOrder }} />
    </div>
  );
}
