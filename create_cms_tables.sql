-- Migração para tabelas do CMS

-- 1. Tabela de Banners da Home
CREATE TABLE IF NOT EXISTS public.site_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    button_text TEXT DEFAULT 'Ver Detalhes',
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Depoimentos
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT, -- Profissão ou 'Cliente'
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies Banners
CREATE POLICY "Public read banners" ON public.site_banners FOR SELECT USING (true);
CREATE POLICY "Auth insert banners" ON public.site_banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update banners" ON public.site_banners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete banners" ON public.site_banners FOR DELETE TO authenticated USING (true);

-- Policies Testimonials
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Auth insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);

-- Storage bucket for site assets if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access Site Assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Auth Upload Site Assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "Auth Update Site Assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets');
CREATE POLICY "Auth Delete Site Assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets');
