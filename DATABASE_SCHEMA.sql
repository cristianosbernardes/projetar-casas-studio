-- =====================================================
-- SQL MIGRATION FOR PROJETAR CASAS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    width_meters NUMERIC NOT NULL DEFAULT 0,
    depth_meters NUMERIC NOT NULL DEFAULT 0,
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms INTEGER NOT NULL DEFAULT 0,
    suites INTEGER NOT NULL DEFAULT 0,
    garage_spots INTEGER NOT NULL DEFAULT 0,
    built_area NUMERIC NOT NULL DEFAULT 0,
    style TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Complementary project prices
    price_electrical NUMERIC DEFAULT 0,
    price_hydraulic NUMERIC DEFAULT 0,
    price_sanitary NUMERIC DEFAULT 0,
    price_structural NUMERIC DEFAULT 0
);

-- 2. Create the project_images table
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0
);

-- 3. Create the leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    terrain_dimensions TEXT,
    project_id UUID REFERENCES public.projects(id),
    selected_packages TEXT[], -- Array of selected packages
    total_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_dimensions ON public.projects(width_meters, depth_meters);
CREATE INDEX IF NOT EXISTS idx_project_images_project ON public.project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_cover ON public.project_images(is_cover);

-- 5. Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for projects (public read, authenticated write)
CREATE POLICY "Projects are viewable by everyone" 
    ON public.projects FOR SELECT 
    USING (true);

CREATE POLICY "Projects are insertable by authenticated users" 
    ON public.projects FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Projects are updatable by authenticated users" 
    ON public.projects FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Projects are deletable by authenticated users" 
    ON public.projects FOR DELETE 
    TO authenticated 
    USING (true);

-- 7. RLS Policies for project_images
CREATE POLICY "Project images are viewable by everyone" 
    ON public.project_images FOR SELECT 
    USING (true);

CREATE POLICY "Project images are insertable by authenticated users" 
    ON public.project_images FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Project images are updatable by authenticated users" 
    ON public.project_images FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Project images are deletable by authenticated users" 
    ON public.project_images FOR DELETE 
    TO authenticated 
    USING (true);

-- 8. RLS Policies for leads (anyone can insert, only authenticated can read)
CREATE POLICY "Anyone can create leads" 
    ON public.leads FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Leads are viewable by authenticated users" 
    ON public.leads FOR SELECT 
    TO authenticated 
    USING (true);

-- 9. Storage bucket for project images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);

-- 10. Storage RLS policies
-- CREATE POLICY "Anyone can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
-- CREATE POLICY "Authenticated users can upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');
-- CREATE POLICY "Authenticated users can update project images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images');
-- CREATE POLICY "Authenticated users can delete project images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images');

-- =====================================================
-- MIGRATION: Add complementary project prices to existing projects table
-- Run this if you already have the projects table created
-- =====================================================
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_electrical NUMERIC DEFAULT 0;
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_hydraulic NUMERIC DEFAULT 0;
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_sanitary NUMERIC DEFAULT 0;
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_structural NUMERIC DEFAULT 0;

-- ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);
-- ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS selected_packages TEXT[];
-- ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS total_value NUMERIC;
