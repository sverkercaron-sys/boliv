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
-- BoLiv project and private document storage policies

-- Add the project and document metadata used by Mitt BoLiv.
-- "if not exists" keeps this migration safe for projects created from the fuller schema.
alter table public.projects add column if not exists project_type text;
alter table public.projects add column if not exists planned_start date;
alter table public.projects add column if not exists planned_end date;
alter table public.projects add column if not exists actual_start date;
alter table public.projects add column if not exists actual_end date;
alter table public.projects add column if not exists notes text;
alter table public.documents add column if not exists document_date date;

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
-- BoLiv SEO cluster: Tak
-- Seeds a complete first topic cluster into the editorial content engine.

with roof_category as (
  select id from public.taxonomy_terms where term_type = 'category' and slug = 'renovera' limit 1
),
roof_guides(slug, title, excerpt, reading_time, body, seo_title, seo_description) as (
  values
  (
    'byta-tak',
    'Byta tak – kostnad, material och arbetsgång',
    'En komplett guide till takbyte: livslängd, kostnader, materialval, offerter och vad du behöver kontrollera.',
    12,
    '{"intro":"Ett takbyte är en av husets största investeringar. Med rätt förarbete blir det enklare att jämföra offerter, undvika överraskningar och välja en lösning som håller länge.","sections":[{"heading":"När behöver taket bytas?","paragraphs":["Takets ålder är bara en del av bedömningen. Spruckna pannor, rost, sliten papp, fukt på vinden och missfärgningar kring genomföringar är signaler som ska undersökas.","Gör en visuell kontroll vår och höst. Misstänker du läckage bör en fackman bedöma yttertak, underlag och ventilation."],"bullets":["Betongpannor håller ofta 30–50 år","Tegelpannor kan hålla 50 år eller mer","Takpapp håller ofta 20–30 år","Plåttak håller ofta 40–60 år"]},{"heading":"Planera hela entreprenaden","paragraphs":["Be om en specificerad offert där rivning, ställning, plåt, avfall, material och tillägg framgår. Kontrollera också garantier, betalningsplan och vem som ansvarar för väderskydd."],"bullets":["Kontrollera moms och ROT-avdrag","Begär fast pris eller tydliga enhetspriser","Avsätt reserv för skadat virke","Skriv alltid avtal"]},{"heading":"Dokumentera arbetet","paragraphs":["Fotografera underlaget och alla dolda moment. Spara garantier, produktblad, besiktningsprotokoll och fakturor i Mitt BoLiv."]}]}'::jsonb,
    'Byta tak 2026 – komplett guide till pris och material',
    'Planerar du att byta tak? Läs om kostnad, material, livslängd, offerter och arbetsgång för svenska villor.'
  ),
  (
    'kostnad-byta-tak',
    'Vad kostar det att byta tak?',
    'Så räknar du på priset för takbyte och jämför offerter på rätt grunder.',
    9,
    '{"intro":"Priset på ett takbyte styrs av betydligt mer än takets yta. Lutning, material, åtkomlighet och underlagets skick påverkar slutkostnaden.","sections":[{"heading":"Kostnader som ska ingå","paragraphs":["En komplett kalkyl omfattar rivning, ställning, väderskydd, underlag, läkt, taktäckning, plåtarbeten och bortforsling."],"bullets":["Material och leverans","Arbete och ställning","Plåt och genomföringar","Avfall och slutstädning"]},{"heading":"Undvik missvisande kvadratmeterpris","paragraphs":["Två lika stora tak kan kräva helt olika arbetsinsats. Kupor, skorstenar, brant lutning och många anslutningar ökar tiden och materialåtgången."]},{"heading":"Reserv och betalningsplan","paragraphs":["Lägg in en reserv för rötskador som upptäcks först när taket öppnas. Koppla betalningar till kontrollerbara delmoment och slutbesiktning."]}]}'::jsonb,
    'Kostnad för takbyte – pris och budget',
    'Se vad som påverkar kostnaden för ett takbyte och hur du granskar offerter, reserv och betalningsplan.'
  ),
  (
    'valja-takmaterial',
    'Välja takmaterial – tegel, betong, plåt eller papp',
    'Jämför vanliga takmaterial utifrån vikt, lutning, livslängd, underhåll och husets uttryck.',
    10,
    '{"intro":"Det bästa takmaterialet är det som passar husets konstruktion, taklutning, klimat och arkitektur. Börja med de tekniska kraven innan du väljer utseende.","sections":[{"heading":"Tegel och betong","paragraphs":["Tegel har lång livslängd och åldras naturligt. Betongpannor är ofta billigare men tyngre och kan kräva mer rengöring över tid."]},{"heading":"Plåt och papp","paragraphs":["Plåt är lätt och fungerar på många lutningar. Takpapp används ofta på låglutande tak och kräver noggrant utförda skarvar och anslutningar."]},{"heading":"Kontrollera konstruktionen","paragraphs":["Byt inte till ett tyngre material utan att kontrollera bärigheten. Säkerställ också att materialet är godkänt för takets lutning."],"bullets":["Taklutning","Bärighet","Vind- och snölast","Detaljer kring skorstenar och takfönster"]}]}'::jsonb,
    'Välja takmaterial – jämför tegel, betong, plåt och papp',
    'Jämför takmaterialens egenskaper, livslängd och krav innan du väljer nytt tak.'
  ),
  (
    'tegeltak-livslangd-underhall',
    'Tegeltak – livslängd, underhåll och vanliga skador',
    'Så tar du hand om ett tegeltak och upptäcker problem innan de orsakar följdskador.',
    8,
    '{"intro":"Ett väl lagt tegeltak kan hålla mycket länge, men pannorna är bara det yttersta skyddet. Underlag, läkt och plåtdetaljer måste också vara i gott skick.","sections":[{"heading":"Kontrollera hela taksystemet","paragraphs":["Byt spruckna pannor och kontrollera nock, ränndalar, genomföringar och plåt. På vinden letar du efter fukt, lukt och missfärgningar."]},{"heading":"Mossa och rengöring","paragraphs":["Mossa innebär inte automatiskt att taket måste bytas. Undvik aggressiva metoder som skadar pannornas yta och anlita hjälp om taket är brant."]},{"heading":"När räcker reparation?","paragraphs":["Enstaka pannor och mindre plåtdetaljer kan ofta repareras. Är underlagspappen spröd eller läkten skadad kan omläggning vara mer ekonomisk."]}]}'::jsonb,
    'Tegeltak – livslängd, skador och underhåll',
    'Lär dig kontrollera tegeltak, byta skadade pannor och avgöra när hela taket behöver läggas om.'
  ),
  (
    'betongpannor-tak',
    'Betongpannor på tak – fördelar, nackdelar och skötsel',
    'En praktisk guide till betongpannornas vikt, livslängd, ytbehandling och underhåll.',
    7,
    '{"intro":"Betongpannor är vanliga på svenska villor och finns i många profiler och färger. De är robusta men väger mer än flera alternativa material.","sections":[{"heading":"Fördelar och begränsningar","paragraphs":["Betongpannor har ofta ett konkurrenskraftigt pris och är enkla att ersätta styckvis. Ytan förändras med tiden och kan få påväxt."]},{"heading":"Kontrollera vikt och läkt","paragraphs":["Vid byte från ett lätt material måste takkonstruktionens bärighet bedömas. Kontrollera också dimensioner och avstånd på läkten."]},{"heading":"Löpande skötsel","paragraphs":["Håll rännor och ränndalar fria, byt trasiga pannor och följ upp nockband och genomföringar efter stormar."]}]}'::jsonb,
    'Betongpannor – livslängd, pris och underhåll',
    'Allt du behöver veta om betongpannor: vikt, livslängd, fördelar och rätt underhåll.'
  ),
  (
    'plattak-guide',
    'Plåttak – typer, livslängd och underhåll',
    'Jämför bandtäckt plåt och profilerad plåt och lär dig vad som avgör takets hållbarhet.',
    9,
    '{"intro":"Plåttak är lätta, täta och användbara på många taklutningar. Detaljerna och montaget har stor betydelse för resultatet.","sections":[{"heading":"Olika typer av plåttak","paragraphs":["Bandtäckning ger ett traditionellt uttryck och kräver kvalificerat hantverk. Profilerad plåt monteras i större skivor och kan vara ett mer kostnadseffektivt alternativ."]},{"heading":"Kondens och ventilation","paragraphs":["Rätt underlag och ventilation minskar risken för kondens. Konstruktionen ska utformas efter uppvärmning, isolering och takets geometri."]},{"heading":"Underhåll","paragraphs":["Kontrollera färgskikt, skruvar, falsar, plåtdetaljer och repor. Små skador bör åtgärdas innan korrosion sprider sig."]}]}'::jsonb,
    'Plåttak – pris, livslängd och olika typer',
    'Jämför plåttak och läs om montage, kondens, målning, livslängd och underhåll.'
  ),
  (
    'papptak-lagluttande-tak',
    'Papptak och låglutande tak – det här behöver du veta',
    'Material, avvattning och detaljer som avgör om ett låglutande tak håller tätt.',
    8,
    '{"intro":"På låglutande tak rinner vatten bort långsammare. Därför blir tätskikt, brunnar, skarvar och genomföringar särskilt viktiga.","sections":[{"heading":"Rätt produkt för lutningen","paragraphs":["Kontrollera materialleverantörens krav på minsta lutning och underlag. Alla produkter som kallas takpapp är inte avsedda som färdigt ytskikt."]},{"heading":"Avvattning och detaljer","paragraphs":["Brunnar, sargar, kanter och genomföringar är vanliga riskpunkter. Taket ska ha fungerande fall och inga långvariga vattensamlingar."]},{"heading":"Kontroll och underhåll","paragraphs":["Rensa brunnar och kontrollera blåsor, sprickor och öppna skarvar minst två gånger per år. Anlita fackman för reparation av tätskikt."]}]}'::jsonb,
    'Papptak och låglutande tak – material och underhåll',
    'Guide till papptak, tätskikt, taklutning, avvattning och vanliga riskpunkter.'
  ),
  (
    'taklackage-akuta-atgarder',
    'Takläckage – akuta åtgärder och nästa steg',
    'Så begränsar du skadan, dokumenterar rätt och hittar orsaken till ett läckande tak.',
    7,
    '{"intro":"Vid ett takläckage är första målet att skydda människor och begränsa följdskadan. Därefter behöver orsaken hittas och åtgärden dokumenteras.","sections":[{"heading":"Gör detta direkt","paragraphs":["Flytta känsliga föremål, samla upp vatten och bryt strömmen om vatten når elinstallationer. Gå inte upp på ett halt eller stormskadat tak."],"bullets":["Begränsa vattnet inomhus","Fotografera skadan","Kontakta försäkringsbolaget","Beställ säker skadebesiktning"]},{"heading":"Hitta orsaken","paragraphs":["Vattnet kan färdas långt i konstruktionen. Skadan kan ligga vid en genomföring, ränndal, skruv, panna eller anslutning trots att droppet syns på en annan plats."]},{"heading":"Torka och följ upp","paragraphs":["Fuktiga material måste torka och ibland bytas. Följ upp med fuktmätning och spara rapporter, foton och fakturor."]}]}'::jsonb,
    'Takläckage – vad gör man när taket läcker?',
    'Akuta råd vid takläckage: begränsa skadan, dokumentera, kontakta försäkringsbolaget och hitta orsaken.'
  ),
  (
    'underhalla-tak-checklista',
    'Underhålla taket – checklista vår och höst',
    'En återkommande kontroll som hjälper dig upptäcka små fel innan de blir dyra skador.',
    6,
    '{"intro":"En enkel takkontroll två gånger per år kan förlänga livslängden och minska risken för vatten- och stormskador.","sections":[{"heading":"Kontroll från marken","paragraphs":["Använd kikare eller fotografera från säkert avstånd. Leta efter förskjutna pannor, rost, skadad plåt och hängrännor som lutar fel."]},{"heading":"Rensa och kontrollera","paragraphs":["Ta bort löv från rännor och brunnar när det kan göras säkert. Kontrollera vindskivor, stuprör och att vattnet leds bort från huset."],"bullets":["Pannor och nock","Plåt och genomföringar","Rännor och stuprör","Vind och undertak"]},{"heading":"Efter oväder","paragraphs":["Gör en extra kontroll efter storm, kraftigt snöfall eller hagel. Dokumentera datum och observationer i underhållsplanen."]}]}'::jsonb,
    'Underhålla tak – komplett checklista',
    'Använd BoLivs checklista för takkontroll vår, höst och efter oväder.'
  ),
  (
    'jamfora-takofferter',
    'Jämföra offerter för takbyte',
    'Frågorna och avtalsdelarna som gör takofferter möjliga att jämföra.',
    8,
    '{"intro":"Den billigaste takofferten är inte alltid billigast när omfattning, material och riskfördelning jämförs. Kräv samma underlag från alla entreprenörer.","sections":[{"heading":"Samma omfattning i alla offerter","paragraphs":["Beskriv takyta, material, plåtarbeten, ställning, avfall och önskad dokumentation. Be om reservationer och undantag skriftligt."]},{"heading":"Kontrollera företaget","paragraphs":["Kontrollera F-skatt, försäkring, referenser och vem som faktiskt utför arbetet. Begär produkt- och utförandegarantier."],"bullets":["Ansvarsförsäkring","Referensprojekt","Tidsplan","Garantier","Underentreprenörer"]},{"heading":"Skriv tydligt avtal","paragraphs":["Använd konsumentanpassat avtal. Reglera betalningsplan, ändringar, förseningar, väderskydd, besiktning och hantering av rötskador."]}]}'::jsonb,
    'Jämföra takofferter – checklista före avtal',
    'Så jämför du offerter för takbyte och granskar omfattning, företag, garantier och betalningsplan.'
  ),
  (
    'bygglov-byta-tak',
    'Behövs bygglov för att byta tak?',
    'När material- eller färgbyte kan kräva lov och vad du bör kontrollera med kommunen.',
    6,
    '{"intro":"Ett takbyte med samma utseende kräver ofta inte bygglov, men reglerna beror på byggnaden, detaljplanen och hur takets utformning ändras.","sections":[{"heading":"När lov kan krävas","paragraphs":["Byte av material eller kulör kan påverka byggnadens yttre utseende. Särskilda regler kan gälla inom detaljplan, kulturmiljö eller för en särskilt värdefull byggnad."]},{"heading":"Kontakta kommunen tidigt","paragraphs":["Skicka bilder och en tydlig beskrivning till kommunens bygglovsenhet innan material beställs. Be om ett skriftligt besked när förutsättningarna är oklara."]},{"heading":"Andra krav finns kvar","paragraphs":["Även utan bygglov ska konstruktionen uppfylla tekniska krav. Taksäkerhet, brandskydd och bärighet kan behöva kontrolleras."]}]}'::jsonb,
    'Bygglov för takbyte – när behövs det?',
    'Läs när ett takbyte kan kräva bygglov och vad som gäller vid ändrat material, färg eller kulturvärde.'
  ),
  (
    'rotavdrag-takbyte',
    'ROT-avdrag vid takbyte',
    'Vilket takarbete som normalt kan ge ROT-avdrag och hur du planerar faktura och betalning.',
    6,
    '{"intro":"ROT-avdrag kan minska arbetskostnaden vid takarbete på en bostad du äger och använder. Material, resor och utrustning ger normalt inte avdrag.","sections":[{"heading":"Arbete och material ska skiljas åt","paragraphs":["Be entreprenören specificera arbetskostnaden tydligt. Avdragets storlek beror på aktuella regler, din skatt och hur mycket avdrag du redan har använt."]},{"heading":"Kontrollera villkoren","paragraphs":["Du behöver uppfylla Skatteverkets krav på ägande, bostad och betalning. Företaget ska ha F-skatt och ansöker normalt om utbetalningen."]},{"heading":"Planera före start","paragraphs":["Kontrollera alltid aktuella procentsatser och tak hos Skatteverket innan avtal. Reglera i avtalet vad som händer om hela avdraget inte medges."]}]}'::jsonb,
    'ROT-avdrag för takbyte – regler och arbetskostnad',
    'Så fungerar ROT-avdrag vid takbyte och takreparation. Kontrollera arbetskostnad, faktura och aktuella villkor.'
  )
)
insert into public.content_items (
  status, content_type, title, slug, excerpt, body, primary_category_id,
  seo_title, seo_description, reading_time_minutes, published_at, updated_at
)
select
  'published'::public.content_status, 'guide', g.title, g.slug, g.excerpt, g.body,
  c.id, g.seo_title, g.seo_description, g.reading_time, now(), now()
