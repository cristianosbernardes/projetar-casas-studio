-- Script para adicionar colunas project_id e project_code à tabela modification_requests
-- Execute este script no SQL Editor do painel admin

-- Adicionar coluna project_id (ID do projeto)
ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS project_id TEXT;

-- Adicionar coluna project_code (Código do projeto, ex: 3039)
ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS project_code TEXT;

-- Criar índice para melhorar performance de buscas por projeto
CREATE INDEX IF NOT EXISTS idx_modification_requests_project_id 
ON modification_requests(project_id);

CREATE INDEX IF NOT EXISTS idx_modification_requests_project_code 
ON modification_requests(project_code);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN modification_requests.project_id IS 'ID único do projeto no sistema';
COMMENT ON COLUMN modification_requests.project_code IS 'Código do projeto exibido ao usuário (ex: 3039)';
