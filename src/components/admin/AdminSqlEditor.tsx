import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, Play, Save, Terminal, Search, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const AdminSqlEditor = () => {
    const { toast } = useToast();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

    const runQueryMutation = useMutation({
        mutationFn: async (sql: string) => {
            const { data, error } = await supabase.rpc('admin_exec_sql', { query_text: sql });
            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            if (data && typeof data === 'object' && !Array.isArray(data) && data.error) {
                setError(data.error);
                setResults([]);
                toast({
                    title: "Erro na Query",
                    description: data.error,
                    variant: "destructive"
                });
            } else {
                setError(null);
                const resultsArray = Array.isArray(data) ? data : (data ? [data] : []);
                setResults(resultsArray);
                toast({ title: "Executado com sucesso!" });
            }
        },
        onError: (err: any) => {
            setError(err.message);
            setResults([]);
            toast({
                title: "Erro de Conexão/Permissão",
                description: err.message,
                variant: "destructive"
            });
        }
    });

    const handleRun = () => {
        if (!query.trim()) return;
        runQueryMutation.mutate(query);
    };

    const presets = [
        {
            name: "🚀 Habilitar Order Bump",
            description: "Adiciona a coluna order_bump_id na tabela projects para permitir ofertas especiais",
            sql: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_bump_id UUID REFERENCES projects(id);`
        },
        {
            name: "🏆 Adicionar Feature Mais Vendidos",
            description: "Adiciona coluna is_best_seller e índices para destaque na Home",
            sql: `-- Adicionar flag de "Mais Vendido" na tabela de projetos
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;

-- Criar índice para melhorar performance das buscas por mais vendidos
CREATE INDEX IF NOT EXISTS idx_projects_best_seller ON public.projects(is_best_seller);

-- Comentário: Após rodar, execute UPDATE projects SET is_best_seller = TRUE WHERE id = 'ID_DO_PROJETO';`
        },
        {
            name: "⚡ Definir Top 3 Recentes como Mais Vendidos",
            description: "Marca automaticamente os 3 projetos mais novos como Best Sellers",
            sql: `-- 1. Limpa a seleção atual (opcional, remova se quiser acumular)
UPDATE projects SET is_best_seller = false WHERE true;

-- 2. Marca os 3 projetos mais recentes
UPDATE projects
SET is_best_seller = true
WHERE id IN (
  SELECT id FROM projects ORDER BY created_at DESC LIMIT 3
);

-- 3. Confirmação
SELECT title, created_at, is_best_seller FROM projects WHERE is_best_seller = true ORDER BY created_at DESC;`
        },
        {
            name: "🏛️ Criar Tabela de Estilos Arquitetônicos",
            description: "Cria tabela auxiliar para gerenciar estilos no dropdown",
            sql: `-- 1. Criar tabela de estilos
CREATE TABLE IF NOT EXISTS public.project_styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Segurança)
ALTER TABLE public.project_styles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso (Leitura pública, Escrita apenas Admin)
CREATE POLICY "Estilos visíveis para todos" ON public.project_styles FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar estilos" ON public.project_styles FOR ALL USING (auth.role() = 'authenticated');

-- 4. Popular com estilos existentes (migração)
INSERT INTO public.project_styles (name)
SELECT DISTINCT style 
FROM projects 
WHERE style IS NOT NULL AND style != ''
ON CONFLICT (name) DO NOTHING;

-- 5. Inserir alguns padrões caso esteja vazio
INSERT INTO public.project_styles (name) VALUES 
('Moderno'), ('Neoclássico'), ('Industrial'), ('Rústico'), ('Minimalista')
ON CONFLICT (name) DO NOTHING;`
        },
        {
            name: "🔧 Corrigir SQL Editor (RPC)",
            sql: `-- =====================================================
-- CORREÇÃO DO EDITOR SQL (RPC V2)
-- =====================================================

-- 1. Remove a função antiga para evitar conflito de tipo de retorno (Erro 42P13)
DROP FUNCTION IF EXISTS public.admin_exec_sql(text);

-- 2. Cria a nova versão da função de forma segura
CREATE OR REPLACE FUNCTION public.admin_exec_sql(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    current_user_role public.app_role;
BEGIN
    -- 1. Verifica quem está chamando a função
    SELECT role INTO current_user_role
    FROM public.profiles
    WHERE id = auth.uid();

    -- 2. Bloqueia se não for Master
    IF current_user_role IS DISTINCT FROM 'master' THEN
        RAISE EXCEPTION 'Acesso negado. Apenas usuários Master podem executar SQL direto.';
    END IF;

    -- 3. Executa a query
    IF (query_text ~* '^\\\\s*(SELECT|WITH)') THEN
        EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || query_text || ') t' INTO result;
    ELSE
        EXECUTE query_text;
        result := json_build_object('message', 'Comando executado com sucesso');
    END IF;
    
    RETURN result;

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- 3. Garante que a função seja acessível
GRANT EXECUTE ON FUNCTION public.admin_exec_sql(TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_exec_sql(TEXT) IS 'RPC para execução de SQL dinâmico restrito a usuários com cargo master.';`
        },
        {
            name: "🏗️ Adicionar Colunas de Projeto",
            sql: `-- Adicionar TODAS as colunas necessárias à tabela modification_requests

-- Colunas de projeto
ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS project_code TEXT;

-- Colunas de país e WhatsApp
ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR';

ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS country_ddi TEXT DEFAULT '+55';

ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS whatsapp_full TEXT;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_modification_requests_project_id 
ON modification_requests(project_id);

CREATE INDEX IF NOT EXISTS idx_modification_requests_project_code 
ON modification_requests(project_code);

CREATE INDEX IF NOT EXISTS idx_modification_requests_country 
ON modification_requests(country);

-- Comentários nas colunas
COMMENT ON COLUMN modification_requests.project_id IS 'ID único do projeto no sistema';
COMMENT ON COLUMN modification_requests.project_code IS 'Código do projeto exibido ao usuário (ex: 3039)';
COMMENT ON COLUMN modification_requests.country IS 'Código do país (ex: BR, PT, US)';
COMMENT ON COLUMN modification_requests.country_ddi IS 'DDI do país (ex: +55, +351, +1)';
COMMENT ON COLUMN modification_requests.whatsapp_full IS 'WhatsApp completo com DDI (ex: +5511999887766)';`
        },
        {
            name: "📊 Listar Projetos Recentes",
            sql: "SELECT id, title, price, width_meters, depth_meters, created_at FROM projects ORDER BY created_at DESC LIMIT 20"
        },
        {
            name: "👥 Contar Usuários por Cargo",
            sql: "SELECT role, count(*) as total FROM profiles GROUP BY role"
        },
        {
            name: "📩 Visualizar Últimos Leads",
            sql: "SELECT name, email, phone, created_at, status FROM leads ORDER BY created_at DESC LIMIT 10"
        },
        {
            name: "🛠️ Criar Coluna Views (Analytics)",
            sql: "ALTER TABLE projects ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;"
        },
        {
            name: "⚙️ Ver Configurações do Sistema",
            sql: "SELECT * FROM system_settings"
        },
        {
            name: "🔍 Buscar Projeto por Slug",
            sql: "SELECT * FROM projects WHERE slug = 'casa-contemporanea-com-piscina'"
        },
        {
            name: "📈 Projetos Mais Vistos",
            sql: "SELECT title, views FROM projects WHERE views > 0 ORDER BY views DESC"
        },
        {
            name: "🧹 Limpar Cache de Projetos (Exemplo)",
            sql: "-- Este é apenas um comentário de exemplo\nSELECT 'Sistema pronto para manutenção' as status"
        },
        {
            name: '🔧 Corrigir Tabela Projetos (Status + Views)',
            description: 'Adiciona colunas status e views necessárias para duplicação',
            sql: `-- 1. Adicionar coluna Status
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

-- 2. Adicionar coluna Views (Visualizações)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 3. Atualizar projetos existentes
UPDATE projects SET status = 'published' WHERE status IS NULL;
UPDATE projects SET views = 0 WHERE views IS NULL;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`
        },
        {
            id: 'modifications-history',
            name: '📜 Criar Tabela de Histórico',
            description: 'Cria tabela para rastrear alterações de status das solicitações',
            sql: `-- Create modification_history table
CREATE TABLE IF NOT EXISTS modification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES modification_requests(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT,
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE modification_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON modification_history
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON modification_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_modification_history_request_id ON modification_history(request_id);`
        },
        {
            name: "➕ Adicionar Colunas em Leads",
            description: "Adiciona country, topography, phase e outros campos na tabela leads",
            sql: `ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS topography text,
ADD COLUMN IF NOT EXISTS width text,
ADD COLUMN IF NOT EXISTS depth text,
ADD COLUMN IF NOT EXISTS phase text,
ADD COLUMN IF NOT EXISTS timeline text,
ADD COLUMN IF NOT EXISTS want_bbq boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS want_call boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS call_time text,
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS country_ddi text;`
        },
        {
            name: "📂 Adicionar Coluna de Anexos",
            description: "Adiciona campo para link de arquivos na tabela leads",
            sql: `-- Add attachment_url column to leads table
alter table leads 
add column if not exists attachment_url text;`
        },
        {
            name: "🚀 Migração Completa (Fase 1-4)",
            description: "Cria todas as tabelas: Logs, CMS, Vendas e Templates.",
            sql: `-- MIGRATION CONSOLIDADA --
-- 1. Logs
CREATE TYPE public.log_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'OTHER');
CREATE TYPE public.log_entity AS ENUM ('AUTH', 'PROJECTS', 'LEADS', 'SETTINGS', 'CMS', 'FINANCE', 'USERS');

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all logs" ON public.system_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('master', 'partner')));
CREATE POLICY "System can insert logs" ON public.system_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 2. CMS
CREATE TABLE IF NOT EXISTS public.site_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT, subtitle TEXT, image_url TEXT NOT NULL, link_url TEXT, button_text TEXT DEFAULT 'Ver Detalhes', display_order INTEGER DEFAULT 0, active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, role TEXT, content TEXT NOT NULL, avatar_url TEXT, rating INTEGER DEFAULT 5, active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY; ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read banners" ON public.site_banners FOR SELECT USING (true);
CREATE POLICY "Auth insert banners" ON public.site_banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update banners" ON public.site_banners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete banners" ON public.site_banners FOR DELETE TO authenticated USING (true);
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Auth insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);

-- OBS: A configuração do Storage (Bucket site-assets) deve ser feita manualmente no painel do Supabase pois requer permissões de superusuário.

-- 3. Financeiro
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID, project_id UUID REFERENCES public.projects(id), customer_name TEXT NOT NULL, customer_email TEXT, customer_document TEXT, amount NUMERIC NOT NULL, status TEXT DEFAULT 'paid', payment_method TEXT, sale_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL, notes TEXT
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Masters and Partners can view sales" ON public.sales FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('master', 'partner')));
CREATE POLICY "Masters and Partners can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('master', 'partner')));
CREATE POLICY "Masters can update sales" ON public.sales FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'master'));

-- 4. Templates
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, content TEXT NOT NULL, category TEXT DEFAULT 'general', active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL, created_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view templates" ON public.message_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert templates" ON public.message_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update templates" ON public.message_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete templates" ON public.message_templates FOR DELETE TO authenticated USING (true);`
        },
        {
            name: "🔔 Criar Tabela de Notificações",
            description: "Cria tabela notifications com RLS e políticas.",
            sql: `-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Start with a broad insert policy for system logic (or use service role in edge functions)
-- For client-side inserts (e.g. requesting something), allow authenticated
CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow users to mark as read (update)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);`
        },
        {
            name: "🔔 Enviar Notificação de Teste",
            description: "Envia uma notificação para você mesmo para testar o componente.",
            sql: `INSERT INTO notifications (user_id, title, message, link, type)
