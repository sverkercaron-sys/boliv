-- BoLiv automated partner sales, multi-market contracts and partner back office

create type public.partner_contract_status as enum ('pending_payment', 'active', 'overdue', 'invoice_failed', 'cancelled');
create type public.partner_member_role as enum ('owner', 'manager');

create table public.partner_contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete restrict,
  company_name text not null,
  organization_number text not null,
  contact_name text not null,
  email text not null,
  phone text,
  billing_address text not null,
  billing_postal_code text not null,
  billing_city text not null,
  total_price_ex_vat numeric(12,2) not null,
  total_renewal_price_ex_vat numeric(12,2) not null,
  vat_rate numeric(5,2) not null default 25,
  billing_interval text not null default 'annual' check (billing_interval = 'annual'),
  payment_terms_days integer not null default 30,
  grace_period_days integer not null default 14,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  accepted_ip inet,
  status public.partner_contract_status not null default 'pending_payment',
  starts_at date not null default current_date,
  renews_at date not null default (current_date + interval '1 year')::date,
  due_at date not null default (current_date + 30),
  fortnox_customer_number text,
  fortnox_invoice_number text,
  invoice_created_at timestamptz,
  paid_at timestamptz,
  invoice_error text,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partner_contract_items (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.partner_contracts(id) on delete cascade,
  placement_id uuid not null unique references public.partner_placements(id) on delete restrict,
  price_ex_vat numeric(12,2) not null default 2990,
  renewal_price_ex_vat numeric(12,2) not null default 4990,
  status text not null default 'sold' check (status in ('sold','active','released','ended')),
  released_at timestamptz,
  release_reason text,
  created_at timestamptz not null default now()
);

