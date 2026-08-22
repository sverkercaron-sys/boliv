"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function editorClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");
  const { data: allowed } = await supabase.rpc("has_editor_role");
  if (!allowed) redirect("/");
  return supabase;
}

function firstMessage(company:string, service:string, municipality:string, token:string) {
  return {
    subject: `Exklusiv partnerplats för ${service.toLowerCase()} i ${municipality}`,
    body_text: `Hej,

BoLiv öppnar nu en exklusiv partnerplats för ${service.toLowerCase()} i ${municipality}. Vi bygger guider, kalkyler och lokala sidor för bostadsägare som planerar projekt och söker rätt företag.

Vi kontaktar ${company} eftersom ni verkar inom området. Endast ett företag kan vara aktiv partner för tjänsten i kommunen.

Är det intressant att få upplägg, pris och mer information?

Vänliga hälsningar
BoLiv

Avregistrering: {{SITE_URL}}/avregistrera/${token}`,
  };
}

function followUp(step:number, company:string, service:string, municipality:string, token:string) {
  if (step === 2) return {
    subject: `Angående partnerplatsen i ${municipality}`,
    body_text: `Hej,

Jag följer upp mitt tidigare mejl om BoLivs exklusiva partnerplats för ${service.toLowerCase()} i ${municipality}.

Platsen innebär att ${company} syns i direkt anslutning till relevanta guider, kalkyler och den lokala marknadssidan. Svara gärna om ni vill se ett konkret upplägg.

Vänliga hälsningar
BoLiv

Avregistrering: {{SITE_URL}}/avregistrera/${token}`,
  };
  return {
    subject: `Sista återkopplingen om ${municipality}`,
    body_text: `Hej,

Det här blir min sista återkoppling om partnerplatsen för ${service.toLowerCase()} i ${municipality}. Om det kan vara intressant skickar jag gärna pris och villkor. Annars hör vi inte av oss igen i den här frågan.

Vänliga hälsningar
BoLiv

Avregistrering: {{SITE_URL}}/avregistrera/${token}`,
  };
}

export async function createProspect(formData:FormData) {
  const companyName=String(formData.get("companyName")??"").trim();
  const email=String(formData.get("email")??"").trim().toLowerCase();
  const municipalityCode=String(formData.get("municipalityCode")??"");
  const serviceCategoryId=String(formData.get("serviceCategoryId")??"");
  const score=Math.max(0,Math.min(100,Number(formData.get("score")??50)));
  if (!companyName || !email.includes("@") || !municipalityCode || !serviceCategoryId) redirect("/redaktion/salj?error=Fyll+i+företag,+e-post,+kommun+och+tjänst");

  const supabase=await editorClient();
  const { data:suppressed }=await supabase.from("sales_suppressions").select("id").ilike("email",email).maybeSingle();
  if (suppressed) redirect("/redaktion/salj?error=E-postadressen+finns+i+spärrlistan");

  const [{data:municipality},{data:service}]=await Promise.all([
    supabase.from("municipalities").select("name").eq("code",municipalityCode).single(),
    supabase.from("service_categories").select("name").eq("id",serviceCategoryId).single(),
  ]);
  const token=crypto.randomUUID();
  const { data:prospect,error }=await supabase.from("sales_prospects").insert({
    company_name:companyName,
    organization_number:String(formData.get("organizationNumber")??"").trim()||null,
    website_url:String(formData.get("websiteUrl")??"").trim()||null,
    email,
    phone:String(formData.get("phone")??"").trim()||null,
    contact_name:String(formData.get("contactName")??"").trim()||null,
    municipality_code:municipalityCode,
    service_category_id:serviceCategoryId,
    source_name:String(formData.get("sourceName")??"").trim()||null,
    source_url:String(formData.get("sourceUrl")??"").trim()||null,
    score,
    status:"review",
    unsubscribe_token:token,
    notes:String(formData.get("notes")??"").trim()||null,
  }).select("id").single();
  if (error || !prospect) {
    const message=error?.code==="23505"?"Prospektet finns redan för den här marknaden":error?.message??"Prospektet kunde inte skapas";
    redirect(`/redaktion/salj?error=${encodeURIComponent(message)}`);
  }
  const message=firstMessage(companyName,service?.name??"tjänsten",municipality?.name??"kommunen",token);
  await supabase.from("sales_messages").insert({prospect_id:prospect.id,sequence_step:1,...message});
  revalidatePath("/redaktion/salj");
  redirect("/redaktion/salj?success=Prospekt+och+mejlgrund+är+skapade");
}

export async function approveMessage(formData:FormData) {
  const id=String(formData.get("id")??"");
  const subject=String(formData.get("subject")??"").trim();
  const bodyText=String(formData.get("bodyText")??"").trim();
  if (!id || !subject || !bodyText) return;
  const supabase=await editorClient();
  await supabase.from("sales_messages").update({subject,body_text:bodyText,status:"approved",approved_at:new Date().toISOString()}).eq("id",id).eq("status","draft");
  revalidatePath("/redaktion/salj");
}

export async function markMessageSent(formData:FormData) {
  const id=String(formData.get("id")??"");
  const supabase=await editorClient();
  const {data:message}=await supabase.from("sales_messages").select("id,prospect_id,sequence_step,sales_prospects(company_name,unsubscribe_token,municipalities(name),service_categories(name))").eq("id",id).single();
  if (!message) return;
  const sentAt=new Date();
  await supabase.from("sales_messages").update({status:"sent",sent_at:sentAt.toISOString()}).eq("id",id).eq("status","approved");
  const prospect=message.sales_prospects as unknown as {company_name:string;unsubscribe_token:string;municipalities:{name:string}|null;service_categories:{name:string}|null};
  const nextStep=message.sequence_step+1;
  const nextDate=new Date(sentAt);
  nextDate.setDate(nextDate.getDate()+(nextStep===2?4:5));
  await supabase.from("sales_prospects").update({status:"contacted",last_contacted_at:sentAt.toISOString(),next_follow_up_at:nextStep<=3?nextDate.toISOString():null}).eq("id",message.prospect_id);
  if (nextStep<=3) {
    const next=followUp(nextStep,prospect.company_name,prospect.service_categories?.name??"tjänsten",prospect.municipalities?.name??"kommunen",prospect.unsubscribe_token);
    await supabase.from("sales_messages").upsert({prospect_id:message.prospect_id,sequence_step:nextStep,scheduled_at:nextDate.toISOString(),...next},{onConflict:"prospect_id,sequence_step"});
  }
  revalidatePath("/redaktion/salj");
}

export async function suppressProspect(formData:FormData) {
  const id=String(formData.get("id")??"");
  const supabase=await editorClient();
  const {data}=await supabase.from("sales_prospects").select("email").eq("id",id).single();
  if (!data) return;
  await supabase.from("sales_suppressions").upsert({email:data.email,reason:"manual",source:"editor"},{onConflict:"email"});
  await supabase.from("sales_prospects").update({status:"suppressed"}).eq("id",id);
  await supabase.from("sales_messages").update({status:"cancelled"}).eq("prospect_id",id).in("status",["draft","approved"]);
  revalidatePath("/redaktion/salj");
}
