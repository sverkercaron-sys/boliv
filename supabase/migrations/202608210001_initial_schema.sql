-- BoLiv initial Supabase migration
create extension if not exists pgcrypto;

create type public.app_role as enum ('member', 'writer', 'editor', 'partner_manager', 'admin');
create type public.content_status as enum ('draft', 'review', 'scheduled', 'published', 'archived');
create type public.placement_status as enum ('available', 'reserved', 'active', 'paused', 'ended');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'member',
  primary key (user_id, role)
);

create table public.taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  term_type text not null,
  parent_id uuid references public.taxonomy_terms(id),
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  unique (term_type, slug)
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  content_type text not null default 'guide',
  title text not null,
  slug text not null unique,
  excerpt text,
  body jsonb not null default '[]'::jsonb,
  primary_category_id uuid references public.taxonomy_terms(id),
  author_id uuid references public.profiles(id),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  property_type text,
  address_line text,
  postal_code text,
  city text,
  municipality_code text,
  construction_year integer,
  living_area_m2 numeric(10,2),
  move_in_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  status text not null default 'idea',
  budget_amount numeric(14,2),
  actual_amount numeric(14,2),
  created_at timestamptz not null default now()
);

create table public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'planned',
  priority smallint not null default 2,
  interval_months integer,
  due_date date,
  completed_at timestamptz,
  estimated_cost numeric(14,2),
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  document_type text,
  storage_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.municipalities (
  code text primary key,
  name text not null unique,
  county_name text not null,
  slug text not null unique
);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text
);

create table public.partner_organizations (
  id uuid primary key default gen_random_uuid(),
  organization_number text unique,
  name text not null,
  slug text not null unique,
  description text,
  email text,
  phone text,
  website_url text,
  status text not null default 'prospect',
  created_at timestamptz not null default now()
);

create table public.partner_placements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.partner_organizations(id),
  service_category_id uuid not null references public.service_categories(id),
  municipality_code text not null references public.municipalities(code),
  status public.placement_status not null default 'available',
  reserved_until timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index one_active_partner_per_market
  on public.partner_placements (service_category_id, municipality_code)
  where status in ('reserved', 'active');

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.projects enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.documents enable row level security;

create policy profiles_own on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());
create policy properties_own on public.properties for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy projects_own on public.projects for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy tasks_own on public.maintenance_tasks for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy documents_own on public.documents for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
