
-- Garantir que a tabela leads existe corretamente
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  whatsapp text,
  project_id uuid references public.projects(id), -- Opcional, qual projeto estava vendo
  status text default 'new', -- new, checkout_started, purchased
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
  using (auth.role() = 'authenticated');
