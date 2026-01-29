import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, Play, Save, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
        }
    ];

    const loadPreset = (sql: string) => {
        setQuery(sql);
    };

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
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Terminal className="h-4 w-4" />
                                Editor de Query
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="font-mono min-h-[200px] bg-slate-950 text-slate-50 border-slate-800"
                                placeholder="SELECT * FROM table..."
                            />
                            <div className="flex justify-end mt-4">
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

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Presets</CardTitle>
                            <CardDescription>Queries pré-configuradas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {presets.map((preset, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className="w-full justify-start text-left h-auto py-3"
                                    onClick={() => loadPreset(preset.sql)}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-medium">{preset.name}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {preset.sql}
                                        </span>
                                    </div>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