from roof_guides g cross join roof_category c
on conflict (slug) do update set
  status = excluded.status,
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  primary_category_id = excluded.primary_category_id,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  reading_time_minutes = excluded.reading_time_minutes,
  published_at = coalesce(public.content_items.published_at, excluded.published_at),
  updated_at = now();
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
-- Sveriges samtliga 290 kommuner enligt SCB:s indelning 2026.
-- Källa: https://www.scb.se/hitta-statistik/regional-statistik-och-kartor/regionala-indelningar/lan-och-kommuner/lan-och-kommuner-i-kodnummerordning/

insert into public.municipalities (code, name, county_name, slug)
values
  ('0114', 'Upplands Väsby', 'Stockholms län', 'upplands-vasby'),
  ('0115', 'Vallentuna', 'Stockholms län', 'vallentuna'),
  ('0117', 'Österåker', 'Stockholms län', 'osteraker'),
  ('0120', 'Värmdö', 'Stockholms län', 'varmdo'),
  ('0123', 'Järfälla', 'Stockholms län', 'jarfalla'),
  ('0125', 'Ekerö', 'Stockholms län', 'ekero'),
  ('0126', 'Huddinge', 'Stockholms län', 'huddinge'),
  ('0127', 'Botkyrka', 'Stockholms län', 'botkyrka'),
  ('0128', 'Salem', 'Stockholms län', 'salem'),
  ('0136', 'Haninge', 'Stockholms län', 'haninge'),
  ('0138', 'Tyresö', 'Stockholms län', 'tyreso'),
  ('0139', 'Upplands-Bro', 'Stockholms län', 'upplands-bro'),
  ('0140', 'Nykvarn', 'Stockholms län', 'nykvarn'),
  ('0160', 'Täby', 'Stockholms län', 'taby'),
  ('0162', 'Danderyd', 'Stockholms län', 'danderyd'),
  ('0163', 'Sollentuna', 'Stockholms län', 'sollentuna'),
  ('0180', 'Stockholm', 'Stockholms län', 'stockholm'),
  ('0181', 'Södertälje', 'Stockholms län', 'sodertalje'),
  ('0182', 'Nacka', 'Stockholms län', 'nacka'),
  ('0183', 'Sundbyberg', 'Stockholms län', 'sundbyberg'),
  ('0184', 'Solna', 'Stockholms län', 'solna'),
  ('0186', 'Lidingö', 'Stockholms län', 'lidingo'),
  ('0187', 'Vaxholm', 'Stockholms län', 'vaxholm'),
  ('0188', 'Norrtälje', 'Stockholms län', 'norrtalje'),
  ('0191', 'Sigtuna', 'Stockholms län', 'sigtuna'),
  ('0192', 'Nynäshamn', 'Stockholms län', 'nynashamn'),
  ('0305', 'Håbo', 'Uppsala län', 'habo-uppsala'),
  ('0319', 'Älvkarleby', 'Uppsala län', 'alvkarleby'),
  ('0330', 'Knivsta', 'Uppsala län', 'knivsta'),
  ('0331', 'Heby', 'Uppsala län', 'heby'),
  ('0360', 'Tierp', 'Uppsala län', 'tierp'),
  ('0380', 'Uppsala', 'Uppsala län', 'uppsala'),
  ('0381', 'Enköping', 'Uppsala län', 'enkoping'),
  ('0382', 'Östhammar', 'Uppsala län', 'osthammar'),
  ('0428', 'Vingåker', 'Södermanlands län', 'vingaker'),
  ('0461', 'Gnesta', 'Södermanlands län', 'gnesta'),
  ('0480', 'Nyköping', 'Södermanlands län', 'nykoping'),
  ('0481', 'Oxelösund', 'Södermanlands län', 'oxelosund'),
  ('0482', 'Flen', 'Södermanlands län', 'flen'),
  ('0483', 'Katrineholm', 'Södermanlands län', 'katrineholm'),
  ('0484', 'Eskilstuna', 'Södermanlands län', 'eskilstuna'),
  ('0486', 'Strängnäs', 'Södermanlands län', 'strangnas'),
  ('0488', 'Trosa', 'Södermanlands län', 'trosa'),
  ('0509', 'Ödeshög', 'Östergötlands län', 'odeshog'),
  ('0512', 'Ydre', 'Östergötlands län', 'ydre'),
  ('0513', 'Kinda', 'Östergötlands län', 'kinda'),
  ('0560', 'Boxholm', 'Östergötlands län', 'boxholm'),
  ('0561', 'Åtvidaberg', 'Östergötlands län', 'atvidaberg'),
  ('0562', 'Finspång', 'Östergötlands län', 'finspang'),
  ('0563', 'Valdemarsvik', 'Östergötlands län', 'valdemarsvik'),
  ('0580', 'Linköping', 'Östergötlands län', 'linkoping'),
  ('0581', 'Norrköping', 'Östergötlands län', 'norrkoping'),
  ('0582', 'Söderköping', 'Östergötlands län', 'soderkoping'),
  ('0583', 'Motala', 'Östergötlands län', 'motala'),
  ('0584', 'Vadstena', 'Östergötlands län', 'vadstena'),
  ('0586', 'Mjölby', 'Östergötlands län', 'mjolby'),
  ('0604', 'Aneby', 'Jönköpings län', 'aneby'),
  ('0617', 'Gnosjö', 'Jönköpings län', 'gnosjo'),
  ('0642', 'Mullsjö', 'Jönköpings län', 'mullsjo'),
  ('0643', 'Habo', 'Jönköpings län', 'habo-jonkoping'),
  ('0662', 'Gislaved', 'Jönköpings län', 'gislaved'),
  ('0665', 'Vaggeryd', 'Jönköpings län', 'vaggeryd'),
  ('0680', 'Jönköping', 'Jönköpings län', 'jonkoping'),
  ('0682', 'Nässjö', 'Jönköpings län', 'nassjo'),
  ('0683', 'Värnamo', 'Jönköpings län', 'varnamo'),
  ('0684', 'Sävsjö', 'Jönköpings län', 'savsjo'),
  ('0685', 'Vetlanda', 'Jönköpings län', 'vetlanda'),
  ('0686', 'Eksjö', 'Jönköpings län', 'eksjo'),
  ('0687', 'Tranås', 'Jönköpings län', 'tranas'),
  ('0760', 'Uppvidinge', 'Kronobergs län', 'uppvidinge'),
  ('0761', 'Lessebo', 'Kronobergs län', 'lessebo'),
  ('0763', 'Tingsryd', 'Kronobergs län', 'tingsryd'),
  ('0764', 'Alvesta', 'Kronobergs län', 'alvesta'),
  ('0765', 'Älmhult', 'Kronobergs län', 'almhult'),
  ('0767', 'Markaryd', 'Kronobergs län', 'markaryd'),
  ('0780', 'Växjö', 'Kronobergs län', 'vaxjo'),
  ('0781', 'Ljungby', 'Kronobergs län', 'ljungby'),
  ('0821', 'Högsby', 'Kalmar län', 'hogsby'),
  ('0834', 'Torsås', 'Kalmar län', 'torsas'),
  ('0840', 'Mörbylånga', 'Kalmar län', 'morbylanga'),
  ('0860', 'Hultsfred', 'Kalmar län', 'hultsfred'),
  ('0861', 'Mönsterås', 'Kalmar län', 'monsteras'),
  ('0862', 'Emmaboda', 'Kalmar län', 'emmaboda'),
  ('0880', 'Kalmar', 'Kalmar län', 'kalmar'),
  ('0881', 'Nybro', 'Kalmar län', 'nybro'),
  ('0882', 'Oskarshamn', 'Kalmar län', 'oskarshamn'),
  ('0883', 'Västervik', 'Kalmar län', 'vastervik'),
  ('0884', 'Vimmerby', 'Kalmar län', 'vimmerby'),
  ('0885', 'Borgholm', 'Kalmar län', 'borgholm'),
  ('0980', 'Gotland', 'Gotlands län', 'gotland'),
  ('1060', 'Olofström', 'Blekinge län', 'olofstrom'),
  ('1080', 'Karlskrona', 'Blekinge län', 'karlskrona'),
  ('1081', 'Ronneby', 'Blekinge län', 'ronneby'),
  ('1082', 'Karlshamn', 'Blekinge län', 'karlshamn'),
  ('1083', 'Sölvesborg', 'Blekinge län', 'solvesborg'),
  ('1214', 'Svalöv', 'Skåne län', 'svalov'),
  ('1230', 'Staffanstorp', 'Skåne län', 'staffanstorp'),
  ('1231', 'Burlöv', 'Skåne län', 'burlov'),
  ('1233', 'Vellinge', 'Skåne län', 'vellinge'),
  ('1256', 'Östra Göinge', 'Skåne län', 'ostra-goinge'),
  ('1257', 'Örkelljunga', 'Skåne län', 'orkelljunga'),
  ('1260', 'Bjuv', 'Skåne län', 'bjuv'),
  ('1261', 'Kävlinge', 'Skåne län', 'kavlinge'),
  ('1262', 'Lomma', 'Skåne län', 'lomma'),
  ('1263', 'Svedala', 'Skåne län', 'svedala'),
  ('1264', 'Skurup', 'Skåne län', 'skurup'),
  ('1265', 'Sjöbo', 'Skåne län', 'sjobo'),
  ('1266', 'Hörby', 'Skåne län', 'horby'),
  ('1267', 'Höör', 'Skåne län', 'hoor'),
  ('1270', 'Tomelilla', 'Skåne län', 'tomelilla'),
  ('1272', 'Bromölla', 'Skåne län', 'bromolla'),
  ('1273', 'Osby', 'Skåne län', 'osby'),
  ('1275', 'Perstorp', 'Skåne län', 'perstorp'),
  ('1276', 'Klippan', 'Skåne län', 'klippan'),
  ('1277', 'Åstorp', 'Skåne län', 'astorp'),
  ('1278', 'Båstad', 'Skåne län', 'bastad'),
  ('1280', 'Malmö', 'Skåne län', 'malmo'),
  ('1281', 'Lund', 'Skåne län', 'lund'),
  ('1282', 'Landskrona', 'Skåne län', 'landskrona'),
  ('1283', 'Helsingborg', 'Skåne län', 'helsingborg'),
  ('1284', 'Höganäs', 'Skåne län', 'hoganas'),
  ('1285', 'Eslöv', 'Skåne län', 'eslov'),
  ('1286', 'Ystad', 'Skåne län', 'ystad'),
  ('1287', 'Trelleborg', 'Skåne län', 'trelleborg'),
  ('1290', 'Kristianstad', 'Skåne län', 'kristianstad'),
  ('1291', 'Simrishamn', 'Skåne län', 'simrishamn'),
  ('1292', 'Ängelholm', 'Skåne län', 'angelholm'),
  ('1293', 'Hässleholm', 'Skåne län', 'hassleholm'),
  ('1315', 'Hylte', 'Hallands län', 'hylte'),
  ('1380', 'Halmstad', 'Hallands län', 'halmstad'),
  ('1381', 'Laholm', 'Hallands län', 'laholm'),
  ('1382', 'Falkenberg', 'Hallands län', 'falkenberg'),
  ('1383', 'Varberg', 'Hallands län', 'varberg'),
  ('1384', 'Kungsbacka', 'Hallands län', 'kungsbacka'),
  ('1401', 'Härryda', 'Västra Götalands län', 'harryda'),
  ('1402', 'Partille', 'Västra Götalands län', 'partille'),
  ('1407', 'Öckerö', 'Västra Götalands län', 'ockero'),
  ('1415', 'Stenungsund', 'Västra Götalands län', 'stenungsund'),
  ('1419', 'Tjörn', 'Västra Götalands län', 'tjorn'),
  ('1421', 'Orust', 'Västra Götalands län', 'orust'),
  ('1427', 'Sotenäs', 'Västra Götalands län', 'sotenas'),
  ('1430', 'Munkedal', 'Västra Götalands län', 'munkedal'),
  ('1435', 'Tanum', 'Västra Götalands län', 'tanum'),
  ('1438', 'Dals-Ed', 'Västra Götalands län', 'dals-ed'),
  ('1439', 'Färgelanda', 'Västra Götalands län', 'fargelanda'),
  ('1440', 'Ale', 'Västra Götalands län', 'ale'),
  ('1441', 'Lerum', 'Västra Götalands län', 'lerum'),
  ('1442', 'Vårgårda', 'Västra Götalands län', 'vargarda'),
  ('1443', 'Bollebygd', 'Västra Götalands län', 'bollebygd'),
  ('1444', 'Grästorp', 'Västra Götalands län', 'grastorp'),
  ('1445', 'Essunga', 'Västra Götalands län', 'essunga'),
  ('1446', 'Karlsborg', 'Västra Götalands län', 'karlsborg'),
  ('1447', 'Gullspång', 'Västra Götalands län', 'gullspang'),
  ('1452', 'Tranemo', 'Västra Götalands län', 'tranemo'),
  ('1460', 'Bengtsfors', 'Västra Götalands län', 'bengtsfors'),
  ('1461', 'Mellerud', 'Västra Götalands län', 'mellerud'),
  ('1462', 'Lilla Edet', 'Västra Götalands län', 'lilla-edet'),
  ('1463', 'Mark', 'Västra Götalands län', 'mark'),
  ('1465', 'Svenljunga', 'Västra Götalands län', 'svenljunga'),
  ('1466', 'Herrljunga', 'Västra Götalands län', 'herrljunga'),
  ('1470', 'Vara', 'Västra Götalands län', 'vara'),
  ('1471', 'Götene', 'Västra Götalands län', 'gotene'),
  ('1472', 'Tibro', 'Västra Götalands län', 'tibro'),
  ('1473', 'Töreboda', 'Västra Götalands län', 'toreboda'),
  ('1480', 'Göteborg', 'Västra Götalands län', 'goteborg'),
  ('1481', 'Mölndal', 'Västra Götalands län', 'molndal'),
  ('1482', 'Kungälv', 'Västra Götalands län', 'kungalv'),
  ('1484', 'Lysekil', 'Västra Götalands län', 'lysekil'),
  ('1485', 'Uddevalla', 'Västra Götalands län', 'uddevalla'),
  ('1486', 'Strömstad', 'Västra Götalands län', 'stromstad'),
  ('1487', 'Vänersborg', 'Västra Götalands län', 'vanersborg'),
  ('1488', 'Trollhättan', 'Västra Götalands län', 'trollhattan'),
  ('1489', 'Alingsås', 'Västra Götalands län', 'alingsas'),
  ('1490', 'Borås', 'Västra Götalands län', 'boras'),
  ('1491', 'Ulricehamn', 'Västra Götalands län', 'ulricehamn'),
  ('1492', 'Åmål', 'Västra Götalands län', 'amal'),
  ('1493', 'Mariestad', 'Västra Götalands län', 'mariestad'),
  ('1494', 'Lidköping', 'Västra Götalands län', 'lidkoping'),
  ('1495', 'Skara', 'Västra Götalands län', 'skara'),
  ('1496', 'Skövde', 'Västra Götalands län', 'skovde'),
  ('1497', 'Hjo', 'Västra Götalands län', 'hjo'),
  ('1498', 'Tidaholm', 'Västra Götalands län', 'tidaholm'),
  ('1499', 'Falköping', 'Västra Götalands län', 'falkoping'),
  ('1715', 'Kil', 'Värmlands län', 'kil'),
  ('1730', 'Eda', 'Värmlands län', 'eda'),
  ('1737', 'Torsby', 'Värmlands län', 'torsby'),
  ('1760', 'Storfors', 'Värmlands län', 'storfors'),
  ('1761', 'Hammarö', 'Värmlands län', 'hammaro'),
  ('1762', 'Munkfors', 'Värmlands län', 'munkfors'),
  ('1763', 'Forshaga', 'Värmlands län', 'forshaga'),
  ('1764', 'Grums', 'Värmlands län', 'grums'),
  ('1765', 'Årjäng', 'Värmlands län', 'arjang'),
  ('1766', 'Sunne', 'Värmlands län', 'sunne'),
  ('1780', 'Karlstad', 'Värmlands län', 'karlstad'),
  ('1781', 'Kristinehamn', 'Värmlands län', 'kristinehamn'),
  ('1782', 'Filipstad', 'Värmlands län', 'filipstad'),
  ('1783', 'Hagfors', 'Värmlands län', 'hagfors'),
  ('1784', 'Arvika', 'Värmlands län', 'arvika'),
  ('1785', 'Säffle', 'Värmlands län', 'saffle'),
  ('1814', 'Lekeberg', 'Örebro län', 'lekeberg'),
  ('1860', 'Laxå', 'Örebro län', 'laxa'),
  ('1861', 'Hallsberg', 'Örebro län', 'hallsberg'),
  ('1862', 'Degerfors', 'Örebro län', 'degerfors'),
  ('1863', 'Hällefors', 'Örebro län', 'hallefors'),
  ('1864', 'Ljusnarsberg', 'Örebro län', 'ljusnarsberg'),
  ('1880', 'Örebro', 'Örebro län', 'orebro'),
  ('1881', 'Kumla', 'Örebro län', 'kumla'),
  ('1882', 'Askersund', 'Örebro län', 'askersund'),
  ('1883', 'Karlskoga', 'Örebro län', 'karlskoga'),
  ('1884', 'Nora', 'Örebro län', 'nora'),
  ('1885', 'Lindesberg', 'Örebro län', 'lindesberg'),
  ('1904', 'Skinnskatteberg', 'Västmanlands län', 'skinnskatteberg'),
  ('1907', 'Surahammar', 'Västmanlands län', 'surahammar'),
  ('1960', 'Kungsör', 'Västmanlands län', 'kungsor'),
  ('1961', 'Hallstahammar', 'Västmanlands län', 'hallstahammar'),
  ('1962', 'Norberg', 'Västmanlands län', 'norberg'),
  ('1980', 'Västerås', 'Västmanlands län', 'vasteras'),
  ('1981', 'Sala', 'Västmanlands län', 'sala'),
  ('1982', 'Fagersta', 'Västmanlands län', 'fagersta'),
  ('1983', 'Köping', 'Västmanlands län', 'koping'),
  ('1984', 'Arboga', 'Västmanlands län', 'arboga'),
  ('2021', 'Vansbro', 'Dalarnas län', 'vansbro'),
  ('2023', 'Malung-Sälen', 'Dalarnas län', 'malung-salen'),
  ('2026', 'Gagnef', 'Dalarnas län', 'gagnef'),
  ('2029', 'Leksand', 'Dalarnas län', 'leksand'),
  ('2031', 'Rättvik', 'Dalarnas län', 'rattvik'),
  ('2034', 'Orsa', 'Dalarnas län', 'orsa'),
  ('2039', 'Älvdalen', 'Dalarnas län', 'alvdalen'),
  ('2061', 'Smedjebacken', 'Dalarnas län', 'smedjebacken'),
  ('2062', 'Mora', 'Dalarnas län', 'mora'),
  ('2080', 'Falun', 'Dalarnas län', 'falun'),
  ('2081', 'Borlänge', 'Dalarnas län', 'borlange'),
  ('2082', 'Säter', 'Dalarnas län', 'sater'),
  ('2083', 'Hedemora', 'Dalarnas län', 'hedemora'),
  ('2084', 'Avesta', 'Dalarnas län', 'avesta'),
  ('2085', 'Ludvika', 'Dalarnas län', 'ludvika'),
  ('2101', 'Ockelbo', 'Gävleborgs län', 'ockelbo'),
  ('2104', 'Hofors', 'Gävleborgs län', 'hofors'),
  ('2121', 'Ovanåker', 'Gävleborgs län', 'ovanaker'),
  ('2132', 'Nordanstig', 'Gävleborgs län', 'nordanstig'),
  ('2161', 'Ljusdal', 'Gävleborgs län', 'ljusdal'),
  ('2180', 'Gävle', 'Gävleborgs län', 'gavle'),
  ('2181', 'Sandviken', 'Gävleborgs län', 'sandviken'),
  ('2182', 'Söderhamn', 'Gävleborgs län', 'soderhamn'),
  ('2183', 'Bollnäs', 'Gävleborgs län', 'bollnas'),
  ('2184', 'Hudiksvall', 'Gävleborgs län', 'hudiksvall'),
  ('2260', 'Ånge', 'Västernorrlands län', 'ange'),
  ('2262', 'Timrå', 'Västernorrlands län', 'timra'),
  ('2280', 'Härnösand', 'Västernorrlands län', 'harnosand'),
  ('2281', 'Sundsvall', 'Västernorrlands län', 'sundsvall'),
  ('2282', 'Kramfors', 'Västernorrlands län', 'kramfors'),
  ('2283', 'Sollefteå', 'Västernorrlands län', 'solleftea'),
  ('2284', 'Örnsköldsvik', 'Västernorrlands län', 'ornskoldsvik'),
  ('2303', 'Ragunda', 'Jämtlands län', 'ragunda'),
  ('2305', 'Bräcke', 'Jämtlands län', 'bracke'),
  ('2309', 'Krokom', 'Jämtlands län', 'krokom'),
  ('2313', 'Strömsund', 'Jämtlands län', 'stromsund'),
  ('2321', 'Åre', 'Jämtlands län', 'are'),
  ('2326', 'Berg', 'Jämtlands län', 'berg'),
  ('2361', 'Härjedalen', 'Jämtlands län', 'harjedalen'),
  ('2380', 'Östersund', 'Jämtlands län', 'ostersund'),
  ('2401', 'Nordmaling', 'Västerbottens län', 'nordmaling'),
  ('2403', 'Bjurholm', 'Västerbottens län', 'bjurholm'),
  ('2404', 'Vindeln', 'Västerbottens län', 'vindeln'),
  ('2409', 'Robertsfors', 'Västerbottens län', 'robertsfors'),
  ('2417', 'Norsjö', 'Västerbottens län', 'norsjo'),
  ('2418', 'Malå', 'Västerbottens län', 'mala'),
  ('2421', 'Storuman', 'Västerbottens län', 'storuman'),
  ('2422', 'Sorsele', 'Västerbottens län', 'sorsele'),
  ('2425', 'Dorotea', 'Västerbottens län', 'dorotea'),
  ('2460', 'Vännäs', 'Västerbottens län', 'vannas'),
  ('2462', 'Vilhelmina', 'Västerbottens län', 'vilhelmina'),
  ('2463', 'Åsele', 'Västerbottens län', 'asele'),
  ('2480', 'Umeå', 'Västerbottens län', 'umea'),
  ('2481', 'Lycksele', 'Västerbottens län', 'lycksele'),
  ('2482', 'Skellefteå', 'Västerbottens län', 'skelleftea'),
  ('2505', 'Arvidsjaur', 'Norrbottens län', 'arvidsjaur'),
  ('2506', 'Arjeplog', 'Norrbottens län', 'arjeplog'),
  ('2510', 'Jokkmokk', 'Norrbottens län', 'jokkmokk'),
  ('2513', 'Överkalix', 'Norrbottens län', 'overkalix'),
  ('2514', 'Kalix', 'Norrbottens län', 'kalix'),
  ('2518', 'Övertorneå', 'Norrbottens län', 'overtornea'),
  ('2521', 'Pajala', 'Norrbottens län', 'pajala'),
  ('2523', 'Gällivare', 'Norrbottens län', 'gallivare'),
  ('2560', 'Älvsbyn', 'Norrbottens län', 'alvsbyn'),
  ('2580', 'Luleå', 'Norrbottens län', 'lulea'),
  ('2581', 'Piteå', 'Norrbottens län', 'pitea'),
  ('2582', 'Boden', 'Norrbottens län', 'boden'),
  ('2583', 'Haparanda', 'Norrbottens län', 'haparanda'),
  ('2584', 'Kiruna', 'Norrbottens län', 'kiruna')
