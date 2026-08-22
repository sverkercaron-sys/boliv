-- BoLiv content engine and editorial access

alter table public.content_items
  add column if not exists reading_time_minutes integer not null default 5,
  add column if not exists featured boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

alter table public.taxonomy_terms enable row level security;
alter table public.content_items enable row level security;

create or replace function public.has_editor_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('writer', 'editor', 'admin')
  );
$$;

revoke all on function public.has_editor_role() from public;
grant execute on function public.has_editor_role() to anon, authenticated;

drop policy if exists taxonomy_public_read on public.taxonomy_terms;
create policy taxonomy_public_read on public.taxonomy_terms
  for select using (true);

drop policy if exists taxonomy_editor_write on public.taxonomy_terms;
create policy taxonomy_editor_write on public.taxonomy_terms
  for all to authenticated
  using (public.has_editor_role())
  with check (public.has_editor_role());

drop policy if exists content_published_read on public.content_items;
create policy content_published_read on public.content_items
  for select using (status = 'published' or public.has_editor_role());

drop policy if exists content_editor_insert on public.content_items;
create policy content_editor_insert on public.content_items
  for insert to authenticated
  with check (public.has_editor_role());

drop policy if exists content_editor_update on public.content_items;
create policy content_editor_update on public.content_items
  for update to authenticated
  using (public.has_editor_role())
  with check (public.has_editor_role());

drop policy if exists content_editor_delete on public.content_items;
create policy content_editor_delete on public.content_items
  for delete to authenticated
  using (public.has_editor_role());

insert into public.taxonomy_terms (term_type, name, slug, description, sort_order)
values
  ('category', 'Bygga', 'bygga', 'Nybyggnation, tillbyggnad och bygglov.', 10),
  ('category', 'Renovera', 'renovera', 'Renovering av husets alla delar.', 20),
  ('category', 'Underhålla', 'underhalla', 'Planerat och förebyggande underhåll.', 30),
  ('category', 'Köpa & sälja', 'kopa-bostad', 'Tryggare bostadsaffärer.', 40),
  ('category', 'Ekonomi', 'ekonomi', 'Budget, finansiering och boendekostnader.', 50),
  ('category', 'Energi', 'energi', 'Uppvärmning och energieffektivisering.', 60)
on conflict (term_type, slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

create index if not exists content_items_status_published_idx
  on public.content_items (status, published_at desc);
create index if not exists content_items_category_idx
  on public.content_items (primary_category_id);
