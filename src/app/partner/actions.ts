"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAnnualPartnerInvoice, isFortnoxConfigured } from "@/lib/fortnox";

type PurchaseResult={contract_id:string;total_price_ex_vat:number};
function checkoutError(message:string):never{redirect(`/partner/ansok?error=${encodeURIComponent(message)}`);}

export async function purchasePartnerMarkets(formData:FormData){
 const marketKeys=formData.getAll("markets").map(String).filter(Boolean);
 const companyName=String(formData.get("companyName")??"").trim();
 const organizationNumber=String(formData.get("organizationNumber")??"").trim();
 const contactName=String(formData.get("contactName")??"").trim();
 const email=String(formData.get("email")??"").trim().toLowerCase();
 const phone=String(formData.get("phone")??"").trim();
 const billingAddress=String(formData.get("billingAddress")??"").trim();
 const billingPostalCode=String(formData.get("billingPostalCode")??"").trim();
 const billingCity=String(formData.get("billingCity")??"").trim();
 const termsAccepted=formData.get("termsAccepted")==="yes";
 const idempotencyKey=String(formData.get("idempotencyKey")??"");

 if(!isFortnoxConfigured()||!process.env.SUPABASE_SERVICE_ROLE_KEY)checkoutError("Kassan öppnar så snart Fortnox-kopplingen är aktiverad.");
 if(!marketKeys.length||!companyName||!organizationNumber||!contactName||!email.includes("@")||!billingAddress||!billingPostalCode||!billingCity||!termsAccepted||!idempotencyKey)checkoutError("Välj minst en marknad, fyll i alla obligatoriska uppgifter och godkänn villkoren.");

 const h=await headers();const acceptedIp=(h.get("x-forwarded-for")??"").split(",")[0].trim()||null;
 const supabase=await createClient();
 const{data,error}=await supabase.rpc("purchase_partner_markets",{p_market_keys:marketKeys,p_company_name:companyName,p_organization_number:organizationNumber,p_contact_name:contactName,p_email:email,p_phone:phone,p_billing_address:billingAddress,p_billing_postal_code:billingPostalCode,p_billing_city:billingCity,p_terms_version:"partner-2026-01",p_idempotency_key:idempotencyKey,p_accepted_ip:acceptedIp});
 if(error||!data?.[0])checkoutError(error?.message?.includes("MARKET_UNAVAILABLE")?"Minst en vald plats hann köpas av ett annat företag. Uppdatera sidan och välj igen.":"Avtalet kunde inte skapas.");

 const purchase=data[0] as PurchaseResult;const admin=createAdminClient();
 const{data:contract,error:contractError}=await admin.from("partner_contracts").select("id,organization_id,company_name,organization_number,contact_name,email,phone,billing_address,billing_postal_code,billing_city,payment_terms_days,partner_contract_items(price_ex_vat,partner_placements(service_categories(name),municipalities(name)))").eq("id",purchase.contract_id).single();
 if(contractError||!contract)checkoutError("Avtalet skapades men faktureringen kunde inte startas.");

 const rawItems=(contract.partner_contract_items??[]) as unknown as Array<{price_ex_vat:number;partner_placements:{service_categories:{name:string}|null;municipalities:{name:string}|null}|null}>;
 const invoiceContract={...contract,items:rawItems.map(item=>({price_ex_vat:Number(item.price_ex_vat),service_name:item.partner_placements?.service_categories?.name??"Partnerplats",municipality_name:item.partner_placements?.municipalities?.name??"Kommun"}))};

 try{
  const invoice=await createAnnualPartnerInvoice(invoiceContract);
  await admin.from("partner_contracts").update({fortnox_customer_number:invoice.customerNumber,fortnox_invoice_number:invoice.invoiceNumber,invoice_created_at:new Date().toISOString(),invoice_error:null,updated_at:new Date().toISOString()}).eq("id",purchase.contract_id);

  const invitation=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:`${process.env.NEXT_PUBLIC_SITE_URL??"https://boliv-olive.vercel.app"}/partnerkonto`,data:{display_name:contactName}});
  if(invitation.data.user){
   await admin.from("partner_members").upsert({organization_id:contract.organization_id,user_id:invitation.data.user.id,role:"owner"});
   await admin.from("partner_invitations").update({accepted_at:new Date().toISOString()}).eq("organization_id",contract.organization_id).eq("email",email);
  }
 }catch(invoiceError){
  const message=invoiceError instanceof Error?invoiceError.message.slice(0,500):"Okänt Fortnox-fel";
  await admin.from("partner_contracts").update({status:"invoice_failed",invoice_error:message,updated_at:new Date().toISOString()}).eq("id",purchase.contract_id);
  const{data:items}=await admin.from("partner_contract_items").select("placement_id").eq("contract_id",purchase.contract_id);
  if(items?.length)await admin.from("partner_placements").update({status:"ended",reserved_until:null,internal_notes:"Automatisk fakturering misslyckades",updated_at:new Date().toISOString()}).in("id",items.map(item=>item.placement_id));
  checkoutError("Fakturan kunde inte skapas. Inga partnerplatser aktiverades.");
 }
 redirect(`/partner/klart?avtal=${purchase.contract_id}`);
}
