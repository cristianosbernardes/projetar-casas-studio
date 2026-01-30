-- Tabela de Templates de Mensagens (WhatsApp/Email)
-- Fase 4

CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'sales', 'follow_up', 'general'
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates"
    ON public.message_templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert templates"
    ON public.message_templates FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update templates"
    ON public.message_templates FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete templates"
    ON public.message_templates FOR DELETE
    TO authenticated
    USING (true);
