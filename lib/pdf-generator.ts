import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

interface PdfPayload {
  letterNumber: string;
  typeName: string;
  applicantName: string;
  nik: string;
  kk: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  purpose: string;
  dateStr: string;
  chairmanName: string;
  signatureUrl?: string;
  stampUrl?: string;
  verificationCode: string;
  domain: string;
}

/**
 * Mengunduh gambar dari Cloudinary ke Buffer data.
 */
async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image from URL: ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Menghasilkan file PDF A4 resmi dengan TTE, cap, dan QR verifikasi.
 */
export async function generateLetterPdf(payload: PdfPayload): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Buat dokumen PDFKit (Ukuran A4 dengan margin 50pt)
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 2. Kop Surat Resmi
      doc.fontSize(13).font('Helvetica-Bold').text('PESERIKATAN RUKUN TETANGGA', { align: 'center' });
      doc.fontSize(15).text('PENGURUS RT 05 RW 19 SANGKAL PUTUNG', { align: 'center' });
      doc.fontSize(11).text('KELURAHAN BREBES - KECAMATAN BREBES', { align: 'center' });
      doc.fontSize(8).font('Helvetica').text('Alamat: Sangkal Putung RT 05 RW 19, Kelurahan Brebes, Jawa Tengah, Kode Pos 52212', { align: 'center' });
      doc.moveDown(0.4);

      // Garis Pembatas Kop Surat
      doc.strokeColor('#1F2937');
      doc.lineWidth(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      // 3. Judul Surat
      doc.fontSize(12).font('Helvetica-Bold').text(payload.typeName.toUpperCase(), { align: 'center', underline: true });
      doc.fontSize(10).font('Helvetica').text(`Nomor: ${payload.letterNumber}`, { align: 'center' });
      doc.moveDown(1.5);

      // 4. Pembuka Surat
      doc.fontSize(10).font('Helvetica').text('Yang bertanda tangan di bawah ini Ketua RT 05 RW 19 Sangkal Putung, Kelurahan Brebes, Kecamatan Brebes, menerangkan dengan sebenarnya bahwa warga di bawah ini:', { align: 'justify', lineGap: 4 });
      doc.moveDown(1);

      // 5. Data Pemohon (Indentasi Kolom Berdampingan)
      const leftColX = 85;
      const rightColX = 205;

      let currentY = doc.y;
      doc.font('Helvetica-Bold').text('Nama Lengkap', leftColX, currentY);
      doc.font('Helvetica').text(`:  ${payload.applicantName}`, rightColX, currentY);
      doc.moveDown(0.5);

      currentY = doc.y;
      doc.font('Helvetica-Bold').text('NIK (No. KTP)', leftColX, currentY);
      doc.font('Helvetica').text(`:  ${payload.nik}`, rightColX, currentY);
      doc.moveDown(0.5);

      currentY = doc.y;
      doc.font('Helvetica-Bold').text('No. Kartu Keluarga', leftColX, currentY);
      doc.font('Helvetica').text(`:  ${payload.kk}`, rightColX, currentY);
      doc.moveDown(0.5);

      currentY = doc.y;
      doc.font('Helvetica-Bold').text('Tempat, Tgl Lahir', leftColX, currentY);
      doc.font('Helvetica').text(`:  ${payload.birthPlace}, ${payload.birthDate}`, rightColX, currentY);
      doc.moveDown(0.5);

      currentY = doc.y;
      doc.font('Helvetica-Bold').text('Alamat Domisili', leftColX, currentY);
      doc.font('Helvetica').text(`:  ${payload.address}`, rightColX, currentY, { width: 340, lineGap: 3 });
      
      // Sesuaikan doc.y setelah alamat (menghindari tumpang tindih konten)
      doc.y = currentY + 30; // Estimasi tinggi alamat
      doc.moveDown(1.5);

      // 6. Isi Keterangan Keperluan
      doc.font('Helvetica').text('Bahwa nama yang bersangkutan adalah benar warga kami yang bertempat tinggal di alamat tersebut di atas. Surat pengantar ini diterbitkan secara resmi untuk memenuhi keperluan warga dalam hal:', { align: 'justify', lineGap: 4 });
      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').text(`"${payload.purpose}"`, { align: 'center', lineGap: 4 });
      doc.moveDown(1);

      doc.font('Helvetica').text('Demikian surat pengantar/keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya dan penuh tanggung jawab.', { align: 'justify', lineGap: 4 });
      doc.moveDown(2);

      // 7. Area Tanda Tangan & QR Code Verifikasi
      const signatureY = doc.y;

      // Sisi Kiri: Pembuatan & Penempelan Gambar QR Code
      const verificationUrl = `https://${payload.domain}/verifikasi/${payload.verificationCode}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 90 });
      const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
      
      doc.image(qrBuffer, 55, signatureY, { width: 75 });
      doc.fontSize(7).font('Helvetica-Oblique').text('Pindai QR Code untuk', 55, signatureY + 80, { width: 75, align: 'center' });
      doc.text('Verifikasi Dokumen Resmi', 55, signatureY + 88, { width: 75, align: 'center' });
      doc.text(`VRF ID: ${payload.verificationCode}`, 55, signatureY + 96, { width: 75, align: 'center' });

      // Sisi Kanan: Penulisan Tanggal, Jabatan, TTE, Stempel, & Nama Ketua
      const rightColXSign = 350;
      doc.fontSize(10).font('Helvetica').text(`Brebes, ${payload.dateStr}`, rightColXSign);
      doc.text('Ketua RT 05 RW 19', rightColXSign);

      let signatureImgBuffer: Buffer | null = null;
      let stampImgBuffer: Buffer | null = null;

      if (payload.signatureUrl) {
        try {
          signatureImgBuffer = await fetchImageBuffer(payload.signatureUrl);
        } catch (e) {
          console.warn('Gagal memuat gambar tanda tangan:', e);
        }
      }
      if (payload.stampUrl) {
        try {
          stampImgBuffer = await fetchImageBuffer(payload.stampUrl);
        } catch (e) {
          console.warn('Gagal memuat gambar stempel RT:', e);
        }
      }

      // Penempelan tanda tangan & stempel tumpang tindih secara estetis
      if (signatureImgBuffer) {
        doc.image(signatureImgBuffer, rightColXSign - 10, signatureY + 18, { height: 45 });
      }
      if (stampImgBuffer) {
        doc.image(stampImgBuffer, rightColXSign - 35, signatureY + 12, { height: 55 });
      }

      // Nama Lengkap Ketua RT di bawah
      doc.font('Helvetica-Bold').text(payload.chairmanName, rightColXSign, signatureY + 75, { underline: true });
      doc.font('Helvetica').text('NIP. - / Pengurus Wilayah RT', rightColXSign, signatureY + 87);

      // Tutup dokumen PDF stream
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
