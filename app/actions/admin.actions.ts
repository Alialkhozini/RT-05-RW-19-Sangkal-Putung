'use server';

import { createServerClient } from '@/lib/supabase';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { adminUpdateReportStatus } from '@/services/report.service';
import { 
  createNews, 
  updateNews, 
  deleteNews, 
  getNewsById 
} from '@/services/news.service';
import { 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  getAnnouncementById 
} from '@/services/announcement.service';
import { addGalleryItem, deleteGalleryItem } from '@/services/gallery.service';
import { 
  updateRtProfile, 
  addOfficer, 
  updateOfficer, 
  deleteOfficer,
  addHistory,
  updateHistory,
  deleteHistory,
  updateSiteSettings
} from '@/services/profile.service';
import {
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  getBannerById
} from '@/services/banner.service';

// ----------------------------------------------------
// HELPER: VERIFIKASI KEAMANAN & ROLE ADMIN
// ----------------------------------------------------
async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Akses ditolak. Silakan login sebagai admin.');
  }

  // Verifikasi ke tabel profiles untuk memastikan role = admin
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Akses ditolak. Akun Anda tidak memiliki izin admin.');
  }

  return { supabase, user };
}

// HELPER: LOG AKTIVITAS ADMIN (Audit Trail)
async function logActivity(
  supabase: any,
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  description: string
) {
  try {
    await supabase.from('admin_activity_logs').insert([
      {
        admin_id: adminId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        description,
      }
    ]);
  } catch (err) {
    console.error('Gagal menyimpan audit log aktivitas:', err);
  }
}

// Helper untuk dekonstruksi dan unggah foto base64 ke Cloudinary
async function handleCloudinaryUpload(base64Data: string, folder: string): Promise<string> {
  const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Format foto tidak valid.');
  }
  const base64Content = matches[2];
  const buffer = Buffer.from(base64Content, 'base64');
  const uploadResult = await uploadToCloudinary(buffer, folder);
  return uploadResult.secure_url;
}

// ----------------------------------------------------
// 1. CMS BERITA (NEWS CRUD ACTIONS)
// ----------------------------------------------------
export async function saveNewsAction(id: string | null, payload: any, coverImageBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  let cover_image = payload.cover_image;

  // Jika ada unggahan gambar sampul baru
  if (coverImageBase64) {
    cover_image = await handleCloudinaryUpload(coverImageBase64, 'news');
    // Hapus foto lama dari Cloudinary jika ada dan berbeda
    if (payload.cover_image && payload.cover_image.includes('cloudinary.com')) {
      const publicId = payload.cover_image.split('/').pop()?.split('.')[0];
      if (publicId) await deleteFromCloudinary(`news/${publicId}`);
    }
  }

  let result;
  if (id) {
    result = await updateNews(id, { ...payload, cover_image });
    await logActivity(supabase, user.id, 'NEWS_UPDATED', 'news', id, `Memperbarui berita: "${payload.title}"`);
  } else {
    result = await createNews({ ...payload, cover_image });
    await logActivity(supabase, user.id, 'NEWS_CREATED', 'news', result.id, `Membuat berita baru: "${payload.title}"`);
  }

  return { success: true, news: result };
}

export async function deleteNewsAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  const existing = await getNewsById(id);

  if (existing?.cover_image && existing.cover_image.includes('cloudinary.com')) {
    const publicId = existing.cover_image.split('/').pop()?.split('.')[0];
    if (publicId) await deleteFromCloudinary(`news/${publicId}`);
  }

  await deleteNews(id);
  await logActivity(supabase, user.id, 'NEWS_DELETED', 'news', id, `Menghapus berita: "${existing?.title || id}"`);
  return { success: true };
}

// ----------------------------------------------------
// 2. CMS PENGUMUMAN (ANNOUNCEMENTS CRUD ACTIONS)
// ----------------------------------------------------
export async function saveAnnouncementAction(id: string | null, payload: any) {
  const { supabase, user } = await verifyAdmin();
  let result;

  if (id) {
    result = await updateAnnouncement(id, payload);
    await logActivity(supabase, user.id, 'ANNOUNCEMENT_UPDATED', 'announcements', id, `Memperbarui pengumuman: "${payload.title}"`);
  } else {
    result = await createAnnouncement(payload);
    await logActivity(supabase, user.id, 'ANNOUNCEMENT_CREATED', 'announcements', result.id, `Membuat pengumuman baru: "${payload.title}"`);
  }

  return { success: true, announcement: result };
}

