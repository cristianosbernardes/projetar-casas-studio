-- =====================================================
-- CORREÇÃO DO EDITOR SQL (RPC V2)
-- =====================================================

-- 1. Remove a função antiga para evitar conflito de tipo de retorno (Erro 42P13)
-- Isso é necessário porque não se pode mudar o tipo de retorno com CREATE OR REPLACE
DROP FUNCTION IF EXISTS public.admin_exec_sql(text);

-- 2. Cria a nova versão da função de forma segura
CREATE OR REPLACE FUNCTION public.admin_exec_sql(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de superusuário
AS $$
DECLARE
    result JSON;
    current_user_role public.app_role;
BEGIN
    -- 1. Verifica quem está chamando a função buscando na tabela profiles
    SELECT role INTO current_user_role
    FROM public.profiles
    WHERE id = auth.uid();

    -- 2. Bloqueia se não for Master
    IF current_user_role IS DISTINCT FROM 'master' THEN
        RAISE EXCEPTION 'Acesso negado. Apenas usuários Master podem executar SQL direto.';
    END IF;

    -- 3. Executa a query
    -- Se for um SELECT/WITH, retorna os dados como JSON array
    IF (query_text ~* '^\s*(SELECT|WITH)') THEN
        EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || query_text || ') t' INTO result;
    ELSE
        -- Se for DDL/DML (ALTER, UPDATE, INSERT), apenas executa e retorna sucesso
        EXECUTE query_text;
        result := json_build_object('message', 'Comando executado com sucesso');
    END IF;
    
    RETURN result;

EXCEPTION WHEN OTHERS THEN
    -- Captura e retorna o erro para o frontend
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- 3. Garante que a função seja acessível aos usuários autenticados
GRANT EXECUTE ON FUNCTION public.admin_exec_sql(TEXT) TO authenticated;

-- Comentário para documentação do banco
COMMENT ON FUNCTION public.admin_exec_sql(TEXT) IS 'RPC para execução de SQL dinâmico restrito a usuários com cargo master.';
