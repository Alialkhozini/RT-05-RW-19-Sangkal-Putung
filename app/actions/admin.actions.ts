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
  }

  const newsData = { ...payload, cover_image };

  if (id) {
    // Update
    const result = await updateNews(id, newsData);
    await logActivity(supabase, user.id, 'NEWS_UPDATED', 'news', id, `Mengubah berita: "${result.title}"`);
    return { success: true, news: result };
  } else {
    // Create
    const result = await createNews(newsData);
    await logActivity(supabase, user.id, 'NEWS_CREATED', 'news', result.id, `Membuat berita baru: "${result.title}"`);
    return { success: true, news: result };
  }
}

export async function removeNewsAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  const news = await getNewsById(id);
  
  await deleteNews(id);
  await logActivity(supabase, user.id, 'NEWS_DELETED', 'news', id, `Menghapus berita: "${news?.title || id}"`);
  return { success: true };
}

// ----------------------------------------------------
// 2. CMS PENGUMUMAN (ANNOUNCEMENTS CRUD ACTIONS)
// ----------------------------------------------------
export async function saveAnnouncementAction(id: string | null, payload: any) {
  const { supabase, user } = await verifyAdmin();

  if (id) {
    const result = await updateAnnouncement(id, payload);
    await logActivity(supabase, user.id, 'ANNOUNCEMENT_UPDATED', 'announcements', id, `Mengubah pengumuman: "${result.title}"`);
    return { success: true, announcement: result };
  } else {
    const result = await createAnnouncement(payload);
    await logActivity(supabase, user.id, 'ANNOUNCEMENT_CREATED', 'announcements', result.id, `Membuat pengumuman baru: "${result.title}"`);
    return { success: true, announcement: result };
  }
}

export async function removeAnnouncementAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  const ann = await getAnnouncementById(id);

  await deleteAnnouncement(id);
  await logActivity(supabase, user.id, 'ANNOUNCEMENT_DELETED', 'announcements', id, `Menghapus pengumuman: "${ann?.title || id}"`);
  return { success: true };
}

// ----------------------------------------------------
// 3. CMS GALERI (GALLERY CRUD ACTIONS)
// ----------------------------------------------------
export async function addGalleryAction(payload: any, photoBase64: string) {
  const { supabase, user } = await verifyAdmin();
  const image_url = await handleCloudinaryUpload(photoBase64, 'gallery');

  const result = await addGalleryItem({ ...payload, image_url });
  await logActivity(supabase, user.id, 'GALLERY_CREATED', 'galleries', result.id, `Menambahkan foto ke galeri: "${result.title || 'Tanpa Judul'}"`);
  return { success: true, item: result };
}

export async function removeGalleryAction(id: string) {
  const { supabase, user } = await verifyAdmin();

  await deleteGalleryItem(id);
  await logActivity(supabase, user.id, 'GALLERY_DELETED', 'galleries', id, `Menghapus item foto galeri id: ${id}`);
  return { success: true };
}

// ----------------------------------------------------
// 4. CMS PROFIL & PENGURUS (PROFILE CRUD ACTIONS)
// ----------------------------------------------------
export async function saveSambutanAction(payload: any, photoBase64?: string, signatureBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  
  let chairman_photo_url = payload.chairman_photo_url;
  let signature_url = payload.signature_url;

  if (photoBase64) {
    chairman_photo_url = await handleCloudinaryUpload(photoBase64, 'profile');
  }
  if (signatureBase64) {
    signature_url = await handleCloudinaryUpload(signatureBase64, 'signatures');
  }

  const result = await updateRtProfile({
    ...payload,
    chairman_photo_url,
    signature_url,
  });

  await logActivity(supabase, user.id, 'SAMBUTAN_UPDATED', 'rt_profile', '1', 'Memperbarui pesan sambutan ketua RT');
  return { success: true, profile: result };
}

export async function saveOfficerAction(id: string | null, payload: any, photoBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  let photo_url = payload.photo_url;

  if (photoBase64) {
    photo_url = await handleCloudinaryUpload(photoBase64, 'officers');
  }

  // Petakan hierarchy_order dari frontend ke order_num di DB
  const officerData = {
    name: payload.name,
    position: payload.position,
    photo_url,
    order_num: payload.hierarchy_order ?? payload.order_num ?? 10
  };

  if (id) {
    const result = await updateOfficer(id, officerData);
    await logActivity(supabase, user.id, 'OFFICER_UPDATED', 'rt_officers', id, `Mengubah data pengurus: "${result.name}"`);
    return { success: true, officer: result };
  } else {
    const result = await addOfficer(officerData);
    await logActivity(supabase, user.id, 'OFFICER_CREATED', 'rt_officers', result.id, `Menambahkan pengurus baru: "${result.name}"`);
    return { success: true, officer: result };
  }
}

export async function removeOfficerAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  
  await deleteOfficer(id);
  await logActivity(supabase, user.id, 'OFFICER_DELETED', 'rt_officers', id, `Menghapus data pengurus id: ${id}`);
  return { success: true };
}

export async function saveHistoryAction(id: string | null, payload: any, imageBase64?: string) {
  const { supabase, user } = await verifyAdmin();
  let image_url = payload.image_url;

  if (imageBase64) {
    image_url = await handleCloudinaryUpload(imageBase64, 'history');
  }

  // Petakan field dan set order_num agar valid
  const historyData = {
    year: payload.year,
    title: payload.title,
    description: payload.description,
    image_url,
    order_num: payload.order_num !== undefined && payload.order_num !== null 
      ? payload.order_num 
      : (parseInt(payload.year) || 10)
  };

  if (id) {
    const result = await updateHistory(id, historyData);
    await logActivity(supabase, user.id, 'HISTORY_UPDATED', 'rt_history', id, `Mengubah lini masa sejarah: "${result.title}"`);
    return { success: true, history: result };
  } else {
    const result = await addHistory(historyData);
    await logActivity(supabase, user.id, 'HISTORY_CREATED', 'rt_history', result.id, `Menambahkan lini masa sejarah: "${result.title}"`);
    return { success: true, history: result };
  }
}

export async function removeHistoryAction(id: string) {
  const { supabase, user } = await verifyAdmin();
  
  await deleteHistory(id);
  await logActivity(supabase, user.id, 'HISTORY_DELETED', 'rt_history', id, `Menghapus entri sejarah id: ${id}`);
  return { success: true };
}

// ----------------------------------------------------
// 5. CMS PENGATURAN & BRANDING (SETTINGS ACTIONS)
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
