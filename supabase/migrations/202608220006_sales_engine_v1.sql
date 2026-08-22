-- BoLiv automated sales engine v1

create table if not exists public.sales_prospects (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  organization_number text,
  website_url text,
  email text not null,
  phone text,
  contact_name text,
  municipality_code text not null references public.municipalities(code),
  service_category_id uuid not null references public.service_categories(id),
  source_name text,
  source_url text,
  score integer not null default 50 check (score between 0 and 100),
  status text not null default 'new' check (status in ('new','review','approved','contacted','replied','qualified','won','lost','suppressed')),
  notes text,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sales_prospects_market_email_unique
  on public.sales_prospects (service_category_id, municipality_code, lower(email));
create index if not exists sales_prospects_queue_idx
  on public.sales_prospects (status, score desc, created_at);

create table if not exists public.sales_messages (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.sales_prospects(id) on delete cascade,
  sequence_step integer not null default 1 check (sequence_step between 1 and 10),
  subject text not null,
  body_text text not null,
  status text not null default 'draft' check (status in ('draft','approved','sent','failed','cancelled')),
  scheduled_at timestamptz,
  approved_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create unique index if not exists sales_messages_prospect_step_unique
  on public.sales_messages (prospect_id, sequence_step);
create index if not exists sales_messages_outbox_idx
  on public.sales_messages (status, scheduled_at);

create table if not exists public.sales_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  reason text not null default 'opt_out',
  source text,
  created_at timestamptz not null default now()
);
create unique index if not exists sales_suppressions_email_unique
  on public.sales_suppressions (lower(email));

alter table public.sales_prospects enable row level security;
alter table public.sales_messages enable row level security;
alter table public.sales_suppressions enable row level security;

drop policy if exists sales_prospects_editor_all on public.sales_prospects;
create policy sales_prospects_editor_all on public.sales_prospects
  for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
drop policy if exists sales_messages_editor_all on public.sales_messages;
create policy sales_messages_editor_all on public.sales_messages
  for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
drop policy if exists sales_suppressions_editor_all on public.sales_suppressions;
create policy sales_suppressions_editor_all on public.sales_suppressions
  for all to authenticated using (public.has_editor_role()) with check (public.has_editor_role());

create or replace function public.unsubscribe_sales_email(token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare prospect_email text;
begin
  select email into prospect_email from public.sales_prospects where unsubscribe_token = token;
  if prospect_email is null then return false; end if;
  insert into public.sales_suppressions (email, reason, source)
  values (prospect_email, 'opt_out', 'unsubscribe_link')
  on conflict (lower(email)) do nothing;
  update public.sales_prospects set status = 'suppressed', updated_at = now()
  where lower(email) = lower(prospect_email);
  update public.sales_messages set status = 'cancelled'
  where prospect_id in (select id from public.sales_prospects where lower(email) = lower(prospect_email))
    and status in ('draft','approved');
  return true;
end;
$$;

grant execute on function public.unsubscribe_sales_email(uuid) to anon, authenticated;
