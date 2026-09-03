import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export { cloudinary };

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Unggah file buffer ke folder Cloudinary tertentu dengan kompresi & optimasi otomatis:
 * - Format otomatis ke WebP / AVIF (sesuai browser pengguna)
 * - Kompresi kualitas cerdas (auto:good) tanpa menurunkan ketajaman visual
 * - Pembatasan resolusi maksimal 1920 x 1080 px agar tidak membebani kuota & loading web
 * - Progressive loading agar foto muncul seketika secara halus
 * 
 * @param fileBuffer Buffer data file gambar.
 * @param folder Nama folder di bawah 'rt05rw19/' (misal: 'banners', 'news', 'gallery', 'officers').
 * @param customMaxDimension Opsi batasan dimensi khusus (opsional).
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  customMaxDimension?: { width?: number; height?: number }
): Promise<CloudinaryUploadResult> {
  const maxWidth = customMaxDimension?.width || 1920;
  const maxHeight = customMaxDimension?.height || 1080;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `rt05rw19/${folder}`,
        resource_type: 'image',
        // Optimasi & kompresi cerdas otomatis
        transformation: [
          {
            width: maxWidth,
            height: maxHeight,
            crop: 'limit', // Perkecil hanya jika melebihi batas, pertahankan rasio aspek
            quality: 'auto:good', // Kompresi cerdas menghemat ~70% ukuran file
            fetch_format: 'auto', // Otomatis sajikan WebP / AVIF
            flags: 'progressive', // Tampilan progresif anti-lag
          }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload to Cloudinary returned no result.'));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type
        });
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

/**
 * Helper untuk menghasilkan URL gambar Cloudinary teroptimasi sesuai kebutuhan komponen (thumbnail, cover, avatar).
 * @param url URL gambar Cloudinary asli.
 * @param options Opsi transformasi (width, height, crop).
 */
export function getOptimizedImageUrl(
  url: string,
  options?: { width?: number; height?: number; crop?: 'fill' | 'limit' | 'thumb' }
): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  const { width = 800, height, crop = 'limit' } = options || {};
  let transformStr = `f_auto,q_auto,w_${width},c_${crop}`;
  if (height) {
    transformStr += `,h_${height}`;
  }

  // Sisipkan transformasi ke URL Cloudinary (/upload/ -> /upload/transformStr/)
  return url.replace(/\/upload\/(v\d+\/)?/, `/upload/${transformStr}/$1`);
}

/**
 * Hapus aset gambar dari Cloudinary berdasarkan public_id.
 * @param publicId Kunci public_id gambar yang ingin dihapus.
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}
