-- BoLiv Partner: local markets, public listings and partner leads

create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(company_name) between 2 and 120),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  organization_number text check (organization_number is null or char_length(organization_number) <= 30),
  municipality_code text references public.municipalities(code),
  service_category_id uuid references public.service_categories(id),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'new',
  source_path text,
  created_at timestamptz not null default now()
);

alter table public.municipalities enable row level security;
alter table public.service_categories enable row level security;
alter table public.partner_organizations enable row level security;
alter table public.partner_placements enable row level security;
alter table public.partner_leads enable row level security;

drop policy if exists municipalities_public_read on public.municipalities;
create policy municipalities_public_read on public.municipalities for select using (true);
drop policy if exists service_categories_public_read on public.service_categories;
create policy service_categories_public_read on public.service_categories for select using (true);

drop policy if exists partner_organizations_public_read on public.partner_organizations;
create policy partner_organizations_public_read on public.partner_organizations
  for select using (status = 'active' or public.has_editor_role());
drop policy if exists partner_organizations_editor_write on public.partner_organizations;
create policy partner_organizations_editor_write on public.partner_organizations
  for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());

drop policy if exists partner_placements_public_read on public.partner_placements;
create policy partner_placements_public_read on public.partner_placements
  for select using (status = 'active' or public.has_editor_role());
drop policy if exists partner_placements_editor_write on public.partner_placements;
create policy partner_placements_editor_write on public.partner_placements
  for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());

drop policy if exists partner_leads_public_insert on public.partner_leads;
create policy partner_leads_public_insert on public.partner_leads
  for insert to anon, authenticated with check (status = 'new');
drop policy if exists partner_leads_editor_read on public.partner_leads;
create policy partner_leads_editor_read on public.partner_leads
  for select to authenticated using (public.has_editor_role());
drop policy if exists partner_leads_editor_update on public.partner_leads;
create policy partner_leads_editor_update on public.partner_leads
  for update to authenticated using (public.has_editor_role()) with check (public.has_editor_role());

insert into public.service_categories (name, slug, description)
values ('Takläggare', 'taklaggare', 'Takbyte, takrenovering, reparation och taksäkerhet.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.municipalities (code, name, county_name, slug)
values
  ('1490', 'Borås', 'Västra Götalands län', 'boras'),
  ('1480', 'Göteborg', 'Västra Götalands län', 'goteborg'),
  ('0180', 'Stockholm', 'Stockholms län', 'stockholm'),
  ('1280', 'Malmö', 'Skåne län', 'malmo'),
  ('0380', 'Uppsala', 'Uppsala län', 'uppsala'),
  ('0580', 'Linköping', 'Östergötlands län', 'linkoping'),
  ('1880', 'Örebro', 'Örebro län', 'orebro'),
  ('1980', 'Västerås', 'Västmanlands län', 'vasteras'),
  ('1283', 'Helsingborg', 'Skåne län', 'helsingborg'),
  ('0680', 'Jönköping', 'Jönköpings län', 'jonkoping'),
  ('0581', 'Norrköping', 'Östergötlands län', 'norrkoping'),
  ('1281', 'Lund', 'Skåne län', 'lund'),
  ('2480', 'Umeå', 'Västerbottens län', 'umea'),
  ('2180', 'Gävle', 'Gävleborgs län', 'gavle'),
  ('1380', 'Halmstad', 'Hallands län', 'halmstad')
on conflict (code) do update set
  name = excluded.name,
  county_name = excluded.county_name,
  slug = excluded.slug;

create index if not exists partner_leads_created_idx on public.partner_leads (created_at desc);
create index if not exists partner_leads_market_idx on public.partner_leads (service_category_id, municipality_code);
