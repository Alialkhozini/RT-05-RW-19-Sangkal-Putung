'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inisialisasi Supabase client browser-side (dengan fallback aman untuk static build)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!currentUrl || currentUrl.includes('placeholder')) {
      setError('Email atau kata sandi salah. Silakan periksa kembali akun admin Anda di Supabase.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error('Supabase Auth Error:', authError);
        setError(authError.message === 'Invalid login credentials'
          ? 'Email atau kata sandi salah. Silakan periksa kembali akun admin Anda di Supabase.'
          : authError.message);
      } else {
        router.refresh();
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      console.error('Login Exception Error:', err);
      setError(err?.message ? `Gagal terhubung ke Supabase (${err.message}). Pastikan dev server sudah direstart dan koneksi internet aktif.` : 'Terjadi kesalahan koneksi sistem. Mohon coba sesaat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-gray p-8 md:p-10 shadow-lg flex flex-col gap-6 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <Link href="/" className="w-16 h-16 flex items-center justify-center hover:scale-105 transition-transform" title="Kembali ke Beranda">
            <Image
              src="/logo-rt.png"
              alt="Logo RT 05 RW 19"
              width={64}
              height={64}
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </Link>
          <div className="flex flex-col gap-1 mt-1">
            <h1 className="text-xl font-extrabold text-dark leading-tight">Admin RT 05 RW 19</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Kelola Informasi & Layanan Warga
            </p>
          </div>
        </div>

        {/* Tampilan Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-error-rt text-xs font-bold p-3.5 rounded-xl flex items-start gap-1.5 leading-relaxed">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulir Login */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              label="Alamat Email"
              type="email"
              placeholder="admin@rt05rw19.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
            <Mail className="absolute left-3.5 top-[39px] w-4 h-4 text-gray-400" />
          </div>

          <div className="relative">
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
            <Lock className="absolute left-3.5 top-[39px] w-4 h-4 text-gray-400" />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 mt-2"
          >
            Masuk ke Dasbor
          </Button>
        </form>

        <div className="border-t border-neutral-gray pt-4 mt-2 text-center">
          <Link href="/" className="text-xs font-bold text-gray-400 hover:text-primary transition-colors">
            &larr; Kembali ke Website Warga
          </Link>
        </div>
      </div>
    </main>
  );
}
