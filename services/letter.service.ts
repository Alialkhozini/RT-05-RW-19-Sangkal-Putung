import { createServerClient, createAdminClient } from '@/lib/supabase';
import { getCache, setCache, invalidateCache } from '@/lib/redis';

const LETTER_TYPES_TTL = 3600; // 1 Jam

export interface LetterType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  is_active: boolean;
}

export interface LetterTemplate {
  id: string;
  letter_type_id: string;
  template_name: string;
  template_content: string;
  letter_prefix?: string;
}

export interface LetterRequest {
  id: string;
  request_number: string;
  letter_type_id: string;
  applicant_name: string;
  nik: string;
  kk_number: string;
  birth_place?: string;
  birth_date?: string;
  address: string;
  phone: string;
  email?: string;
  purpose: string;
  form_data: any;
  status: 'pending' | 'processing' | 'revision' | 'approved' | 'rejected' | 'completed';
  admin_note?: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  letter_types?: { name: string; slug: string };
  generated_documents?: { file_url: string; verification_code: string };
}

// ----------------------------------------------------
// 1. PUBLIC SERVICES
// ----------------------------------------------------

/**
 * Mendapatkan jenis-jenis surat yang aktif untuk warga.
 */
export async function getActiveLetterTypes(): Promise<LetterType[]> {
  const cacheKey = 'letter-types:active';
  const cached = await getCache<LetterType[]>(cacheKey);
  if (cached) return cached;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('letter_types')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (!error && data && data.length > 0) {
    await setCache(cacheKey, data, LETTER_TYPES_TTL);
    return data as LetterType[];
  }

  // Auto-seeding jika kosong di database
  const adminSupabase = await createAdminClient();
  const defaultLetterTypes = [
    { name: 'Surat Pengantar', slug: 'surat-pengantar', description: 'Diperlukan sebagai pengantar awal dari RT untuk pengurusan KTP, KK, pernikahan, atau keperluan administrasi kependudukan lainnya.', icon_name: 'Landmark', is_active: true },
    { name: 'Keterangan Domisili', slug: 'keterangan-domisili', description: 'Surat resmi yang menerangkan bahwa warga benar bertempat tinggal dan menetap di wilayah RT 05 RW 19 Sangkal Putung.', icon_name: 'HomeIcon', is_active: true },
    { name: 'Keterangan Usaha', slug: 'keterangan-usaha', description: 'Pengantar untuk pembuatan SKU (Surat Keterangan Usaha) bagi warga yang memiliki usaha mikro, kecil, atau menengah di lingkungan RT.', icon_name: 'Briefcase', is_active: true },
    { name: 'Keterangan Tidak Mampu', slug: 'keterangan-tidak-mampu', description: 'Surat pengantar untuk pengajuan bantuan sosial, keringanan biaya pendidikan/sekolah, atau layanan kesehatan gratis (sktm).', icon_name: 'HeartHandshake', is_active: true },
    { name: 'Pengantar Administrasi', slug: 'pengantar-administrasi', description: 'Dokumen pendukung untuk keperluan instansi luar, seperti perbankan, kepolisian (SKCK), pendaftaran sekolah/kuliah, dll.', icon_name: 'FilePlus2', is_active: true },
    { name: 'Keterangan Lainnya', slug: 'keterangan-lainnya', description: 'Formulir pengajuan surat untuk kebutuhan spesifik yang tidak tercantum pada opsi reguler. Tuliskan rincian kebutuhan Anda dengan jelas.', icon_name: 'FileEdit', is_active: true },
  ];

  const { data: seeded, error: seedError } = await adminSupabase
    .from('letter_types')
    .insert(defaultLetterTypes)
    .select();

  if (seedError || !seeded) {
    return [];
  }

  // Sisipkan juga templat surat standar bawaan
  const templates = seeded.map(type => ({
    letter_type_id: type.id,
    template_name: `Templat Standar ${type.name}`,
    letter_prefix: type.slug === 'surat-pengantar' ? '05/SP' : '05/SK',
    template_content: `Yang bertanda tangan di bawah ini Ketua RT 05 RW 19 Sangkal Putung, Kelurahan Brebes menerangkan bahwa:\n\nNama: {{nama}}\nNIK: {{nik}}\nKK: {{kk}}\nTempat/Tanggal Lahir: {{tempat_lahir}}, {{tanggal_lahir}}\nAlamat: {{alamat}}\n\nAdalah benar warga kami yang bertempat tinggal di alamat tersebut di atas. Surat pengantar/keterangan ini diberikan kepada yang bersangkutan untuk keperluan: {{keperluan}}.\n\nDemikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.`,
  }));

  await adminSupabase.from('letter_templates').insert(templates);

  await setCache(cacheKey, seeded, LETTER_TYPES_TTL);
  return seeded as LetterType[];
}

