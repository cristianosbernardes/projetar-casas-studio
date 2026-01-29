-- Script para adicionar TODAS as colunas faltantes na tabela modification_requests
-- Execute este script no SQL Editor do painel admin

-- Adicionar colunas relacionadas ao país e WhatsApp
ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR';

ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS country_ddi TEXT DEFAULT '+55';

ALTER TABLE modification_requests
ADD COLUMN IF NOT EXISTS whatsapp_full TEXT;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_modification_requests_country 
ON modification_requests(country);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN modification_requests.country IS 'Código do país (ex: BR, PT, US)';
COMMENT ON COLUMN modification_requests.country_ddi IS 'DDI do país (ex: +55, +351, +1)';
COMMENT ON COLUMN modification_requests.whatsapp_full IS 'WhatsApp completo com DDI (ex: +5511999887766)';
