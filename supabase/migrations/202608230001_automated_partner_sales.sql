-- BoLiv automated partner sales: contracts, atomic market checkout and Fortnox status

create type public.partner_contract_status as enum ('pending_invoice', 'active', 'invoice_failed', 'cancelled', 'expired');

create table public.partner_contracts (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null unique references public.partner_placements(id) on delete restrict,
  organization_id uuid not null references public.partner_organizations(id) on delete restrict,
  company_name text not null,
  organization_number text not null,
  contact_name text not null,
  email text not null,
  phone text,
  billing_address text not null,
  billing_postal_code text not null,
  billing_city text not null,
  price_ex_vat numeric(12,2) not null,
  vat_rate numeric(5,2) not null default 25,
  renewal_price_ex_vat numeric(12,2) not null,
  billing_interval text not null default 'annual' check (billing_interval = 'annual'),
  payment_terms_days integer not null default 30,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  accepted_ip inet,
  status public.partner_contract_status not null default 'pending_invoice',
  starts_at date not null default current_date,
  renews_at date not null default (current_date + interval '1 year')::date,
  fortnox_customer_number text,
  fortnox_invoice_number text,
  invoice_created_at timestamptz,
  invoice_error text,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partner_contracts enable row level security;

drop policy if exists partner_contracts_editor_read on public.partner_contracts;
create policy partner_contracts_editor_read on public.partner_contracts
  for select to authenticated using (public.has_editor_role());

create index partner_contracts_status_idx on public.partner_contracts(status, created_at desc);
create index partner_contracts_renewal_idx on public.partner_contracts(renews_at) where status = 'active';

create or replace function public.purchase_partner_market(
  p_service_slug text,
  p_municipality_slug text,
  p_company_name text,
  p_organization_number text,
  p_contact_name text,
  p_email text,
  p_phone text,
  p_billing_address text,
  p_billing_postal_code text,
  p_billing_city text,
  p_terms_version text,
  p_idempotency_key uuid,
  p_accepted_ip inet default null
)
returns table(contract_id uuid, placement_id uuid, price_ex_vat numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service_id uuid;
  v_municipality_code text;
  v_organization_id uuid;
  v_placement_id uuid;
  v_contract_id uuid;
begin
  if char_length(trim(p_company_name)) < 2
    or char_length(trim(p_organization_number)) < 6
    or char_length(trim(p_contact_name)) < 2
    or position('@' in p_email) < 2
    or char_length(trim(p_billing_address)) < 3
    or char_length(trim(p_billing_postal_code)) < 3
    or char_length(trim(p_billing_city)) < 2
    or p_terms_version <> 'partner-2026-01' then
    raise exception 'INVALID_CHECKOUT';
  end if;

  select id into v_contract_id from public.partner_contracts where idempotency_key = p_idempotency_key;
  if v_contract_id is not null then
    return query select c.id, c.placement_id, c.price_ex_vat from public.partner_contracts c where c.id = v_contract_id;
    return;
  end if;

  select id into v_service_id from public.service_categories where slug = p_service_slug;
  select code into v_municipality_code from public.municipalities where slug = p_municipality_slug;
  if v_service_id is null or v_municipality_code is null then raise exception 'MARKET_NOT_FOUND'; end if;

  perform pg_advisory_xact_lock(hashtext(v_service_id::text || ':' || v_municipality_code));

  if exists (
    select 1 from public.partner_placements
    where service_category_id = v_service_id
      and municipality_code = v_municipality_code
      and status in ('reserved','active')
  ) then raise exception 'MARKET_UNAVAILABLE'; end if;

  insert into public.partner_organizations (
    organization_number, name, slug, email, phone, status
  ) values (
    trim(p_organization_number), trim(p_company_name),
    regexp_replace(lower(trim(p_company_name)), '[^a-z0-9]+', '-', 'g') || '-' || substr(gen_random_uuid()::text,1,8),
    lower(trim(p_email)), nullif(trim(p_phone),''), 'prospect'
  )
  on conflict (organization_number) do update set
    name = excluded.name, email = excluded.email, phone = excluded.phone, updated_at = now()
  returning id into v_organization_id;

  insert into public.partner_placements (
    organization_id, service_category_id, municipality_code, status,
    reserved_until, starts_at, ends_at, monthly_price, internal_notes
  ) values (
    v_organization_id, v_service_id, v_municipality_code, 'reserved',
    now() + interval '30 minutes', now(), now() + interval '1 year',
    2990.00 / 12, 'Automatiskt köp – inväntar Fortnox-faktura'
  ) returning id into v_placement_id;

  insert into public.partner_contracts (
    placement_id, organization_id, company_name, organization_number,
    contact_name, email, phone, billing_address, billing_postal_code, billing_city,
    price_ex_vat, renewal_price_ex_vat, terms_version, accepted_ip, idempotency_key
  ) values (
    v_placement_id, v_organization_id, trim(p_company_name), trim(p_organization_number),
    trim(p_contact_name), lower(trim(p_email)), nullif(trim(p_phone),''),
    trim(p_billing_address), trim(p_billing_postal_code), trim(p_billing_city),
    2990.00, 4990.00, p_terms_version, p_accepted_ip, p_idempotency_key
  ) returning id into v_contract_id;

  return query select v_contract_id, v_placement_id, 2990.00::numeric;
end;
$$;

revoke all on function public.purchase_partner_market(text,text,text,text,text,text,text,text,text,text,text,uuid,inet) from public;
grant execute on function public.purchase_partner_market(text,text,text,text,text,text,text,text,text,text,text,uuid,inet) to anon, authenticated;


create or replace function public.available_partner_markets()
returns table(
  service_slug text,
  service_name text,
  municipality_slug text,
  municipality_name text,
  county_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.slug, s.name, m.slug, m.name, m.county_name
  from public.service_categories s
  cross join public.municipalities m
  where not exists (
    select 1 from public.partner_placements p
    where p.service_category_id = s.id
      and p.municipality_code = m.code
      and (
        p.status = 'active'
        or (p.status = 'reserved' and coalesce(p.reserved_until, now() + interval '1 minute') > now())
      )
  )
  order by s.name, m.name;
$$;

grant execute on function public.available_partner_markets() to anon, authenticated;
