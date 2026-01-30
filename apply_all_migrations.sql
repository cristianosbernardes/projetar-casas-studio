-- MIGRATION CONSOLIDADA --
-- Execute este script no SQL Editor do Supabase para criar todas as tabelas necessárias.

-- 1. Tabela de Logs de Auditoria (System Logs)
CREATE TYPE public.log_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'OTHER');
CREATE TYPE public.log_entity AS ENUM ('AUTH', 'PROJECTS', 'LEADS', 'SETTINGS', 'CMS', 'FINANCE', 'USERS');

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- Usando TEXT para flexibilidade ou log_action
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" 
    ON public.system_logs FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('master', 'partner')
        )
    );

CREATE POLICY "System can insert logs" 
    ON public.system_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- 2. Tabelas do CMS
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

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read banners" ON public.site_banners FOR SELECT USING (true);
CREATE POLICY "Auth insert banners" ON public.site_banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update banners" ON public.site_banners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete banners" ON public.site_banners FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Auth insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);

-- Bucket de Assets
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access Site Assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Auth Upload Site Assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "Auth Update Site Assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets');
CREATE POLICY "Auth Delete Site Assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets');

-- 3. Tabela Financeira (Vendas)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID, -- Opcional
    project_id UUID REFERENCES public.projects(id), -- Opcional
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_document TEXT, 
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'paid', 
    payment_method TEXT, 
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Masters and Partners can view sales"
    ON public.sales FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('master', 'partner')
        )
    );

CREATE POLICY "Masters and Partners can insert sales"
    ON public.sales FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('master', 'partner')
        )
    );
    
CREATE POLICY "Masters can update sales"
    ON public.sales FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'master'
        )
    );

-- 4. Tabela de Templates de Mensagem
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates" ON public.message_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert templates" ON public.message_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update templates" ON public.message_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete templates" ON public.message_templates FOR DELETE TO authenticated USING (true);
