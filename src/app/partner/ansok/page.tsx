import type{Metadata}from"next";import Link from"next/link";import{ArrowLeft,BadgeCheck,FileCheck2,LockKeyhole,MapPin}from"lucide-react";
import{createClient}from"@/lib/supabase/server";import{isFortnoxConfigured}from"@/lib/fortnox";import{purchasePartnerMarkets}from"../actions";
export const metadata:Metadata={title:"Teckna BoLiv Partner",description:"Välj en eller flera lediga marknader och teckna partneravtalet direkt."};
type Market={service_slug:string;service_name:string;municipality_slug:string;municipality_name:string;county_name:string};
type Props={searchParams:Promise<{kommun?:string;error?:string}>};
export default async function PartnerCheckoutPage({searchParams}:Props){
 const params=await searchParams;const supabase=await createClient();const{data}=await supabase.rpc("available_partner_markets");const markets=(data??[])as Market[];
 const grouped=markets.reduce<Record<string,Market[]>>((sum,item)=>{(sum[item.service_name]??=[]).push(item);return sum;},{});
 const ready=isFortnoxConfigured()&&Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);const idempotencyKey=crypto.randomUUID();
 return <main className="partner-form-page"><div className="partner-form-wrap partner-checkout-wrap"><Link href="/partner" className="back-link"><ArrowLeft/>BoLiv Partner</Link>
 <div className="checkout-price-card"><span className="partner-label available">Introduktionserbjudande</span><strong>2 990 kr</strong><small>exkl. moms · per vald bransch och kommun · första året</small><p>Därefter 4 990 kr per plats och år. Alla val samlas på ett avtal och en Fortnox-faktura.</p></div>
 <div className="form-card"><span className="kicker">Teckna direkt</span><h1>Bygg er lokala närvaro.</h1><p>Välj en eller flera lediga marknader. Platserna markeras som sålda när fakturan skapas och företagssidan publiceras automatiskt när betalningen registreras.</p>
 {params.error&&<div className="form-message error">{params.error}</div>}{!ready&&<div className="form-message error">Kassan öppnar när Fortnox-kopplingen är aktiverad.</div>}
 {markets.length===0?<div className="panel-empty"><BadgeCheck/><h3>Inga lediga marknader just nu</h3></div>:<form action={purchasePartnerMarkets} className="property-form"><input type="hidden" name="idempotencyKey" value={idempotencyKey}/>
 <h2>Välj marknader</h2><div className="market-picker">{Object.entries(grouped).map(([service,items])=><fieldset key={service}><legend>{service}</legend>{items.map(item=><label className="market-option" key={`${item.service_slug}:${item.municipality_slug}`}><input type="checkbox" name="markets" value={`${item.service_slug}:${item.municipality_slug}`} defaultChecked={params.kommun===item.municipality_slug}/><MapPin/><span><strong>{item.municipality_name}</strong><small>{item.county_name} · 2 990 kr år 1</small></span></label>)}</fieldset>)}</div>
 <h2>Företagsuppgifter</h2><div className="form-columns"><label>Företagsnamn<input name="companyName" required/></label><label>Organisationsnummer<input name="organizationNumber" required/></label></div>
 <div className="form-columns"><label>Kontaktperson<input name="contactName" required/></label><label>E-post för avtal och faktura<input name="email" type="email" required/></label></div><label>Telefon<input name="phone" type="tel"/></label>
 <h2>Fakturaadress</h2><label>Adress<input name="billingAddress" required/></label><div className="form-columns"><label>Postnummer<input name="billingPostalCode" required/></label><label>Ort<input name="billingCity" required/></label></div>
 <div className="contract-summary"><FileCheck2/><div><strong>Ett årsavtal och en samlad faktura</strong><span>2 990 kr exkl. moms per vald plats första året. Därefter 4 990 kr per plats och år.</span></div></div>
 <label className="checkbox-label"><input type="checkbox" name="termsAccepted" value="yes" required/><span>Jag är behörig att företräda företaget och godkänner <Link href="/partner/villkor" target="_blank">avtalsvillkoren</Link>.</span></label>
 <button className="button checkout-button" type="submit" disabled={!ready}><LockKeyhole/>Teckna avtal och skapa faktura</button><small className="checkout-security">Tillgängligheten kontrolleras på nytt när avtalet skickas in.</small></form>}
 </div></div></main>;
}