import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-gray mt-auto pt-16 pb-8 transition-colors">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 pb-12 border-b border-neutral-gray">
          {/* Kolom 1: Profil Singkat */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 notranslate" translate="no">
              <div className="relative w-13 h-15 md:w-14 md:h-16 bg-transparent shrink-0 flex items-center justify-center">
                <Image
                  src="/logo-rt.png"
                  alt="Logo RT 05 RW 19 Sangkal Putung"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="w-[2px] h-9 md:h-11 bg-gradient-to-b from-primary via-red-600 to-primary/40 rounded-full shrink-0" />
              <div className="flex flex-col justify-center text-left">
                <span className="text-xs md:text-sm font-black tracking-tight uppercase leading-none bg-gradient-to-r from-primary via-red-700 to-dark bg-clip-text text-transparent">
                  RT 05 RW 19 SANGKAL PUTUNG
                </span>
                <span className="text-[10px] md:text-[11px] font-black tracking-tight uppercase leading-none text-dark mt-1">
                  KEL. BREBES KECAMATAN BREBES
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Website resmi RT 05 RW 19 Sangkal Putung, Kelurahan Brebes sebagai sarana pusat informasi, transparansi, publikasi kegiatan, dan kemudahan pelayanan administrasi digital untuk warga.
            </p>
          </div>

          {/* Kolom 2: Kontak Kami */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              Kontak Kami
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>RT 05 RW 19, Sangkal Putung, Kelurahan Brebes, Kecamatan Brebes, Kabupaten Brebes, Jawa Tengah, Indonesia</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  +62 812-3456-7890 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:kontak@rt05rw19.id" className="hover:text-primary transition-colors">
                  kontak@rt05rw19.id
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Tautan Cepat */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              Tautan Cepat
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Beranda
              </Link>
              <Link href="/profil/sambutan" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Sambutan RT
              </Link>
              <Link href="/profil/sejarah" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Sejarah RT
              </Link>
              <Link href="/profil/pengurus" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Pengurus
              </Link>
              <Link href="/informasi/berita" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Berita RT
              </Link>
              <Link href="/informasi/pengumuman" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Pengumuman
              </Link>
              <Link href="/layanan/surat" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Surat Menyurat
              </Link>
              <Link href="/layanan/lapor" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">
                Lapor RT
              </Link>
            </div>
          </div>
        </div>

        {/* Hak Cipta */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-gray-400 font-semibold">
          <span>
            &copy; {currentYear} RT 05 RW 19 Sangkal Putung. Seluruh hak cipta dilindungi.
          </span>
          <div className="flex gap-4">
            <Link href="/admin/login" className="hover:text-primary transition-colors">
              Portal Admin
            </Link>
            <Link href="/pengajuan" className="hover:text-primary transition-colors">
              Pelacakan Surat
            </Link>
            <Link href="/verifikasi" className="hover:text-primary transition-colors">
              Verifikasi Dokumen
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
