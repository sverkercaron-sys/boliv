-- BoLiv Partner administration v2: commercial fields and event tracking

alter table public.partner_organizations
  add column if not exists internal_notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.partner_placements
  add column if not exists monthly_price numeric(12,2),
  add column if not exists currency text not null default 'SEK',
  add column if not exists internal_notes text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.partner_events (
  id bigint generated always as identity primary key,
  placement_id uuid not null references public.partner_placements(id) on delete cascade,
  event_type text not null check (event_type in ('website_click', 'phone_click', 'lead')),
  source_path text,
  created_at timestamptz not null default now()
);

alter table public.partner_events enable row level security;

drop policy if exists partner_events_public_insert on public.partner_events;
create policy partner_events_public_insert on public.partner_events
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.partner_placements p
      where p.id = placement_id and p.status = 'active'
    )
  );

drop policy if exists partner_events_editor_read on public.partner_events;
create policy partner_events_editor_read on public.partner_events
  for select to authenticated using (public.has_editor_role());

create index if not exists partner_events_placement_created_idx
  on public.partner_events (placement_id, created_at desc);
create index if not exists partner_placements_status_idx
  on public.partner_placements (status, municipality_code);
