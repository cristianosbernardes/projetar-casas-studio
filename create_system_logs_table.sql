-- Migração para criar tabela de Logs de Auditoria

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'
    entity TEXT NOT NULL, -- 'LEADS', 'PROJECTS', 'SETTINGS', 'AUTH', 'USERS', 'FINANCE', 'CMS'
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso

-- Apenas Master e Sócios podem ver os logs
CREATE POLICY "Masters and Partners can view all logs"
    ON public.system_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('master', 'partner')
        )
    );

-- Qualquer usuário autenticado pode criar um log (o sistema dispara o log em nome do user)
CREATE POLICY "Authenticated users can insert logs"
    ON public.system_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action_type ON public.system_logs(action_type);
