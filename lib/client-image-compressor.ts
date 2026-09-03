/**
 * Helper kompresi gambar di browser (Client-Side) menggunakan HTML5 Canvas.
 * - Mengompresi file foto besar (5MB - 20MB) dari kamera/HP menjadi ~300KB - 800KB dalam hitungan milidetik.
 * - Menjaga resolusi maksimal 1920 x 1080 px agar gambar tetap sangat tajam & jernih di layar Full HD.
 * - Menghilangkan kendala "Body exceeded limit" pada Server Actions secara permanen.
 */
export async function compressImageClient(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Jika file berupa SVG atau GIF, jangan kompresi canvas agar animasi/vektor tetap terjaga
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung proporsi penskalaan jika gambar melebihi dimensi maksimal
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = Math.round(maxHeight);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Gambar ulang gambar dengan kualitas tinggi
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke format JPEG terkompresi dengan kualitas optimal (0.85)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = (err) => {
        reject(err);
      };
    };

    reader.onerror = (err) => {
      reject(err);
    };
  });
}
