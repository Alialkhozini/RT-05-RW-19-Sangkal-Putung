'use server';

import { headers } from 'next/headers';
import { createLetterRequest, getLetterRequestByNumberAndPhone, adminGetLetterRequestById } from '@/services/letter.service';
import { getSiteSettings, getRtProfile } from '@/services/profile.service';
import { generateLetterPdf } from '@/lib/pdf-generator';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createServerClient, createAdminClient } from '@/lib/supabase';
import { rateLimit, invalidateCache } from '@/lib/redis';
import { z } from 'zod';

const letterRequestSchema = z.object({
  letter_type_id: z.string().uuid('Tipe surat tidak valid'),
  applicant_name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nik: z.string().length(16, 'NIK harus tepat 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  kk_number: z.string().length(16, 'No. KK harus tepat 16 digit').regex(/^\d+$/, 'No. KK harus berupa angka'),
  birth_place: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir tidak valid (YYYY-MM-DD)'),
  address: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  phone: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').regex(/^\+?[0-9]+$/, 'Nomor WhatsApp tidak valid'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  purpose: z.string().min(5, 'Keperluan minimal 5 karakter'),
});

/**
 * Server Action untuk menyimpan pengajuan surat baru.
 */
export async function submitLetterRequestAction(formData: any) {
  // Ambil IP client secara aman dari headers server
  const headersList = await headers();
  const rawIp = headersList.get('x-forwarded-for') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  // Rate Limiting (Maksimal 5 pengajuan per IP per jam)
  const limitResult = await rateLimit(`letter-submit:${clientIp}`, 5, 3600);
  if (!limitResult.success) {
    return {
      success: false,
      error: `Batas pengajuan terlampaui. Silakan coba lagi dalam ${Math.ceil(limitResult.reset / 60)} menit.`,
    };
  }

  // Validasi data input menggunakan Zod
  const validation = letterRequestSchema.safeParse(formData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    // Ambil pesan error pertama untuk general error
    const firstErrorMessage = Object.values(fieldErrors)[0]?.[0] || 'Data formulir tidak valid.';
    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    };
  }

  try {
    const result = await createLetterRequest({
      ...validation.data,
      form_data: {},
    });
    return {
      success: true,
      request: {
        request_number: result.request_number,
        applicant_name: result.applicant_name,
        status: result.status,
        submitted_at: result.submitted_at,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal mengirimkan pengajuan. Silakan coba beberapa saat lagi.',
    };
  }
}

/**
 * Server Action untuk melacak status surat oleh warga secara aman.
 */
export async function trackLetterRequestAction(requestNumber: string, phone: string) {
  const headersList = await headers();
  const rawIp = headersList.get('x-forwarded-for') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  // Rate Limiting (Maksimal 15 pelacakan per IP per jam)
  const limitResult = await rateLimit(`letter-track:${clientIp}`, 15, 3600);
  if (!limitResult.success) {
    return {
      success: false,
      error: `Terlalu banyak permintaan pelacakan. Coba lagi dalam ${Math.ceil(limitResult.reset / 60)} menit.`,
    };
  }

  if (!requestNumber.trim() || !phone.trim()) {
    return {
      success: false,
      error: 'Nomor Pengajuan dan Nomor WhatsApp wajib diisi.',
    };
  }

  try {
    const result = await getLetterRequestByNumberAndPhone(requestNumber, phone);
    if (!result) {
      return {
        success: false,
        error: 'Pengajuan surat tidak ditemukan. Mohon periksa kembali Nomor Pengajuan dan Nomor WhatsApp Anda.',
      };
    }

    return {
      success: true,
      request: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Terjadi kesalahan internal saat mencari data.',
    };
  }
}

// ----------------------------------------------------
// ADMIN WORKFLOWS: APPROVAL, REJECTION, REVISION
// ----------------------------------------------------

async function verifyAdminForLetters() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Akses ditolak. Silakan login sebagai admin.');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    throw new Error('Akses ditolak. Akun Anda tidak memiliki izin admin.');
  }
  
  return { supabase, user };
}

/**
 * Server Action untuk menyetujui surat pengajuan warga.
 * Merender PDF, menempelkan stempel & TTE, men-generate kode QR, mengunggah ke Cloudinary.
 */
