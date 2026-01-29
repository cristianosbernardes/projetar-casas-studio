alter table public.modification_requests 
add column if not exists address text;

alter table public.modification_requests
add column if not exists country_code text default '+55';
