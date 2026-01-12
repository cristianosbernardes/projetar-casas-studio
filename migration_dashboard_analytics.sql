-- Migration for Dashboard Analytics
-- Adiciona coluna de contagem de visualizações aos projetos
ALTER TABLE projects ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Adiciona coluna de status aos leads para funil de vendas
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'; -- 'new', 'in_progress', 'closed_won', 'closed_lost'

-- Criar índice para performance em queries de views
CREATE INDEX IF NOT EXISTS idx_projects_views ON projects(views DESC);

-- Função segura para incrementar visualizações (pode ser chamada anonimamente via RPC)
CREATE OR REPLACE FUNCTION increment_project_view(p_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  UPDATE projects
  SET views = COALESCE(views, 0) + 1
  WHERE slug = p_slug;
END;
$$;

-- Global System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default settings if they don't exist
INSERT INTO system_settings (key, value, description)
VALUES 
  ('whatsapp_main', '5511999999999', 'Número principal do WhatsApp para contato'),
  ('base_price_sqm', '2500', 'Preço base por m² para estimativas'),
  ('site_title', 'Projetar Casas Studio', 'Título do site para SEO'),
  ('contact_email', 'contato@projetarcasas.com.br', 'Email para recebimento de leads')
ON CONFLICT (key) DO NOTHING;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies (Simplified for admin usage)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON system_settings FOR UPDATE USING (auth.role() = 'authenticated'); -- Adjust based on actual roles if needed

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System insert logs" ON audit_logs FOR INSERT USING (true);
