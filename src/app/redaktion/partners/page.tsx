import Link from "next/link";
import { Building2, ExternalLink, Mail, MapPin, MousePointerClick, Phone, Plus, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createPartnerOrganization, createPartnerPlacement, updateLeadStatus, updatePlacementStatus } from "./actions";

type Lead = { id:string; company_name:string; contact_name:string; email:string; phone:string|null; message:string|null; status:string; created_at:string; municipalities:{name:string}|null; service_categories:{name:string}|null };
type Organization = { id:string; name:string; email:string|null; phone:string|null; website_url:string|null; status:string };
type Municipality = { code:string; name:string };
type Service = { id:string; name:string };
type Placement = { id:string; status:string; monthly_price:number|null; starts_at:string|null; ends_at:string|null; municipalities:{name:string;slug:string}|null; service_categories:{name:string}|null; partner_organizations:{name:string}|null };
type Props = { searchParams: Promise<{ success?:string; error?:string }> };

const leadLabels:Record<string,string>={new:"Ny",contacted:"Kontaktad",qualified:"Kvalificerad",won:"Vunnen",closed:"Avslutad"};
const placementLabels:Record<string,string>={available:"Ledig",reserved:"Reserverad",active:"Aktiv",paused:"Pausad",ended:"Avslutad"};

