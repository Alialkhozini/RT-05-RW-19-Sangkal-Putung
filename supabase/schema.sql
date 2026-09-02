-- Skema Database Website Digital RT 05 RW 19 Sangkal Putung

-- Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Profil (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triger untuk menyalin user baru dari auth.users ke public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'admin'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabel Pengaturan Website (site_settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    website_name TEXT NOT NULL DEFAULT 'RT 05 RW 19 Sangkal Putung',
    tagline TEXT NOT NULL DEFAULT 'Bersama Membangun Lingkungan yang Nyaman dan Terhubung',
    address TEXT NOT NULL DEFAULT 'RT 05 RW 19, Sangkal Putung, Kelurahan Brebes',
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    logo_url TEXT,
    favicon_url TEXT,
    rt_info TEXT,
    letter_format TEXT DEFAULT '{{number}}/RT05-RW19/{{month}}/{{year}}',
    signature_url TEXT,
    stamp_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sisipkan pengaturan default jika belum ada
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. Tabel Konten Hero (hero_content)
CREATE TABLE IF NOT EXISTS public.hero_content (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    badge TEXT DEFAULT 'WEBSITE RESMI RT 05 RW 19',
    title TEXT DEFAULT 'Selamat Datang di Website RT 05 RW 19',
    subtitle TEXT DEFAULT 'Pusat informasi dan layanan masyarakat RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.',
    cta_text TEXT DEFAULT 'Ajukan Surat',
    secondary_cta_text TEXT DEFAULT 'Lapor RT',
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.hero_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 4. Tabel Sambutan Ketua RT (rt_profile)
CREATE TABLE IF NOT EXISTS public.rt_profile (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    welcome_title TEXT DEFAULT 'Sambutan Ketua RT 05 RW 19',
    welcome_message TEXT,
    chairman_name TEXT DEFAULT 'Bpk. Budi Santoso',
    chairman_position TEXT DEFAULT 'Ketua RT 05 RW 19',
    chairman_photo_url TEXT,
    signature_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.rt_profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 5. Tabel Susunan Pengurus (rt_officers)
CREATE TABLE IF NOT EXISTS public.rt_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    photo_url TEXT,
    description TEXT,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Sejarah RT (rt_history)
CREATE TABLE IF NOT EXISTS public.rt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabel Berita (news)
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'published'
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabel Pengumuman (announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'published'
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabel Galeri (galleries)
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabel Jenis Surat (letter_types)
CREATE TABLE IF NOT EXISTS public.letter_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Tabel Templat Surat (letter_templates)
CREATE TABLE IF NOT EXISTS public.letter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_type_id UUID REFERENCES public.letter_types(id) ON DELETE CASCADE NOT NULL,
    template_name TEXT NOT NULL,
    template_content TEXT NOT NULL,
    letter_prefix TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Tabel Pengajuan Surat Warga (letter_requests)
CREATE TABLE IF NOT EXISTS public.letter_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE NOT NULL,
    letter_type_id UUID REFERENCES public.letter_types(id) ON DELETE RESTRICT NOT NULL,
    applicant_name TEXT NOT NULL,
    nik TEXT NOT NULL,
    kk_number TEXT NOT NULL,
    birth_place TEXT,
    birth_date DATE,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    purpose TEXT NOT NULL,
    form_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'revision', 'approved', 'rejected', 'completed'
    admin_note TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Tabel Dokumen Hasil Generasi (generated_documents)
CREATE TABLE IF NOT EXISTS public.generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_request_id UUID REFERENCES public.letter_requests(id) ON DELETE CASCADE UNIQUE NOT NULL,
    file_url TEXT NOT NULL,
    storage_provider TEXT DEFAULT 'cloudinary',
    public_id TEXT,
    verification_code TEXT UNIQUE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Tabel Laporan Warga (reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Keamanan', 'Kebersihan', 'Fasilitas Umum', 'Lingkungan', 'Sosial', 'Administrasi', 'Lainnya'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    photo_url TEXT,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT DEFAULT 'submitted', -- 'submitted', 'received', 'in_progress', 'resolved', 'closed', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Tabel Log Riwayat Laporan (report_updates)
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Tabel Log Aktivitas Admin (admin_activity_logs)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- DATABASE INDEXES
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_news_slug_status_pub ON public.news(slug, status, published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_slug_status_pub ON public.announcements(slug, status, published_at);
CREATE INDEX IF NOT EXISTS idx_letter_requests_num_status ON public.letter_requests(request_number, status, phone);
CREATE INDEX IF NOT EXISTS idx_reports_num_status ON public.reports(report_number, status, phone);
CREATE INDEX IF NOT EXISTS idx_generated_docs_verification ON public.generated_documents(verification_code);

-- ========================================================
-- DATABASE VIEWS (Untuk Keamanan Informasi)
-- ========================================================
-- View verifikasi publik tanpa membocorkan data pribadi warga
CREATE OR REPLACE VIEW public.public_verifications AS 
SELECT 
    gd.verification_code, 
    lr.request_number, 
    lt.name AS letter_type, 
    lr.applicant_name, 
    gd.generated_at, 
    s.website_name
FROM public.generated_documents gd
JOIN public.letter_requests lr ON gd.letter_request_id = lr.id
JOIN public.letter_types lt ON lr.letter_type_id = lt.id
CROSS JOIN (SELECT website_name FROM public.site_settings WHERE id = 1) s;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rt_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rt_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Fungsi Pembantu untuk memeriksa apakah user saat ini adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Kebijakan Profil
CREATE POLICY select_own_profile ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY all_profiles_admin ON public.profiles FOR ALL USING (public.is_admin());

-- 2. Kebijakan Site Settings
CREATE POLICY select_settings_public ON public.site_settings FOR SELECT USING (true);
CREATE POLICY all_settings_admin ON public.site_settings FOR ALL USING (public.is_admin());

-- 3. Kebijakan Hero Content
CREATE POLICY select_hero_public ON public.hero_content FOR SELECT USING (true);
CREATE POLICY all_hero_admin ON public.hero_content FOR ALL USING (public.is_admin());

-- 4. Kebijakan RT Profile
CREATE POLICY select_rt_profile_public ON public.rt_profile FOR SELECT USING (true);
CREATE POLICY all_rt_profile_admin ON public.rt_profile FOR ALL USING (public.is_admin());

-- 5. Kebijakan RT Officers
CREATE POLICY select_officers_public ON public.rt_officers FOR SELECT USING (true);
CREATE POLICY all_officers_admin ON public.rt_officers FOR ALL USING (public.is_admin());

-- 6. Kebijakan RT History
CREATE POLICY select_history_public ON public.rt_history FOR SELECT USING (true);
CREATE POLICY all_history_admin ON public.rt_history FOR ALL USING (public.is_admin());

-- 7. Kebijakan Berita (News)
CREATE POLICY select_news_public ON public.news FOR SELECT USING (status = 'published');
CREATE POLICY all_news_admin ON public.news FOR ALL USING (public.is_admin());

-- 8. Kebijakan Pengumuman (Announcements)
CREATE POLICY select_announcements_public ON public.announcements FOR SELECT USING (status = 'published');
CREATE POLICY all_announcements_admin ON public.announcements FOR ALL USING (public.is_admin());

-- 9. Kebijakan Galeri
CREATE POLICY select_gallery_public ON public.galleries FOR SELECT USING (true);
CREATE POLICY all_gallery_admin ON public.galleries FOR ALL USING (public.is_admin());

-- 10. Kebijakan Jenis Surat
CREATE POLICY select_letter_types_public ON public.letter_types FOR SELECT USING (is_active = true);
CREATE POLICY all_letter_types_admin ON public.letter_types FOR ALL USING (public.is_admin());

-- 11. Kebijakan Templat Surat
CREATE POLICY all_templates_admin ON public.letter_templates FOR ALL USING (public.is_admin());

-- 12. Kebijakan Pengajuan Surat (Public hanya bisa insert, admin bisa CRUD)
-- Pelacakan & detail diverifikasi secara aman menggunakan Server Action, sehingga tidak perlu mengekspos baris data secara terbuka.
CREATE POLICY insert_letter_request_public ON public.letter_requests FOR INSERT WITH CHECK (true);
CREATE POLICY all_letter_requests_admin ON public.letter_requests FOR ALL USING (public.is_admin());

-- 13. Kebijakan Dokumen Terbit
CREATE POLICY all_generated_docs_admin ON public.generated_documents FOR ALL USING (public.is_admin());

-- 14. Kebijakan Laporan Warga
CREATE POLICY insert_report_public ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY all_reports_admin ON public.reports FOR ALL USING (public.is_admin());

-- 15. Kebijakan Log Pembaruan Laporan
CREATE POLICY all_report_updates_admin ON public.report_updates FOR ALL USING (public.is_admin());

-- 16. Kebijakan Aktivitas Admin
CREATE POLICY all_activity_logs_admin ON public.admin_activity_logs FOR ALL USING (public.is_admin());
