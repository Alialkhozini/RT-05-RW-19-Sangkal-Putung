'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import AccessibilityWidget from './AccessibilityWidget';
import LanguageSelector from './LanguageSelector';

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Deteksi scroll untuk efek glassmorphism navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup menu seluler saat rute berubah
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: 'Beranda', href: '/' },
    {
      name: 'Profil',
      dropdown: [
        { name: 'Sambutan Ketua RT', href: '/profil/sambutan' },
        { name: 'Sejarah & Visi Misi', href: '/profil/sejarah' },
        { name: 'Struktur Kepengurusan', href: '/profil/pengurus' },
      ],
    },
    {
      name: 'Informasi',
      dropdown: [
        { name: 'Berita & Kegiatan', href: '/informasi/berita' },
        { name: 'Pengumuman Resmi', href: '/informasi/pengumuman' },
      ],
    },
    {
      name: 'Layanan',
      dropdown: [
        { name: 'Pengajuan Surat Online', href: '/layanan/surat' },
        { name: 'Lapor / Pengaduan Warga', href: '/layanan/lapor' },
        { name: 'Dokumen & Arsip Warga', href: '/pengajuan' },
      ],
    },
    { name: 'Galeri', href: '/galeri' },
  ];

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border border-neutral-gray/80 py-2 md:py-2.5 rounded-2xl'
            : 'bg-white shadow-md border border-neutral-gray/80 py-2.5 md:py-3 rounded-2xl'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo & Identitas */}
          <Link href="/" className="flex items-center gap-2 md:gap-2.5 group notranslate shrink-0" translate="no">
            {/* Logo Emblem Image */}
            <div className="relative w-11 h-12 md:w-12 md:h-13.5 bg-transparent shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image 
                src="/logo-rt.png" 
                alt="Logo RT 05 RW 19 Sangkal Putung" 
                fill 
                className="object-contain"
                priority
                unoptimized
              />
            </div>

            {/* Vertical Accent Line */}
            <div className="w-[2px] h-8 md:h-9.5 bg-gradient-to-b from-primary via-red-600 to-primary/40 rounded-full shrink-0" />

            {/* Text Identity with Gradient */}
            <div className="flex flex-col justify-center text-left">
              <span className="text-xs md:text-[13.5px] lg:text-[14px] font-black tracking-tight uppercase leading-none bg-gradient-to-r from-primary via-red-700 to-dark bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                RT 05 RW 19 SANGKAL PUTUNG
              </span>
              <span className="text-[9.5px] md:text-[10.5px] font-black tracking-tight uppercase leading-none text-dark mt-0.5">
                KEL. BREBES KECAMATAN BREBES
              </span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {menuItems.map((item) => (
              <div key={item.name} className="relative group/nav">
                {item.dropdown ? (
                  <button className="flex items-center gap-1.5 px-4 py-2 text-[15px] font-bold text-gray-700 hover:text-primary rounded-xl hover:bg-neutral-bg transition-all duration-200">
                    {item.name}
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover/nav:rotate-180 transition-transform duration-200" />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-[15px] font-bold rounded-xl hover:bg-neutral-bg transition-all duration-200 block ${
                      pathname === item.href
                        ? 'text-primary bg-primary/10 font-bold'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}

                {/* Dropdown Menu Desktop */}
                {item.dropdown && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-neutral-gray p-2 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 transform translate-y-2 group-hover/nav:translate-y-0 z-50 flex flex-col gap-1">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`px-3.5 py-2.5 text-[13px] font-bold rounded-xl hover:bg-neutral-bg transition-colors flex items-center justify-between ${
                          pathname === sub.href
                            ? 'text-primary bg-primary/10 font-bold'
                            : 'text-gray-700 hover:text-primary'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Bagian Kanan Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Pilihan Bahasa */}
            <LanguageSelector />

            {/* Widget Aksesibilitas */}
            <AccessibilityWidget />
          </div>

          {/* Bagian Kanan Seluler: Hanya Tombol Menu Hamburger */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-primary rounded-xl hover:bg-neutral-bg focus:outline-none transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Drawer Seluler */}
        {isOpen && (
          <div className="lg:hidden absolute top-[105%] left-0 w-full bg-white rounded-2xl shadow-xl border border-neutral-gray p-4 animate-in slide-in-from-top-4 duration-200 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.name} className="flex flex-col">
                {item.dropdown ? (
                  <>
                    <span className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {item.name}
                    </span>
                    <div className="pl-4 flex flex-col gap-1 border-l-2 border-neutral-gray ml-4 mb-2">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg hover:bg-neutral-bg ${
                            pathname === sub.href
                              ? 'text-primary bg-primary/5'
                              : 'text-gray-600'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg hover:bg-neutral-bg ${
                      pathname === item.href
                        ? 'text-primary bg-primary/5'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Opsi Bahasa & Aksesibilitas Khusus Mobile di Dalam Menu */}
            <div className="pt-3 mt-2 border-t border-neutral-gray flex items-center justify-between gap-3 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bahasa:</span>
                <LanguageSelector />
              </div>
              <div className="flex items-center gap-2">
                <AccessibilityWidget />
              </div>
            </div>
          </div>
        )}
      </header>

    </>
  );
}
