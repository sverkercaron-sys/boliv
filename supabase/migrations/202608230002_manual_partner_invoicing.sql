-- Manual invoice fallback keeps checkout open before Fortnox is connected.

alter table public.partner_contracts
  add column if not exists invoice_provider text not null default 'manual'
    check (invoice_provider in ('manual', 'fortnox')),
  add column if not exists invoice_number text,
  add column if not exists invoice_status text not null default 'pending_creation'
    check (invoice_status in ('pending_creation', 'sent', 'paid', 'overdue', 'cancelled'));

create index if not exists partner_contracts_invoice_status_idx
  on public.partner_contracts (invoice_status, created_at desc);

drop policy if exists partner_contracts_editor_update on public.partner_contracts;
create policy partner_contracts_editor_update on public.partner_contracts
  for update to authenticated
  using (public.has_editor_role())
  with check (public.has_editor_role());

drop policy if exists partner_contract_items_editor_update on public.partner_contract_items;
create policy partner_contract_items_editor_update on public.partner_contract_items
  for update to authenticated
  using (public.has_editor_role())
  with check (public.has_editor_role());

create or replace function public.claim_partner_invitation()
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
begin
  if auth.uid() is null then return null; end if;
  select organization_id into v_org
  from public.partner_invitations
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  order by created_at desc limit 1;
  if v_org is null then return null; end if;
  insert into public.partner_members(organization_id, user_id, role)
  values(v_org, auth.uid(), 'owner') on conflict do nothing;
  update public.partner_invitations set accepted_at = coalesce(accepted_at, now())
  where organization_id = v_org and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));
  return v_org;
end; $$;

grant execute on function public.claim_partner_invitation() to authenticated;