VALUES (
  auth.uid(),
  'Teste de Notificação 🚀',
  'Funcionalidade ativa! Esta notificação foi gerada via SQL Editor.',
  '/admin',
  'success'
);`
        },
        {
            name: "🔧 Habilitar Realtime (Obrigatório)",
            description: "Ativa as atualizações em tempo real para notificações.",
            sql: `DO $$
BEGIN
  -- Tenta remover a tabela para evitar duplicação (ignora se não existir)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE notifications;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Adiciona a tabela ao realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
END $$;`
        },
        {
            name: "🔒 Criar Tabela de Leads (Corrigida)",
            description: "Cria a tabela leads correta para captura de checkout e CRM",
            sql: `-- Garantir que a tabela leads existe corretamente
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  whatsapp text,
  project_id uuid references public.projects(id),
  status text default 'new',
  source text default 'checkout_modal'
);

-- Habilitar RLS
alter table public.leads enable row level security;

-- Política de inserção (qualquer um pode criar lead no checkout)
create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);

-- Política de leitura (apenas autenticados/admin)
create policy "Authenticated users can view leads"
  on public.leads for select
  using (auth.role() = 'authenticated');`
        },
        {
            name: "📝 Adicionar Metadados em Leads",
            description: "Adiciona coluna JSONB para salvar detalhes do carrinho (addons, múltiplos itens)",
            sql: `-- Adicionar coluna metadata se não existir