/**
 * Mengajukan surat baru oleh warga.
 * Otomatis menghasilkan nomor pengajuan unik (misal: REQ-2026-000001).
 */
export async function createLetterRequest(payload: Omit<LetterRequest, 'id' | 'request_number' | 'status' | 'submitted_at' | 'created_at' | 'updated_at'>): Promise<LetterRequest> {
  const supabase = await createAdminClient(); // Gunakan admin client untuk menulis data aman
  const year = new Date().getFullYear();
  
  let attempts = 0;
  let requestNumber = '';
  let insertError = null;
  let insertedData: LetterRequest | null = null;

  while (attempts < 5) {
    // 1. Ambil jumlah pengajuan tahun ini untuk sequence
    const { count, error: countError } = await supabase
      .from('letter_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01T00:00:00Z`);

    if (countError) throw new Error(countError.message);

    const nextSeq = (count || 0) + 1 + attempts; // Jika gagal, naikkan offset sequence
    requestNumber = `REQ-${year}-${String(nextSeq).padStart(6, '0')}`;

    // 2. Coba simpan ke database
    const { data, error } = await supabase
      .from('letter_requests')
      .insert([
        {
          ...payload,
          request_number: requestNumber,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (!error) {
      insertedData = data as LetterRequest;
      break;
    }

    insertError = error;
    attempts++;
  }

  if (!insertedData) {
    throw new Error(`Gagal membuat pengajuan surat setelah beberapa percobaan: ${insertError?.message}`);
  }

  return insertedData;
}

/**
 * Melacak status pengajuan surat warga.
 * Validasi dengan Nomor Pengajuan + Nomor WhatsApp.
 */
export async function getLetterRequestByNumberAndPhone(
  requestNumber: string,
  phone: string
): Promise<LetterRequest | null> {
  const supabase = await createAdminClient(); // Gunakan admin client agar bisa bypass RLS warga (karena warga tidak login)
  
  // Format nomor telepon warga untuk pencocokan yang fleksibel
  const formattedPhone = phone.replace(/[^0-9]/g, '');

  const { data, error } = await supabase
    .from('letter_requests')
    .select(`
      *,
      letter_types (
        name,
        slug
      ),
      generated_documents (
        file_url,
        verification_code
      )
    `)
    .eq('request_number', requestNumber.trim())
    .single();

  if (error || !data) return null;

  // Bandingkan nomor HP database dengan input warga (abaikan kode negara jika memungkinkan)
  const dbPhone = data.phone.replace(/[^0-9]/g, '');
  if (!dbPhone.endsWith(formattedPhone) && !formattedPhone.endsWith(dbPhone)) {
    return null; // Nomor telepon tidak cocok
  }

  // Bersihkan data sensitif NIK & KK sebelum dikembalikan ke klien publik
  const cleanedData = {
    ...data,
    nik: data.nik.substring(0, 6) + '**********',
    kk_number: data.kk_number.substring(0, 6) + '**********',
  };

  return cleanedData as any;
}

// ----------------------------------------------------
// 2. ADMIN SERVICES
// ----------------------------------------------------

/**
 * Mengambil daftar pengajuan surat (Admin).
 */
export async function adminGetLetterRequests(filters?: {
  status?: string;
  search?: string;
}): Promise<LetterRequest[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from('letter_requests')
    .select(`
      *,
      letter_types (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`applicant_name.ilike.%${filters.search}%,request_number.ilike.%${filters.search}%,nik.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) return [];
  return data as any;
}

/**
 * Mengambil detail pengajuan surat berdasarkan ID (Admin).
 */
export async function adminGetLetterRequestById(id: string): Promise<LetterRequest | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('letter_requests')
    .select(`
      *,
      letter_types (
        name,
        slug
      ),
      generated_documents (
        file_url,
        verification_code
      )
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as any;
}

/**
 * Mengubah status pengajuan (Proses, Perbaikan, Penolakan) oleh admin.
 */
export async function adminUpdateStatus(
  id: string,
  payload: {
    status: 'processing' | 'revision' | 'rejected';
    admin_note?: string;
    rejection_reason?: string;
  }
): Promise<LetterRequest> {
  const supabase = await createServerClient();
  
  const updateData: any = {
    status: payload.status,
    updated_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString(),
  };

  if (payload.status === 'revision') {
    updateData.admin_note = payload.admin_note;
  } else if (payload.status === 'rejected') {
    updateData.rejection_reason = payload.rejection_reason;
  }

  const { data, error } = await supabase
    .from('letter_requests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LetterRequest;
}