export default async function PartnerAdminPage({ searchParams }: Props) {
  const params=await searchParams;
  const supabase=await createClient();
  const [leadResult,organizationResult,municipalityResult,serviceResult,placementResult,eventResult]=await Promise.all([
    supabase.from("partner_leads").select("id,company_name,contact_name,email,phone,message,status,created_at,municipalities(name),service_categories(name)").order("created_at",{ascending:false}),
    supabase.from("partner_organizations").select("id,name,email,phone,website_url,status").order("name"),
    supabase.from("municipalities").select("code,name").order("name"),
    supabase.from("service_categories").select("id,name").order("name"),
    supabase.from("partner_placements").select("id,status,monthly_price,starts_at,ends_at,municipalities(name,slug),service_categories(name),partner_organizations(name)").order("created_at",{ascending:false}),
    supabase.from("partner_events").select("placement_id"),
  ]);
  const leads=(leadResult.data??[]) as unknown as Lead[];
  const organizations=(organizationResult.data??[]) as Organization[];
  const municipalities=(municipalityResult.data??[]) as Municipality[];
  const services=(serviceResult.data??[]) as Service[];
  const placements=(placementResult.data??[]) as unknown as Placement[];
  const clicks=(eventResult.data??[]).reduce<Record<string,number>>((sum,event)=>{sum[event.placement_id]=(sum[event.placement_id]??0)+1;return sum;},{});
  const activeCount=placements.filter(item=>item.status==="active").length;
  const monthlyRevenue=placements.filter(item=>item.status==="active").reduce((sum,item)=>sum+Number(item.monthly_price??0),0);

  return <main className="editor-page partner-admin">
    <div className="dashboard-heading"><div><span className="kicker">BoLiv Partner</span><h1>Partneradministration</h1><p>Hantera leads, företag och exklusiva kommunplatser.</p></div><Link className="button button-small" href="/partner" target="_blank">Visa erbjudandet <ExternalLink /></Link></div>
    {params.success&&<div className="form-message success">{params.success}</div>}
    {params.error&&<div className="form-message error">{params.error}</div>}

    <div className="dashboard-stats partner-stats">
      <div><Building2 /><span><strong>{organizations.length}</strong><small>Företag</small></span></div>
      <div><Store /><span><strong>{activeCount}</strong><small>Aktiva platser</small></span></div>
      <div><Mail /><span><strong>{leads.filter(item=>item.status==="new").length}</strong><small>Nya leads</small></span></div>
      <div><MousePointerClick /><span><strong>{monthlyRevenue.toLocaleString("sv-SE")} kr</strong><small>Månadsintäkt</small></span></div>
    </div>

    <section className="partner-admin-actions">
      <details><summary><Plus /> Lägg till företag</summary><form action={createPartnerOrganization} className="property-form">
        <div className="form-columns"><label>Företagsnamn<input name="name" required /></label><label>Organisationsnummer<input name="organizationNumber" /></label></div>
        <div className="form-columns"><label>E-post<input name="email" type="email" /></label><label>Telefon<input name="phone" /></label></div>
        <label>Webbplats<input name="websiteUrl" type="url" placeholder="https://" /></label>
        <label>Publik presentation<textarea name="description" rows={3} /></label><label>Intern anteckning<textarea name="internalNotes" rows={2} /></label>
        <button className="button button-small" type="submit">Skapa företag</button>
      </form></details>
      <details><summary><MapPin /> Sälj en kommunplats</summary><form action={createPartnerPlacement} className="property-form">
        <div className="form-columns"><label>Företag<select name="organizationId" required><option value="">Välj</option>{organizations.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Tjänst<select name="serviceCategoryId" required><option value="">Välj</option>{services.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div>
        <div className="form-columns"><label>Kommun<select name="municipalityCode" required><option value="">Välj</option>{municipalities.map(item=><option value={item.code} key={item.code}>{item.name}</option>)}</select></label><label>Status<select name="status" defaultValue="reserved">{Object.entries(placementLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label></div>
        <div className="form-columns"><label>Pris per månad, kr<input name="monthlyPrice" type="number" min="0" step="1" /></label><label>Startdatum<input name="startsAt" type="date" /></label></div>
        <label>Slutdatum<input name="endsAt" type="date" /></label><label>Intern anteckning<textarea name="internalNotes" rows={2} /></label>
        <button className="button button-small" type="submit">Skapa partnerplats</button>
      </form></details>
    </section>

    <section className="partner-admin-section"><div className="panel-heading"><h2>Kommunplatser</h2><span>{placements.length} totalt</span></div>
      {placements.length===0?<div className="panel-empty"><Store /><h3>Inga platser sålda</h3></div>:<div className="partner-placement-table">{placements.map(item=><article key={item.id}>
        <div><small>{item.service_categories?.name}</small><strong>{item.municipalities?.name}</strong>{item.municipalities&&<Link href={`/taklaggare/${item.municipalities.slug}`} target="_blank">Visa sida <ExternalLink /></Link>}</div>
        <div><small>Partner</small><strong>{item.partner_organizations?.name}</strong></div>
        <div><small>Pris</small><strong>{item.monthly_price?Number(item.monthly_price).toLocaleString("sv-SE")+" kr/mån":"Ej angivet"}</strong><span>{clicks[item.id]??0} klick</span></div>
        <form action={updatePlacementStatus}><input type="hidden" name="id" value={item.id}/><select name="status" defaultValue={item.status}>{Object.entries(placementLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button type="submit">Spara</button></form>
      </article>)}</div>}
    </section>

    <section className="partner-admin-section"><div className="panel-heading"><h2>Partnerförfrågningar</h2><span>{leads.length} totalt</span></div>
      {leads.length===0?<div className="panel-empty"><Building2 /><h3>Inga förfrågningar ännu</h3></div>:<div className="editor-list partner-lead-list">{leads.map(lead=><article key={lead.id}>
        <div><small>{lead.service_categories?.name??"Partner"}</small><strong>{lead.company_name}</strong><p>{lead.contact_name} · {new Intl.DateTimeFormat("sv-SE",{dateStyle:"medium"}).format(new Date(lead.created_at))}</p></div>
        <div><small><MapPin /> {lead.municipalities?.name??"Ingen kommun vald"}</small>{lead.message&&<p>{lead.message}</p>}</div>
        <div><a href={`mailto:${lead.email}`}><Mail /> {lead.email}</a>{lead.phone&&<a href={`tel:${lead.phone}`}><Phone /> {lead.phone}</a>}</div>
        <form action={updateLeadStatus}><input type="hidden" name="id" value={lead.id}/><select name="status" defaultValue={lead.status}>{Object.entries(leadLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button type="submit">Spara</button></form>
      </article>)}</div>}
    </section>
  </main>;
}