alter table public.leads 
add column if not exists metadata jsonb default '{}'::jsonb;`
        },
        {
            name: "🔧 Corrigir Tabela Leads (Colunas Faltantes)",
            description: "Cria as colunas necessárias para o formulário de projetos personalizados.",
            sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS topography text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS width text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS depth text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phase text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS want_bbq boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS want_call boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_time text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS country text DEFAULT 'BR';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS country_ddi text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp text;`
        },
        {
            name: "🔓 Liberar Inserção em Leads (RLS)",
            description: "Permite que qualquer pessoa (mesmo sem login) envie formulários.",
            sql: `-- Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Criar política permissiva para inserção
CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Garantir leitura para autenticados (Admin)
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

CREATE POLICY "Authenticated users can view leads"
ON public.leads
FOR SELECT
USING (auth.role() = 'authenticated');`
        }
    ];

    const loadPreset = (preset: { name: string, sql: string }) => {
        setQuery(preset.sql);
        setSelectedPreset(preset.name);
    };

    const filteredPresets = presets.filter(preset =>
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.sql.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        Banco SQL
                    </h2>
                    <p className="text-muted-foreground">
                        Execute comandos SQL diretamente no banco de dados. Acesso restrito.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Terminal className="h-4 w-4" />
                                Editor de Query
                                {selectedPreset && (
                                    <Badge variant="secondary" className="ml-2 font-normal text-xs bg-primary/10 text-primary border-primary/20">
                                        {selectedPreset}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="font-mono min-h-[200px] bg-slate-950 text-slate-50 border-slate-800"
                                placeholder="SELECT * FROM table..."
                            />
                            <div className="flex justify-between mt-4">
                                <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setSelectedPreset(null); }} className="text-muted-foreground hover:text-destructive">
                                    Limpar
                                </Button>
                                <Button onClick={handleRun} disabled={runQueryMutation.isPending} className="gap-2">
                                    {runQueryMutation.isPending ? (
                                        "Executando..."
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4" /> Run Query
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20 font-mono text-sm">
                            Error: {error}
                        </div>
                    )}

                    {results.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultados ({results.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-auto max-h-[500px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(results[0]).map((key) => (
                                                <TableHead key={key}>{key}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(row).map((val: any, j) => (
                                                    <TableCell key={j} className="font-mono text-xs">
                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-4 h-[600px] flex flex-col">
                    <Card className="flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Presets Disponíveis</CardTitle>
                            <CardDescription>Queries pré-configuradas para análise rápida</CardDescription>
                            <div className="pt-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar preset..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredPresets.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-8">Nenhum preset encontrado.</p>
                            ) : (
                                filteredPresets.map((preset, idx) => (
                                    <Button
                                        key={idx}
                                        variant={selectedPreset === preset.name ? "secondary" : "outline"}
                                        className={cn(
                                            "w-full justify-start text-left h-auto py-3 px-3 transition-all",
                                            selectedPreset === preset.name ? "border-primary/50 bg-primary/5 shadow-sm" : "hover:border-primary/30"
                                        )}
                                        onClick={() => loadPreset(preset)}
                                    >
                                        <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium truncate">{preset.name}</span>
                                                {selectedPreset === preset.name && <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate w-full opacity-80">
                                                {preset.description || preset.sql}
                                            </span>
                                        </div>
                                    </Button>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