export async function approveLetterRequestAction(id: string) {
  let adminAuth;
  try {
    adminAuth = await verifyAdminForLetters();
  } catch (authErr: any) {
    return { success: false, error: authErr.message };
  }

  const { supabase, user } = adminAuth;

  // 1. Dapatkan detail pengajuan
  const request = await adminGetLetterRequestById(id);
  if (!request) return { success: false, error: 'Pengajuan tidak ditemukan.' };
  if (request.status === 'completed' || request.status === 'approved') {
    return { success: false, error: 'Pengajuan sudah selesai diproses.' };
  }

  // 2. Dapatkan settings (Format Nomor Surat, Cap RT) & Profil RT (Nama Ketua, TTE)
  const settings = await getSiteSettings();
  const rtProfile = await getRtProfile();

  const signatureUrl = settings.signature_url || rtProfile.signature_url;
  const stampUrl = settings.stamp_url;
  const chairmanName = rtProfile.chairman_name;

  try {
    // 3. Generate nomor surat resmi urut
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const romanMonth = romanMonths[month] || 'I';

    // Hitung jumlah surat berstatus completed/approved untuk kelipatan nomor urut
    const { count, error: countErr } = await supabase
      .from('letter_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'approved']);

    if (countErr) throw new Error(`Gagal menghitung nomor urut: ${countErr.message}`);

    const nextNum = (count || 0) + 1;
    const paddedNum = String(nextNum).padStart(3, '0');

    const format = settings.letter_format || '{{number}}/RT05-RW19/{{month}}/{{year}}';
    const letterNumber = format
      .replace('{{number}}', paddedNum)
      .replace('{{month}}', romanMonth)
      .replace('{{year}}', String(year));

    // 4. Generate kode verifikasi unik (8 karakter alfanumerik)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Tanpa huruf membingungkan seperti O, I, 1
    let verificationCode = '';
    let isUnique = false;

    while (!isUnique) {
      let code = 'VRF-';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Periksa keunikan kode
      const { data: codeCheck } = await supabase
        .from('generated_documents')
        .select('id')
        .eq('verification_code', code)
        .maybeSingle();

      if (!codeCheck) {
        verificationCode = code;
        isUnique = true;
      }
    }

    // Dapatkan domain host untuk link QR verifikasi
    const headersList = await headers();
    const domain = headersList.get('host') || 'rt05rw19.id';

    // 5. Generate PDF Document via PDFKit
    const birthDateFormatted = request.birth_date
      ? new Date(request.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-';

    const pdfBuffer = await generateLetterPdf({
      letterNumber,
      typeName: request.letter_types?.name || 'Surat Pengantar',
      applicantName: request.applicant_name,
      nik: request.nik,
      kk: request.kk_number,
      birthPlace: request.birth_place || '-',
      birthDate: birthDateFormatted,
      address: request.address,
      purpose: request.purpose,
      dateStr: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      chairmanName,
      signatureUrl: signatureUrl || undefined,
      stampUrl: stampUrl || undefined,
      verificationCode,
      domain
    });

    // 6. Unggah PDF Buffer ke Cloudinary (Simpan di folder documents)
    const uploadResult = await uploadToCloudinary(pdfBuffer, 'documents');
    const fileUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    // 7. Simpan metadata dokumen terbit
    const { error: docError } = await supabase
      .from('generated_documents')
      .insert([
        {
          letter_request_id: id,
          file_url: fileUrl,
          storage_provider: 'cloudinary',
          public_id: publicId,
          verification_code: verificationCode,
        }
      ]);

    if (docError) throw new Error(`Gagal menyimpan data dokumen: ${docError.message}`);

    // 8. Update status pengajuan surat warga menjadi completed
    const { error: updateError } = await supabase
      .from('letter_requests')
      .update({
        status: 'completed',
        admin_note: `Disetujui. No Surat: ${letterNumber}`,
        approved_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw new Error(`Gagal memperbarui status pengajuan: ${updateError.message}`);

    // 9. Simpan log audit aktivitas admin
    await supabase.from('admin_activity_logs').insert([
      {
        admin_id: user.id,
        action: 'LETTER_APPROVED',
        entity_type: 'letter_requests',
        entity_id: id,
        description: `Menyetujui surat ${request.request_number} (${request.applicant_name}). No Surat: ${letterNumber}`,
      }
    ]);

    // 10. Bersihkan cache verifikasi
    await invalidateCache(`verification:${verificationCode}`);

    return { success: true, letterNumber };
  } catch (err: any) {
    console.error('Gagal memproses persetujuan surat:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem saat memproses persetujuan.' };
  }
}

/**
 * Server Action untuk menolak pengajuan surat.
 */
export async function rejectLetterRequestAction(id: string, reason: string) {
  let adminAuth;
  try {
    adminAuth = await verifyAdminForLetters();
  } catch (authErr: any) {
    return { success: false, error: authErr.message };
  }

  const { supabase, user } = adminAuth;

  if (!reason.trim()) {
    return { success: false, error: 'Alasan penolakan wajib diisi.' };
  }

  const request = await adminGetLetterRequestById(id);
  if (!request) return { success: false, error: 'Pengajuan tidak ditemukan.' };

  const { error } = await supabase
    .from('letter_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason.trim(),
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  // Log aktivitas audit
  await supabase.from('admin_activity_logs').insert([
    {
      admin_id: user.id,
      action: 'LETTER_REJECTED',
      entity_type: 'letter_requests',
      entity_id: id,
      description: `Menolak pengajuan surat ${request.request_number} (${request.applicant_name}). Alasan: ${reason}`,
    }
  ]);

  return { success: true };
}

/**
 * Server Action untuk meminta revisi perbaikan data surat kepada warga.
 */
export async function requestRevisionLetterRequestAction(id: string, note: string) {
  let adminAuth;
  try {
    adminAuth = await verifyAdminForLetters();
  } catch (authErr: any) {
    return { success: false, error: authErr.message };
  }

  const { supabase, user } = adminAuth;

  if (!note.trim()) {
    return { success: false, error: 'Catatan perbaikan wajib diisi.' };
  }

  const request = await adminGetLetterRequestById(id);
  if (!request) return { success: false, error: 'Pengajuan tidak ditemukan.' };

  const { error } = await supabase
    .from('letter_requests')
    .update({
      status: 'revision',
      admin_note: note.trim(),
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  // Log aktivitas audit
  await supabase.from('admin_activity_logs').insert([
    {
      admin_id: user.id,
      action: 'LETTER_REVISION_REQUESTED',
      entity_type: 'letter_requests',
      entity_id: id,
      description: `Meminta revisi surat ${request.request_number} (${request.applicant_name}). Catatan: ${note}`,
    }
  ]);

  return { success: true };
}
