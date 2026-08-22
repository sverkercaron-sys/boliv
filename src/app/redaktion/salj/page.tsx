import { Ban, Building2, CheckCircle2, Clock3, Mail, Plus, Send, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { approveMessage, createProspect, markMessageSent, suppressProspect } from "./actions";

type Props={searchParams:Promise<{success?:string;error?:string}>};
type Municipality={code:string;name:string};
type Service={id:string;name:string};
type Prospect={id:string;company_name:string;email:string;score:number;status:string;next_follow_up_at:string|null;municipalities:{name:string}|null;service_categories:{name:string}|null};
type Message={id:string;prospect_id:string;sequence_step:number;subject:string;body_text:string;status:string;scheduled_at:string|null;sales_prospects:{company_name:string;email:string;score:number;municipalities:{name:string}|null;service_categories:{name:string}|null}|null};

export default async function SalesEnginePage({searchParams}:Props){
  const params=await searchParams;
  const supabase=await createClient();
  const [municipalityResult,serviceResult,prospectResult,messageResult,suppressionResult]=await Promise.all([
    supabase.from("municipalities").select("code,name").order("name"),
    supabase.from("service_categories").select("id,name").order("name"),
    supabase.from("sales_prospects").select("id,company_name,email,score,status,next_follow_up_at,municipalities(name),service_categories(name)").order("score",{ascending:false}),
    supabase.from("sales_messages").select("id,prospect_id,sequence_step,subject,body_text,status,scheduled_at,sales_prospects(company_name,email,score,municipalities(name),service_categories(name))").in("status",["draft","approved"]).order("created_at"),
    supabase.from("sales_suppressions").select("id",{count:"exact",head:true}),
  ]);
  const municipalities=(municipalityResult.data??[]) as Municipality[];
  const services=(serviceResult.data??[]) as Service[];
  const prospects=(prospectResult.data??[]) as unknown as Prospect[];
  const messages=(messageResult.data??[]) as unknown as Message[];
  const due=messages.filter(item=>!item.scheduled_at||new Date(item.scheduled_at)<=new Date());
  const approved=messages.filter(item=>item.status==="approved");

  return <main className="editor-page sales-engine">
    <div className="dashboard-heading"><div><span className="kicker">BoLiv Sälj</span><h1>Säljmotorn</h1><p>Från lokalt prospekt till exklusiv partnerplats.</p></div></div>
    {params.success&&<div className="form-message success">{params.success}</div>}
    {params.error&&<div className="form-message error">{params.error}</div>}
    <div className="dashboard-stats">
      <div><Building2/><span><strong>{prospects.length}</strong><small>Prospekt</small></span></div>
      <div><Target/><span><strong>{prospects.filter(item=>item.status==="qualified").length}</strong><small>Kvalificerade</small></span></div>
      <div><Mail/><span><strong>{due.length}</strong><small>I arbetskön</small></span></div>
      <div><Ban/><span><strong>{suppressionResult.count??0}</strong><small>Spärrade</small></span></div>
    </div>

    <details className="sales-add-prospect"><summary><Plus/> Lägg till prospekt</summary><form action={createProspect} className="property-form">
      <div className="form-columns"><label>Företagsnamn<input name="companyName" required/></label><label>Organisationsnummer<input name="organizationNumber"/></label></div>
      <div className="form-columns"><label>E-post<input name="email" type="email" required/></label><label>Kontaktperson<input name="contactName"/></label></div>
      <div className="form-columns"><label>Telefon<input name="phone"/></label><label>Webbplats<input name="websiteUrl" type="url" placeholder="https://"/></label></div>
      <div className="form-columns"><label>Kommun<select name="municipalityCode" required><option value="">Välj</option>{municipalities.map(item=><option value={item.code} key={item.code}>{item.name}</option>)}</select></label><label>Bransch<select name="serviceCategoryId" required><option value="">Välj</option>{services.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div>
      <div className="form-columns"><label>Prospektpoäng<input name="score" type="number" min="0" max="100" defaultValue="50"/></label><label>Källa<input name="sourceName" placeholder="Företagets webbplats, register..."/></label></div>
      <label>Källänk<input name="sourceUrl" type="url" placeholder="https://"/></label><label>Intern anteckning<textarea name="notes" rows={2}/></label>
      <button className="button button-small" type="submit">Skapa prospekt och mejlutkast</button>
    </form></details>

    <section className="sales-section"><div className="panel-heading"><h2>Mejl för granskning</h2><span>{messages.length} väntar</span></div>
      {messages.length===0?<div className="panel-empty"><CheckCircle2/><h3>Arbetskön är tom</h3><p>Nya prospekt får automatiskt ett personligt mejlutkast.</p></div>:<div className="sales-message-list">{messages.map(message=><article key={message.id} className={message.status}>
        <header><div><small>Steg {message.sequence_step} · {message.sales_prospects?.service_categories?.name} i {message.sales_prospects?.municipalities?.name}</small><h3>{message.sales_prospects?.company_name}</h3><span>{message.sales_prospects?.email} · poäng {message.sales_prospects?.score}</span></div><b>{message.status==="approved"?"Godkänt":"Utkast"}</b></header>
        {message.status==="draft"?<form action={approveMessage} className="sales-message-form"><input type="hidden" name="id" value={message.id}/><label>Ämnesrad<input name="subject" defaultValue={message.subject}/></label><label>Mejltext<textarea name="bodyText" rows={12} defaultValue={message.body_text}/></label><button className="button button-small" type="submit"><CheckCircle2/> Godkänn utskick</button></form>
        :<div className="sales-approved"><pre>{message.body_text}</pre><form action={markMessageSent}><input type="hidden" name="id" value={message.id}/><button className="button button-small" type="submit"><Send/> Markera som skickat</button></form></div>}
        {message.scheduled_at&&<footer><Clock3/> Planerad {new Intl.DateTimeFormat("sv-SE",{dateStyle:"medium"}).format(new Date(message.scheduled_at))}</footer>}
      </article>)}</div>}
    </section>

    <section className="sales-section"><div className="panel-heading"><h2>Alla prospekt</h2><span>{prospects.length} totalt</span></div>
      <div className="sales-prospect-table">{prospects.map(item=><article key={item.id}><div><small>{item.service_categories?.name} · {item.municipalities?.name}</small><strong>{item.company_name}</strong><span>{item.email}</span></div><b>{item.score}</b><span className={`sales-status ${item.status}`}>{item.status}</span><form action={suppressProspect}><input type="hidden" name="id" value={item.id}/><button type="submit"><Ban/> Spärra</button></form></article>)}</div>
    </section>
  </main>;
}
