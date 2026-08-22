import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus } from "./actions";

type Lead = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  municipalities: { name: string } | null;
  service_categories: { name: string } | null;
};

const statusLabels: Record<string, string> = {
  new: "Ny",
  contacted: "Kontaktad",
  qualified: "Kvalificerad",
  won: "Vunnen",
  closed: "Avslutad",
};

export default async function PartnerLeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_leads")
    .select("id,company_name,contact_name,email,phone,message,status,created_at,municipalities(name),service_categories(name)")
    .order("created_at", { ascending: false });
  const leads = (data ?? []) as unknown as Lead[];

  return <main className="editor-page">
    <div className="dashboard-heading"><div><span className="kicker">BoLiv Partner</span><h1>Partnerförfrågningar</h1><p>{leads.length} inkomna intresseanmälningar.</p></div></div>
    {leads.length === 0 ? <div className="panel-empty large"><Building2 /><h2>Inga förfrågningar ännu</h2><p>Nya intresseanmälningar visas här automatiskt.</p></div>
    : <div className="editor-list partner-lead-list">{leads.map((lead) => <article key={lead.id}>
      <div><small>{lead.service_categories?.name ?? "Partner"}</small><strong>{lead.company_name}</strong><p>{lead.contact_name} · {new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(new Date(lead.created_at))}</p></div>
      <div><small><MapPin /> {lead.municipalities?.name ?? "Ingen kommun vald"}</small>{lead.message && <p>{lead.message}</p>}</div>
      <div><a href={`mailto:${lead.email}`}><Mail /> {lead.email}</a>{lead.phone && <a href={`tel:${lead.phone}`}><Phone /> {lead.phone}</a>}</div>
      <form action={updateLeadStatus}><input type="hidden" name="id" value={lead.id} /><select name="status" defaultValue={lead.status} aria-label="Status">{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button type="submit">Spara</button></form>
    </article>)}</div>}
  </main>;
}
