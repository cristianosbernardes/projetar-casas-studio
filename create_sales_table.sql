-- Tabela de Vendas e Financeiro
-- Fase 3

CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id), -- Opcional, se veio de um lead
    project_id UUID REFERENCES public.projects(id), -- Opcional, se foi venda de projeto
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_document TEXT, -- CPF/CNPJ
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'paid', -- 'pending', 'paid', 'cancelled', 'refunded'
    payment_method TEXT, -- 'pix', 'credit_card', 'transfer'
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

-- RLS
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
