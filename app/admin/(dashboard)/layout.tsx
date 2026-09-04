'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Newspaper, 
  Bell, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldCheck,
  FolderOpen,
  Sliders
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  // Ambil data user yang sedang login
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || 'admin@rt05rw19.id');
      }
    };
    fetchUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pengajuan Surat', href: '/admin/pengajuan-surat', icon: FileText },
    { name: 'Laporan Warga', href: '/admin/laporan', icon: MessageSquare },
    { name: 'Berita', href: '/admin/berita', icon: Newspaper },
    { name: 'Pengumuman', href: '/admin/pengumuman', icon: Bell },
    { name: 'Banner Hero', href: '/admin/banner', icon: Sliders },
    {
      name: 'Profil RT',
      href: '#',
      icon: Users,
      subItems: [
        { name: 'Sambutan', href: '/admin/profil/sambutan' },
        { name: 'Pengurus', href: '/admin/profil/pengurus' },
        { name: 'Sejarah', href: '/admin/profil/sejarah' },
      ],
    },
    { name: 'Galeri', href: '/admin/galeri', icon: ImageIcon },
    { name: 'Dokumen', href: '/admin/dokumen', icon: FolderOpen },
    { name: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg flex text-left font-medium">
      {/* ================= SIDEBAR NAV DESKTOP ================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark text-white shrink-0 border-r border-gray-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <Image
              src="/logo-rt.png"
              alt="Logo RT 05 RW 19"
              width={40}
              height={40}
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-wider uppercase leading-tight text-white">
              Dasbor Admin
            </span>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
              RT 05 RW 19 Sangkal Putung
            </span>
          </div>
        </div>

        {/* List Menu */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href)));

            if (item.subItems) {
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive ? 'text-primary bg-primary/10' : 'text-gray-400'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <div className="pl-7 flex flex-col gap-1 border-l border-gray-800 ml-5 py-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname.startsWith(sub.href);
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
                            isSubActive
                              ? 'bg-primary text-white font-bold shadow-sm'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Button */}
        <div className="p-4 border-t border-gray-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">Administrator</span>
              <span className="text-[10px] text-gray-400 truncate">{adminEmail || 'admin@rt05rw19.id'}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>

      {/* ================= HEADER & MOBILE SIDEBAR ================= */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-gray flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
          {/* Sisi Kiri: Toggle Menu Seluler & Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-neutral-bg text-gray-500 lg:hidden focus:outline-none"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-sm font-extrabold text-dark tracking-tight uppercase">
              {pathname === '/admin/dashboard' && 'Beranda Dasbor'}
              {pathname.startsWith('/admin/pengajuan-surat') && 'Manajemen Surat Warga'}
              {pathname.startsWith('/admin/laporan') && 'Manajemen Laporan Warga'}
              {pathname.startsWith('/admin/berita') && 'CMS Pengelolaan Berita'}
              {pathname.startsWith('/admin/pengumuman') && 'CMS Pengelolaan Pengumuman'}
              {pathname.startsWith('/admin/banner') && 'CMS Banner Hero Carousel'}
              {pathname.startsWith('/admin/profil/') && 'Pengaturan Konten Profil RT'}
              {pathname.startsWith('/admin/galeri') && 'CMS Pengelolaan Galeri Foto'}
              {pathname.startsWith('/admin/dokumen') && 'Arsip Dokumen Terbit'}
              {pathname.startsWith('/admin/pengaturan') && 'Pengaturan Umum Website'}
            </h2>
          </div>

          {/* Sisi Kanan: Portal View */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              Lihat Web Warga &rarr;
            </Link>
          </div>
        </header>

        {/* Mobile Menu Drawer Overlay */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-dark/50 z-40" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Mobile Menu Drawer Content */}
        <aside
          className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-dark text-white z-50 flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Brand Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                <Image
                  src="/logo-rt.png"
                  alt="Logo RT 05 RW 19"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-white leading-tight">Dasbor Admin</span>
                <span className="text-[9px] text-gray-500 font-bold tracking-wider uppercase">RT 05 RW 19</span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              
              if (item.subItems) {
                return (
                  <div key={item.name} className="flex flex-col gap-1">
                    <span className="px-3 py-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                      {item.name}
                    </span>
                    <div className="pl-3 flex flex-col gap-1 border-l border-gray-800 ml-3">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`px-3 py-2 text-xs rounded-lg transition-colors font-semibold block ${
                            pathname === sub.href
                              ? 'bg-primary text-white'
                              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all font-bold ${
                    pathname === item.href
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-400 hover:bg-gray-800/40'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-800 flex flex-col gap-2.5">
            <span className="text-[10px] text-gray-500 px-2 truncate">{adminEmail}</span>
            <button
              onClick={handleSignOut}
              className="w-full bg-gray-800 hover:bg-primary hover:text-white text-gray-400 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </aside>

        {/* AREA KONTEN UTAMA */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
