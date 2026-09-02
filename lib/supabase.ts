import { createBrowserClient as createBrowserClientSSR, createServerClient as createServerClientSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper Fallback Kredensial untuk mencegah server-crash saat .env belum diset
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-rt05.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

// Helper 1: Client Browser (untuk Client Components)
export function createClient() {
  return createBrowserClientSSR(
    supabaseUrl,
    supabaseAnonKey
  );
}

// Helper 2: Client Server (untuk Server Components, Server Actions, Route Handlers)
// RLS diaktifkan secara default sesuai session user
export async function createServerClient() {
  const cookieStore = await cookies();

  return createServerClientSSR(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Dipanggil dari Server Component (tidak bisa set cookie, abaikan)
          }
        },
      },
    }
  );
}

// Helper 3: Client Admin Server (HANYA di sisi Server)
// Menggunakan SUPABASE_SERVICE_ROLE_KEY untuk bypass RLS
// Digunakan secara terbatas untuk operasi internal seperti verifikasi QR, 
// pelacakan pelapor/pemohon, dan perubahan status otomatis yang tidak terikat sesi user admin.
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClientSSR(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Dipanggil dari Server Component, abaikan
          }
        },
      },
    }
  );
}
