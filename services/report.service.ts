import { createServerClient, createAdminClient } from '@/lib/supabase';

export interface Report {
  id: string;
  report_number: string;
  name: string;
  phone: string;
  category: 'Keamanan' | 'Kebersihan' | 'Fasilitas Umum' | 'Lingkungan' | 'Sosial' | 'Administrasi' | 'Lainnya';
  title: string;
  description: string;
  location?: string;
  photo_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'received' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  created_at: string;
  updated_at: string;
  report_updates?: ReportUpdate[];
}

export interface ReportUpdate {
  id: string;
  report_id: string;
  status: string;
  note?: string;
  created_at: string;
}

// ----------------------------------------------------
// 1. PUBLIC SERVICES
// ----------------------------------------------------

/**
 * Mengirim laporan pengaduan baru oleh warga.
 * Otomatis menghasilkan nomor laporan unik (misal: LAP-2026-000001).
 */
export async function createReport(payload: Omit<Report, 'id' | 'report_number' | 'status' | 'created_at' | 'updated_at'>): Promise<Report> {
  const supabase = await createAdminClient();
  const year = new Date().getFullYear();
  
  let attempts = 0;
  let reportNumber = '';
  let insertError = null;
  let insertedData: Report | null = null;

  while (attempts < 5) {
    // 1. Ambil jumlah laporan tahun ini untuk sequence
    const { count, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01T00:00:00Z`);

    if (countError) throw new Error(countError.message);

    const nextSeq = (count || 0) + 1 + attempts;
    reportNumber = `LAP-${year}-${String(nextSeq).padStart(6, '0')}`;

    // 2. Coba simpan ke database
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          ...payload,
          report_number: reportNumber,
          status: 'submitted',
        }
      ])
      .select()
      .single();

    if (!error) {
      insertedData = data as Report;
      break;
    }

    insertError = error;
    attempts++;
  }

  if (!insertedData) {
    throw new Error(`Gagal membuat laporan warga setelah beberapa percobaan: ${insertError?.message}`);
  }

  return insertedData;
}

/**
 * Melacak status laporan warga.
 * Validasi dengan Nomor Laporan + Nomor WhatsApp.
 */
export async function getReportByNumberAndPhone(
  reportNumber: string,
  phone: string
): Promise<Report | null> {
  const supabase = await createAdminClient();
  const formattedPhone = phone.replace(/[^0-9]/g, '');

  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      report_updates (
        id,
        status,
        note,
        created_at
      )
    `)
    .eq('report_number', reportNumber.trim())
    .single();

  if (error || !data) return null;

  // Bandingkan nomor HP
  const dbPhone = data.phone.replace(/[^0-9]/g, '');
  if (!dbPhone.endsWith(formattedPhone) && !formattedPhone.endsWith(dbPhone)) {
    return null; // Nomor tidak cocok
  }

  // Urutkan riwayat update laporan berdasarkan tanggal dibuat (terlama ke terbaru)
  if (data.report_updates) {
    data.report_updates.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return data as Report;
}

// ----------------------------------------------------
// 2. ADMIN SERVICES
// ----------------------------------------------------

/**
 * Mengambil daftar laporan warga (Admin).
 */
export async function adminGetReports(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}): Promise<Report[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,report_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) return [];
  return data as Report[];
}

/**
 * Mengambil detail laporan berdasarkan ID (Admin).
 */
export async function adminGetReportById(id: string): Promise<Report | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      report_updates (
        id,
        status,
        note,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) return null;

  if (data.report_updates) {
    data.report_updates.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return data as Report;
}

/**
 * Memperbarui status laporan warga dan menambahkan catatan pembaruan ke lini masa.
 */
export async function adminUpdateReportStatus(
  id: string,
  payload: {
    status: Report['status'];
    note?: string;
  }
): Promise<Report> {
  const supabase = await createServerClient();
  
  // 1. Update status laporan utama
  const { data: updatedReport, error: updateError } = await supabase
    .from('reports')
    .update({
      status: payload.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  // 2. Catat pembaruan di lini masa (report_updates)
  const { error: logError } = await supabase
    .from('report_updates')
    .insert([
      {
        report_id: id,
        status: payload.status,
        note: payload.note || `Status laporan diubah menjadi ${payload.status}`,
      }
    ]);

  if (logError) throw new Error(logError.message);

  return updatedReport as Report;
}
