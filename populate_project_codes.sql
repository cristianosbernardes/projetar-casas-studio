
-- Tenta extrair o código do título se existir no formato "Cód. XXX"
UPDATE projects
SET code = substring(title from 'Cód\. (\d+)')
WHERE code IS NULL AND title LIKE '%Cód.%';

-- Para os que ainda ficaram NULL, gera um código sequencial baseado no ID ordenado
WITH numbered_projects AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) + 1000 as row_num
  FROM projects
  WHERE code IS NULL
)
UPDATE projects
SET code = numbered_projects.row_num::text
FROM numbered_projects
WHERE projects.id = numbered_projects.id AND projects.code IS NULL;