export async function deleteAnnouncementAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  const existing = await getAnnouncementById(id);

  await deleteAnnouncement(id);
  await logActivity(supabase, user.id, 'ANNOUNCEMENT_DELETED', 'announcements', id, `Menghapus pengumuman: "${existing?.title || id}"`);
  return { success: true };
}

// ----------------------------------------------------
// 3. CMS GALERI KEGIATAN (GALLERY CRUD ACTIONS)
// ----------------------------------------------------
export async function saveGalleryAction(payload: any, imageBase64: string) {
  const { supabase, user } = await verifyAdmin();
  const image_url = await handleCloudinaryUpload(imageBase64, 'gallery');

  const result = await addGalleryItem({
    ...payload,
    image_url,
  });

  await logActivity(supabase, user.id, 'GALLERY_CREATED', 'galleries', result.id, `Menambahkan foto galeri: "${payload.title}"`);
  return { success: true, item: result, gallery: result };
}

export async function deleteGalleryAction(id: string, imageUrl?: string) {
  const { supabase, user } = await verifyAdmin();

  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    if (publicId) await deleteFromCloudinary(`gallery/${publicId}`);
  }

  await deleteGalleryItem(id);
  await logActivity(supabase, user.id, 'GALLERY_DELETED', 'galleries', id, 'Menghapus item foto galeri');
  return { success: true };
}

// ----------------------------------------------------
// 4. CMS PROFIL & INFORMASI RT
// ----------------------------------------------------
export async function saveRtProfileAction(payload: any, chairmanPhotoBase64?: string, signatureBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  let chairman_photo_url = payload.chairman_photo_url;
  let signature_url = payload.signature_url;

  if (chairmanPhotoBase64) {
    chairman_photo_url = await handleCloudinaryUpload(chairmanPhotoBase64, 'officers');
  }

  if (signatureBase64) {
    signature_url = await handleCloudinaryUpload(signatureBase64, 'signatures');
  }

  const result = await updateRtProfile({
    ...payload,
    chairman_photo_url,
    signature_url,
  });

  await logActivity(supabase, user.id, 'PROFILE_UPDATED', 'rt_profile', '1', 'Memperbarui profil & sambutan ketua RT');
  return { success: true, profile: result };
}

export async function saveOfficerAction(id: string | null, payload: any, photoBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  let photo_url = payload.photo_url;

  if (photoBase64) {
    photo_url = await handleCloudinaryUpload(photoBase64, 'officers');
  }

  let result;
  if (id) {
    result = await updateOfficer(id, { ...payload, photo_url });
    await logActivity(supabase, user.id, 'OFFICER_UPDATED', 'rt_officers', id, `Memperbarui pengurus: "${payload.name}"`);
  } else {
    result = await addOfficer({ ...payload, photo_url });
    await logActivity(supabase, user.id, 'OFFICER_CREATED', 'rt_officers', result.id, `Menambahkan pengurus baru: "${payload.name}"`);
  }

  return { success: true, officer: result };
}

export async function deleteOfficerAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  await deleteOfficer(id);
  await logActivity(supabase, user.id, 'OFFICER_DELETED', 'rt_officers', id, 'Menghapus pengurus RT');
  return { success: true };
}

export async function saveHistoryAction(id: string | null, payload: any, imageBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  let image_url = payload.image_url;

  if (imageBase64) {
    image_url = await handleCloudinaryUpload(imageBase64, 'history');
  }

  let result;
  if (id) {
    result = await updateHistory(id, { ...payload, image_url });
    await logActivity(supabase, user.id, 'HISTORY_UPDATED', 'rt_history', id, `Memperbarui catatan sejarah: "${payload.title}"`);
  } else {
    result = await addHistory({ ...payload, image_url });
    await logActivity(supabase, user.id, 'HISTORY_CREATED', 'rt_history', result.id, `Menambahkan catatan sejarah baru: "${payload.title}"`);
  }

  return { success: true, history: result };
}

export async function deleteHistoryAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  await deleteHistory(id);
  await logActivity(supabase, user.id, 'HISTORY_DELETED', 'rt_history', id, 'Menghapus catatan sejarah RT');
  return { success: true };
}

