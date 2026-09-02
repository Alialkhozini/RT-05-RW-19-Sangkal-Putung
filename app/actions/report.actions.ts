'use server';

import { headers } from 'next/headers';
import { createReport, getReportByNumberAndPhone } from '@/services/report.service';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { rateLimit } from '@/lib/redis';
import { z } from 'zod';

const reportSchema = z.object({
  name: z.string().min(3, 'Nama pelapor minimal 3 karakter'),
  phone: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').regex(/^\+?[0-9]+$/, 'Nomor WhatsApp tidak valid'),
  category: z.enum(['Keamanan', 'Kebersihan', 'Fasilitas Umum', 'Lingkungan', 'Sosial', 'Administrasi', 'Lainnya']),
  title: z.string().min(5, 'Judul laporan minimal 5 karakter'),
  description: z.string().min(10, 'Deskripsi laporan minimal 10 karakter'),
  location: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

/**
 * Server Action untuk menyimpan aduan Lapor RT baru dari warga.
 * Mendukung unggah foto opsional lewat format base64.
 */
export async function submitReportAction(formData: any, photoBase64?: string) {
  // Ambil IP client
  const headersList = await headers();
  const rawIp = headersList.get('x-forwarded-for') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  // Rate Limiting (Maksimal 5 laporan per IP per jam)
  const limitResult = await rateLimit(`report-submit:${clientIp}`, 5, 3600);
  if (!limitResult.success) {
    return {
      success: false,
      error: `Batas pengiriman laporan terlampaui. Silakan coba lagi dalam ${Math.ceil(limitResult.reset / 60)} menit.`,
    };
  }

  // Validasi data input
  const validation = reportSchema.safeParse(formData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstErrorMessage = Object.values(fieldErrors)[0]?.[0] || 'Data laporan tidak valid.';
    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    };
  }

  let photo_url: string | undefined = undefined;

  // Unggah foto ke Cloudinary jika dilampirkan warga
  if (photoBase64) {
    try {
      // Hilangkan header data URL (misal: "data:image/png;base64,")
      const matches = photoBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return {
          success: false,
          error: 'Format foto aduan tidak valid.',
        };
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Periksa tipe file (Hanya izinkan gambar JPG & PNG)
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
        return {
          success: false,
          error: 'Tipe file foto harus berupa JPG atau PNG.',
        };
      }

      const buffer = Buffer.from(base64Data, 'base64');
      
      // Validasi ukuran buffer (maksimal 5MB)
      if (buffer.length > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'Ukuran foto maksimal adalah 5MB.',
        };
      }

      // Unggah secara aman ke Cloudinary
      const cloudinaryResult = await uploadToCloudinary(buffer, 'reports');
      photo_url = cloudinaryResult.secure_url;
    } catch (uploadError) {
      console.error('Cloudinary report upload error:', uploadError);
      return {
        success: false,
        error: 'Gagal mengunggah foto aduan warga. Silakan coba lagi.',
      };
    }
  }

  try {
    const reportData = {
      ...validation.data,
      photo_url,
    };
    const result = await createReport(reportData);
    return {
      success: true,
      report: {
        report_number: result.report_number,
        title: result.title,
        status: result.status,
        created_at: result.created_at,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal menyimpan laporan warga. Silakan coba sesaat lagi.',
    };
  }
}

/**
 * Server Action untuk melacak status laporan warga secara aman.
 */
export async function trackReportAction(reportNumber: string, phone: string) {
  const headersList = await headers();
  const rawIp = headersList.get('x-forwarded-for') || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  // Rate Limiting (Maksimal 15 pelacakan per IP per jam)
  const limitResult = await rateLimit(`report-track:${clientIp}`, 15, 3600);
  if (!limitResult.success) {
    return {
      success: false,
      error: `Terlalu banyak permintaan pelacakan. Coba lagi dalam ${Math.ceil(limitResult.reset / 60)} menit.`,
    };
  }

  if (!reportNumber.trim() || !phone.trim()) {
    return {
      success: false,
      error: 'Nomor Laporan dan Nomor WhatsApp wajib diisi.',
    };
  }

  try {
    const result = await getReportByNumberAndPhone(reportNumber, phone);
    if (!result) {
      return {
        success: false,
        error: 'Laporan warga tidak ditemukan. Mohon periksa kembali Nomor Laporan dan Nomor WhatsApp Anda.',
      };
    }

    return {
      success: true,
      report: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Terjadi kesalahan internal saat mencari data laporan.',
    };
  }
}
