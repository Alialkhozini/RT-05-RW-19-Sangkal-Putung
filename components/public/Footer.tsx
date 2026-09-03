import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Clock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F1E36] text-white border-t border-[#1C2E4A] mt-auto pt-14 pb-8 transition-colors">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* 4 Kolom Utama Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">

          {/* Kolom 1: Profil RT */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 notranslate" translate="no">
              {/* Logo RT 05 RW 19 */}
              <div className="relative w-14 h-16 md:w-16 md:h-18 shrink-0 flex items-center justify-center">
                <Image
                  src="/logo-rt.png"
                  alt="Logo RT 05 RW 19 Sangkal Putung"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Logo Kabupaten Brebes */}
              <div className="relative w-14 h-16 md:w-16 md:h-18 shrink-0 flex items-center justify-center">
                <Image
                  src="/logo-brebes.svg"
                  alt="Logo Kabupaten Brebes"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <p className="text-sm font-normal text-gray-300 leading-relaxed">
              Website resmi RT 05 RW 19 Sangkal Putung, Kelurahan Brebes sebagai pusat informasi kependudukan, pengurusan surat mandiri online, dan transparansi kegiatan warga.
            </p>
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-400 rounded-full inline-block" />
              TAUTAN CEPAT
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm font-normal text-gray-300">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/profil/sambutan" className="hover:text-amber-400 transition-colors">
                  Profil RT & Sambutan
                </Link>
              </li>
              <li>
                <Link href="/profil/pengurus" className="hover:text-amber-400 transition-colors">
                  Struktur Pengurus
                </Link>
              </li>
              <li>
                <Link href="/informasi/berita" className="hover:text-amber-400 transition-colors">
                  Berita & Kegiatan
                </Link>
              </li>
              <li>
                <Link href="/informasi/pengumuman" className="hover:text-amber-400 transition-colors">
                  Pengumuman Resmi
                </Link>
              </li>
              <li>
                <Link href="/layanan/surat" className="hover:text-amber-400 transition-colors">
                  Pengajuan Surat Online
                </Link>
              </li>
              <li>
                <Link href="/layanan/lapor" className="hover:text-amber-400 transition-colors">
                  Lapor & Pengaduan Warga
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak RT */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-400 rounded-full inline-block" />
              KONTAK RT 05 RW 19
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm font-normal text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  RT 05 RW 19, Sangkal Putung, Kelurahan Brebes, Kec. Brebes, Kab. Brebes, Jawa Tengah 52212
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                  Telp / WA: +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col leading-relaxed">
                  <span className="font-normal text-white">Jam Operasional Pelayanan:</span>
                  <span>Senin - Sabtu: 08.00 - 20.00 WIB</span>
                  <span className="text-xs text-gray-400 font-normal">(Layanan Surat Online 24 Jam)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Peta Lokasi */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-400 rounded-full inline-block" />
              PETA LOKASI
            </h3>
            <div className="w-full h-36 rounded-xl overflow-hidden border border-white/15 shadow-md bg-neutral-bg relative group">
              <iframe
                title="Peta Lokasi RT 05 RW 19 Sangkal Putung"
                src="https://maps.google.com/maps?q=Sangkal%20Putung%2C%20Kelurahan%20Brebes%2C%20Kecamatan%20Brebes&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Sangkal+Putung+Kelurahan+Brebes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors w-fit"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Hak Cipta & Link Admin */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-gray-400 font-normal">
          <span>
            &copy; {currentYear} RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.
          </span>
          <div className="flex gap-4">
            <Link href="/admin/login" className="hover:text-amber-400 transition-colors">
              Portal Admin
            </Link>
            <Link href="/pengajuan" className="hover:text-amber-400 transition-colors">
              Pelacakan Surat
            </Link>
            <Link href="/verifikasi" className="hover:text-amber-400 transition-colors">
              Verifikasi Dokumen
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

