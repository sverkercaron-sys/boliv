-- BoLiv project and private document storage policies

alter table public.user_roles enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;

drop policy if exists user_roles_read_own on public.user_roles;
create policy user_roles_read_own on public.user_roles
  for select using (user_id = auth.uid());

drop policy if exists projects_own on public.projects;
create policy projects_own on public.projects
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists documents_own on public.documents;
create policy documents_own on public.documents
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-documents',
  'property-documents',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png','image/webp','text/plain']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists property_documents_select_own on storage.objects;
create policy property_documents_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists property_documents_insert_own on storage.objects;
create policy property_documents_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists property_documents_delete_own on storage.objects;
create policy property_documents_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);