on conflict (code) do update set
  name = excluded.name,
  county_name = excluded.county_name,
  slug = excluded.slug;

do $$
begin
  if (select count(*) from public.municipalities) <> 290 then
    raise exception 'Förväntade 290 kommuner men hittade %', (select count(*) from public.municipalities);
  end if;
end $$;
-- BoLiv Partner: complete initial catalogue of sellable service categories.

insert into public.service_categories (name, slug, description)
values
  ('Arkitekt', 'arkitekt', 'Arkitektur, ombyggnad, tillbyggnad och bygglovsunderlag.'),
  ('Besiktningsföretag', 'besiktningsforetag', 'Överlåtelsebesiktning, statusbesiktning och teknisk rådgivning.'),
  ('Bredband och fiber', 'bredband-fiber', 'Fiberanslutning, nätverk, wifi och bredbandslösningar.'),
  ('Byggföretag', 'byggforetag', 'Nybyggnad, tillbyggnad, ombyggnad och totalentreprenad.'),
  ('Bygglovskonsult', 'bygglovskonsult', 'Bygglov, anmälan, ritningar och kontakt med kommunen.'),
  ('Elektriker', 'elektriker', 'Elinstallation, felsökning, laddbox och elsäkerhet.'),
  ('Energikonsult', 'energikonsult', 'Energideklaration, energikartläggning och effektivisering.'),
  ('Fastighetsmäklare', 'fastighetsmaklare', 'Värdering, försäljning och köp av bostad.'),
  ('Flyttfirma', 'flyttfirma', 'Bohagsflytt, packning, magasinering och flyttservice.'),
  ('Fukttekniker', 'fukttekniker', 'Fuktmätning, skadeutredning och åtgärdsförslag.'),
  ('Fönster och dörrar', 'fonster-dorrar', 'Fönsterbyte, dörrbyte, renovering och energieffektivisering.'),
  ('Försäkring', 'forsakring', 'Villa-, hem-, bostadsrätts- och fritidshusförsäkring.'),
  ('Golvläggare', 'golvlaggare', 'Trägolv, parkett, laminat, plastmatta och golvrenovering.'),
  ('Grund och dränering', 'grund-dranering', 'Dränering, grundisolering, fuktskydd och grundarbeten.'),
  ('Hemstädning', 'hemstadning', 'Hemstädning, storstädning och återkommande städtjänster.'),
  ('Homestyling', 'homestyling', 'Styling, inredning och förberedelse inför bostadsförsäljning.'),
  ('Inredningsarkitekt', 'inredningsarkitekt', 'Inredningskoncept, planlösning, färg och materialval.'),
  ('Isoleringsföretag', 'isolering', 'Tilläggsisolering av vind, vägg, grund och klimatskal.'),
  ('Jurist - fastighet', 'fastighetsjurist', 'Avtal, fel i fastighet, servitut och bostadsjuridik.'),
  ('Kakel och klinker', 'kakel-klinker', 'Plattsättning i badrum, kök och andra våtutrymmen.'),
  ('Kamin och eldstad', 'kamin-eldstad', 'Installation, renovering och service av kamin och eldstad.'),
  ('Köksföretag', 'koksforetag', 'Köksplanering, köksrenovering och montering.'),
  ('Larm och säkerhet', 'larm-sakerhet', 'Inbrottslarm, kameror, passersystem och smart säkerhet.'),
  ('Låssmed', 'lassmed', 'Låsbyte, låssystem, dörrsäkerhet och akut låsservice.'),
  ('Mark och schakt', 'mark-schakt', 'Schaktning, planering, grundarbete och markentreprenad.'),
  ('Murare', 'murare', 'Murning, puts, skorsten, fasad och eldstadsarbeten.'),
  ('Målare', 'malare', 'Invändig och utvändig målning, tapetsering och fasadbehandling.'),
  ('Pool och spa', 'pool-spa', 'Poolbygge, spabad, rening, service och vinterstängning.'),
  ('Sanering och skadeservice', 'sanering-skadeservice', 'Vatten-, brand-, lukt-, mögel- och miljösanering.'),
  ('Skadedjursbekämpning', 'skadedjursbekampning', 'Förebyggande skydd och bekämpning av skadedjur.'),
  ('Skorsten och sotning', 'skorsten-sotning', 'Sotning, brandskyddskontroll och skorstensrenovering.'),
  ('Solceller', 'solceller', 'Solcellsanläggning, batterilagring och energioptimering.'),
  ('Takläggare', 'taklaggare', 'Takbyte, takrenovering, reparation och taksäkerhet.'),
  ('Trädgård och anläggning', 'tradgard-anlaggning', 'Trädgårdsdesign, stenläggning, murar och utemiljö.'),
  ('Trädfällning och arborist', 'tradfallning-arborist', 'Trädfällning, beskärning, riskbedömning och stubbfräsning.'),
  ('TV och hemelektronik', 'tv-hemelektronik', 'TV, ljud, antenn, parabol och installation i hemmet.'),
  ('Ventilation', 'ventilation', 'Ventilationsservice, OVK, kanalrengöring och inneklimat.'),
  ('Vatten och brunn', 'vatten-brunn', 'Vattenprov, vattenrening, brunnsborrning och pumpar.'),
  ('Värmepumpar', 'varmepumpar', 'Installation och service av berg-, luft- och frånluftsvärmepumpar.'),
  ('VVS och rörmokare', 'vvs-rormokare', 'Rörarbete, värme, vatten, avlopp och VVS-service.'),
  ('Våtrum och badrum', 'vatrum-badrum', 'Badrumsrenovering, tätskikt och våtrumsentreprenad.'),
  ('Återvinning och bortforsling', 'atervinning-bortforsling', 'Bortforsling, röjning, avfall och återvinning.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