create table public.partner_members (
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.partner_member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.partner_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  email text not null,
  role public.partner_member_role not null default 'owner',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

alter table public.partner_organizations
  add column if not exists logo_path text,
  add column if not exists hero_image_path text,
  add column if not exists address text,
  add column if not exists postal_code text,
  add column if not exists city text,
  add column if not exists opening_hours text,
  add column if not exists public_email text,
  add column if not exists profile_published boolean not null default false;

alter table public.partner_contracts enable row level security;
alter table public.partner_contract_items enable row level security;
alter table public.partner_members enable row level security;
alter table public.partner_invitations enable row level security;

create or replace function public.is_partner_member(org_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.partner_members where organization_id=org_id and user_id=auth.uid());
$$;

create policy partner_contracts_editor_read on public.partner_contracts for select to authenticated
  using (public.has_editor_role() or public.is_partner_member(organization_id));
create policy partner_contract_items_editor_read on public.partner_contract_items for select to authenticated
  using (exists(select 1 from public.partner_contracts c where c.id=contract_id and (public.has_editor_role() or public.is_partner_member(c.organization_id))));
create policy partner_members_own_read on public.partner_members for select to authenticated
  using (user_id=auth.uid() or public.has_editor_role());
create policy partner_invitations_editor_read on public.partner_invitations for select to authenticated
  using (public.has_editor_role());

drop policy if exists partner_organizations_public_read on public.partner_organizations;
create policy partner_organizations_public_read on public.partner_organizations for select
  using (status='active' or public.has_editor_role() or public.is_partner_member(id));
drop policy if exists partner_organizations_partner_update on public.partner_organizations;
create policy partner_organizations_partner_update on public.partner_organizations for update to authenticated
  using (public.is_partner_member(id)) with check (public.is_partner_member(id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('partner-assets','partner-assets',true,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy partner_assets_public_read on storage.objects for select using(bucket_id='partner-assets');
create policy partner_assets_member_insert on storage.objects for insert to authenticated with check(
  bucket_id='partner-assets' and exists(select 1 from public.partner_members pm where pm.user_id=auth.uid() and pm.organization_id::text=(storage.foldername(name))[1])
);
create policy partner_assets_member_update on storage.objects for update to authenticated using(
  bucket_id='partner-assets' and exists(select 1 from public.partner_members pm where pm.user_id=auth.uid() and pm.organization_id::text=(storage.foldername(name))[1])
);
create policy partner_assets_member_delete on storage.objects for delete to authenticated using(
  bucket_id='partner-assets' and exists(select 1 from public.partner_members pm where pm.user_id=auth.uid() and pm.organization_id::text=(storage.foldername(name))[1])
);

create or replace function public.attach_invited_partner_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.partner_members(organization_id,user_id,role)
  select organization_id,new.id,role from public.partner_invitations
  where lower(email)=lower(new.email) and accepted_at is null
  on conflict do nothing;
  update public.partner_invitations set accepted_at=now()
  where lower(email)=lower(new.email) and accepted_at is null;
  return new;
end; $$;
create trigger on_auth_partner_user_created after insert on auth.users
for each row execute procedure public.attach_invited_partner_user();

create or replace function public.purchase_partner_markets(
  p_market_keys text[], p_company_name text, p_organization_number text,
  p_contact_name text, p_email text, p_phone text, p_billing_address text,
  p_billing_postal_code text, p_billing_city text, p_terms_version text,
  p_idempotency_key uuid, p_accepted_ip inet default null
)
returns table(contract_id uuid,total_price_ex_vat numeric)
language plpgsql security definer set search_path=public as $$
declare
  v_org uuid; v_contract uuid; v_key text; v_service uuid; v_municipality text;
  v_placement uuid; v_count integer;
begin
  v_count:=coalesce(array_length(p_market_keys,1),0);
  if v_count<1 or v_count>50 or v_count<>(select count(distinct x) from unnest(p_market_keys)x)
    or char_length(trim(p_company_name))<2 or char_length(trim(p_organization_number))<6
    or char_length(trim(p_contact_name))<2 or position('@' in p_email)<2
    or char_length(trim(p_billing_address))<3 or char_length(trim(p_billing_postal_code))<3
    or char_length(trim(p_billing_city))<2 or p_terms_version<>'partner-2026-01'
  then raise exception 'INVALID_CHECKOUT'; end if;

  select id into v_contract from public.partner_contracts where idempotency_key=p_idempotency_key;
  if v_contract is not null then return query select c.id,c.total_price_ex_vat from public.partner_contracts c where c.id=v_contract; return; end if;

  foreach v_key in array (select array_agg(x order by x) from unnest(p_market_keys)x) loop
    perform pg_advisory_xact_lock(hashtext(v_key));
    select s.id,m.code into v_service,v_municipality
      from public.service_categories s cross join public.municipalities m
      where s.slug=split_part(v_key,':',1) and m.slug=split_part(v_key,':',2);
    if v_service is null or exists(select 1 from public.partner_placements p where p.service_category_id=v_service and p.municipality_code=v_municipality and p.status in('reserved','active'))
    then raise exception 'MARKET_UNAVAILABLE:%',v_key; end if;
  end loop;

  insert into public.partner_organizations(organization_number,name,slug,email,phone,status,profile_published)
  values(trim(p_organization_number),trim(p_company_name),regexp_replace(lower(trim(p_company_name)),'[^a-z0-9]+','-','g')||'-'||substr(gen_random_uuid()::text,1,8),lower(trim(p_email)),nullif(trim(p_phone),''),'prospect',false)
  on conflict(organization_number) do update set name=excluded.name,email=excluded.email,phone=excluded.phone,updated_at=now()
  returning id into v_org;

  insert into public.partner_contracts(organization_id,company_name,organization_number,contact_name,email,phone,billing_address,billing_postal_code,billing_city,total_price_ex_vat,total_renewal_price_ex_vat,terms_version,accepted_ip,idempotency_key)
  values(v_org,trim(p_company_name),trim(p_organization_number),trim(p_contact_name),lower(trim(p_email)),nullif(trim(p_phone),''),trim(p_billing_address),trim(p_billing_postal_code),trim(p_billing_city),2990*v_count,4990*v_count,p_terms_version,p_accepted_ip,p_idempotency_key)
  returning id into v_contract;

  foreach v_key in array p_market_keys loop
    select s.id,m.code into v_service,v_municipality from public.service_categories s cross join public.municipalities m where s.slug=split_part(v_key,':',1) and m.slug=split_part(v_key,':',2);
    insert into public.partner_placements(organization_id,service_category_id,municipality_code,status,reserved_until,starts_at,ends_at,monthly_price,internal_notes)
    values(v_org,v_service,v_municipality,'reserved',now()+interval '44 days',now(),now()+interval '1 year',2990.0/12,'Såld – inväntar betalning') returning id into v_placement;
    insert into public.partner_contract_items(contract_id,placement_id) values(v_contract,v_placement);
  end loop;

  insert into public.partner_invitations(organization_id,email) values(v_org,lower(trim(p_email))) on conflict do nothing;
  return query select v_contract,(2990*v_count)::numeric;
end; $$;

grant execute on function public.purchase_partner_markets(text[],text,text,text,text,text,text,text,text,text,uuid,inet) to anon,authenticated;

create or replace function public.available_partner_markets()
returns table(service_slug text,service_name text,municipality_slug text,municipality_name text,county_name text)
language sql stable security definer set search_path=public as $$
 select s.slug,s.name,m.slug,m.name,m.county_name from public.service_categories s cross join public.municipalities m
 where not exists(select 1 from public.partner_placements p where p.service_category_id=s.id and p.municipality_code=m.code and p.status in('reserved','active'))
 order by s.name,m.name; $$;
grant execute on function public.available_partner_markets() to anon,authenticated;

create or replace function public.market_partner(p_service_slug text,p_municipality_slug text)
returns table(placement_id uuid,placement_status text,company_name text,profile_slug text,profile_published boolean,description text,website_url text,phone text,logo_path text)
language sql stable security definer set search_path=public as $$
 select p.id,p.status::text,o.name,o.slug,o.profile_published,
   case when p.status='active' then o.description else null end,
   case when p.status='active' then o.website_url else null end,
   case when p.status='active' then o.phone else null end,
   case when p.status='active' then o.logo_path else null end
 from public.partner_placements p join public.partner_organizations o on o.id=p.organization_id
 join public.service_categories s on s.id=p.service_category_id join public.municipalities m on m.code=p.municipality_code
 where s.slug=p_service_slug and m.slug=p_municipality_slug and p.status in('reserved','active') limit 1; $$;
grant execute on function public.market_partner(text,text) to anon,authenticated;

create index partner_contracts_status_due_idx on public.partner_contracts(status,due_at);
create index partner_contract_items_contract_idx on public.partner_contract_items(contract_id);
