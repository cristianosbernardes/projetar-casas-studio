-- Create a storage bucket for lead attachments
insert into storage.buckets (id, name, public)
values ('lead-attachments', 'lead-attachments', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket (allow public read/write for now for simplicity, or restricted)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'lead-attachments' );

create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'lead-attachments' );

-- Add attachment_url column to leads table
alter table leads 
add column if not exists attachment_url text;