// ----------------------------------------------------
// 5. CMS PENGATURAN & BRANDING WEBSITE
// ----------------------------------------------------
export async function saveSettingsAction(payload: any, logoBase64?: string, stampBase64?: string, signatureBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  
  let logo_url = payload.logo_url;
  let stamp_url = payload.stamp_url;
  let signature_url = payload.signature_url;

  if (logoBase64) {
    logo_url = await handleCloudinaryUpload(logoBase64, 'branding');
  }
  if (stampBase64) {
    stamp_url = await handleCloudinaryUpload(stampBase64, 'stamps');
  }
  if (signatureBase64) {
    signature_url = await handleCloudinaryUpload(signatureBase64, 'signatures');
  }

  const result = await updateSiteSettings({
    ...payload,
    logo_url,
    stamp_url,
    signature_url,
  });

  await logActivity(supabase, user.id, 'SETTINGS_UPDATED', 'site_settings', '1', 'Memperbarui konfigurasi & branding website');
  return { success: true, settings: result };
}

// ----------------------------------------------------
// 6. MANAGEMENT: ADUAN LAPORAN (REPORT STATUS UPDATES)
// ----------------------------------------------------
export async function updateReportStatusAction(id: string, status: any, note?: string) {
  const { supabase, user } = await verifyAdmin();
  
  const result = await adminUpdateReportStatus(id, { status, note });
  await logActivity(
    supabase, 
    user.id, 
    'REPORT_STATUS_UPDATED', 
    'reports', 
    id, 
    `Mengubah status laporan ${result.report_number} menjadi ${status}`
  );
  return { success: true, report: result };
}

// ----------------------------------------------------
// 7. CMS BANNER HERO CAROUSEL
// ----------------------------------------------------
export async function saveBannerAction(id: string | null, payload: any, imageBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  let image_url = payload.image_url || '/hero-banner.jpg';

  if (imageBase64) {
    image_url = await handleCloudinaryUpload(imageBase64, 'banners');
    if (payload.image_url && payload.image_url.includes('cloudinary.com')) {
      const publicId = payload.image_url.split('/').pop()?.split('.')[0];
      if (publicId) await deleteFromCloudinary(`banners/${publicId}`);
    }
  }

  let result;
  if (id && !id.startsWith('default-banner-') && id !== 'legacy-hero') {
    result = await updateBanner(id, { ...payload, image_url });
    await logActivity(supabase, user.id, 'BANNER_UPDATED', 'hero_banners', id, `Memperbarui banner hero: "${payload.title}"`);
  } else {
    result = await createBanner({ ...payload, image_url });
    await logActivity(supabase, user.id, 'BANNER_CREATED', 'hero_banners', result.id, `Menambahkan banner hero baru: "${payload.title}"`);
  }

  return { success: true, banner: result };
}

export async function deleteBannerAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  const existing = await getBannerById(id);

  if (existing?.image_url && existing.image_url.includes('cloudinary.com')) {
    const publicId = existing.image_url.split('/').pop()?.split('.')[0];
    if (publicId) await deleteFromCloudinary(`banners/${publicId}`);
  }

  if (!id.startsWith('default-banner-') && id !== 'legacy-hero') {
    await deleteBanner(id);
  }

  await logActivity(supabase, user.id, 'BANNER_DELETED', 'hero_banners', id, `Menghapus banner hero: "${existing?.title || id}"`);
  return { success: true };
}

export async function toggleBannerStatusAction(id: string, is_active: boolean) {
  const { supabase, user } = await verifyAdmin();
  if (!id.startsWith('default-banner-') && id !== 'legacy-hero') {
    await toggleBannerStatus(id, is_active);
  }
  await logActivity(supabase, user.id, 'BANNER_STATUS_TOGGLED', 'hero_banners', id, `Mengubah status banner menjadi ${is_active ? 'Aktif' : 'Non-aktif'}`);
  return { success: true };
}

// ----------------------------------------------------
// ALIAS EXPORTS (Backward Compatibility)
// ----------------------------------------------------
export const removeNewsAction = deleteNewsAction;
export const removeAnnouncementAction = deleteAnnouncementAction;
export const addGalleryAction = saveGalleryAction;
export const removeGalleryAction = deleteGalleryAction;
export const saveSambutanAction = saveRtProfileAction;
export const removeOfficerAction = deleteOfficerAction;
export const removeHistoryAction = deleteHistoryAction;

