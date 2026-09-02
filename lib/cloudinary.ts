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
 * Unggah file buffer ke folder Cloudinary tertentu dengan optimasi otomatis.
 * @param fileBuffer Buffer data file gambar.
 * @param folder Nama folder di bawah 'rt05rw19/' (misal: 'news', 'reports').
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `rt05rw19/${folder}`,
        // Optimasi gambar otomatis
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
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
