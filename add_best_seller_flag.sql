-- Adicionar flag de "Mais Vendido" na tabela de projetos
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;

-- Criar índice para melhorar performance das buscas por mais vendidos
CREATE INDEX IF NOT EXISTS idx_projects_best_seller ON public.projects(is_best_seller);

-- Opcional: Marcar alguns projetos existentes como best sellers para teste inicial
-- UPDATE public.projects SET is_best_seller = TRUE WHERE id IN (SELECT id FROM public.projects LIMIT 3);
