-- Create modification_requests table
create table public.modification_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Project relationship (optional link, keeps title snapshot)
  project_id uuid references public.projects(id),
  project_title text,
  
  -- Customer Details
  name text not null,
  email text not null,
  whatsapp text not null,
  
  -- Terrain Details
  topography text, -- flat, uphill, downhill
  width text,
  depth text,
  
  -- Request Details
  description text,
  phase text, -- idea, planning, ready
  timeline text, -- 30-days, 3-months, undefined
  
  -- Extra / Metadata
  want_bbq boolean default false,
  want_call boolean default false,
  call_time text,
  source text,
  
  -- Status management
  status text default 'new' -- new, contacted, closed
);

-- Set up RLS (Row Level Security)
alter table public.modification_requests enable row level security;

-- Policy: Anyone can insert (public form)
create policy "Anyone can create modification requests"
  on public.modification_requests for insert
  with check (true);

-- Policy: Only authenticated users (admins) can view
create policy "Authenticated users can view requests"
  on public.modification_requests for select
  using (auth.role() = 'authenticated');

-- Policy: Only authenticated users (admins) can update (e.g. status)
create policy "Authenticated users can update requests"
  on public.modification_requests for update
  using (auth.role() = 'authenticated');
