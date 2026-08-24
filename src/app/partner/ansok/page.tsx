import type{Metadata}from"next";import Link from"next/link";import{ArrowLeft,BadgeCheck,FileCheck2,LockKeyhole}from"lucide-react";
import{createClient}from"@/lib/supabase/server";import{purchasePartnerMarkets}from"../actions";import{MarketPicker,type PartnerMarket}from"./MarketPicker";
export const metadata:Metadata={title:"Teckna BoLiv Partner",description:"Välj en eller flera lediga marknader och teckna partneravtalet direkt."};
type Props={searchParams:Promise<{kommun?:string;error?:string}>};
const MARKET_PAGE_SIZE=1000;const MARKET_PAGE_COUNT=15;
export default async function PartnerCheckoutPage({searchParams}:Props){
 const params=await searchParams;const supabase=await createClient();const pages=await Promise.all(Array.from({length:MARKET_PAGE_COUNT},(_,page)=>supabase.rpc("available_partner_markets").range(page*MARKET_PAGE_SIZE,(page+1)*MARKET_PAGE_SIZE-1)));const markets=pages.flatMap(({data})=>(data??[])as PartnerMarket[]);
 const ready=Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);const idempotencyKey=crypto.randomUUID();
 return <main className="partner-form-page"><div className="partner-form-wrap partner-checkout-wrap"><Link href="/partner" className="back-link"><ArrowLeft/>BoLiv Partner</Link>
 <div className="checkout-price-card"><span className="partner-label available">Introduktionserbjudande</span><strong>2 990 kr</strong><small>exkl. moms · per vald bransch och kommun · första året</small><p>Därefter 4 990 kr per plats och år. Alla val samlas på ett avtal och en årsvis förskottsfaktura.</p></div>
 <div className="form-card"><span className="kicker">Teckna direkt</span><h1>Bygg er lokala närvaro.</h1><p>Välj en eller flera lediga marknader. Platserna reserveras direkt när avtalet ingås och företagssidan öppnas när fakturan har skapats.</p>
 {params.error&&<div className="form-message error">{params.error}</div>}{!ready&&<div className="form-message error">Kassan öppnar så snart den säkra serveranslutningen är konfigurerad.</div>}
 {markets.length===0?<div className="panel-empty"><BadgeCheck/><h3>Inga lediga marknader just nu</h3></div>:<form action={purchasePartnerMarkets} className="property-form"><input type="hidden" name="idempotencyKey" value={idempotencyKey}/>
 <h2>Välj marknader</h2><MarketPicker markets={markets}/>
 <h2>Företagsuppgifter</h2><div className="form-columns"><label>Företagsnamn<input name="companyName" required/></label><label>Organisationsnummer<input name="organizationNumber" required/></label></div>
 <div className="form-columns"><label>Kontaktperson<input name="contactName" required/></label><label>E-post för avtal och faktura<input name="email" type="email" required/></label></div><label>Telefon<input name="phone" type="tel"/></label>
 <h2>Fakturaadress</h2><label>Adress<input name="billingAddress" required/></label><div className="form-columns"><label>Postnummer<input name="billingPostalCode" required/></label><label>Ort<input name="billingCity" required/></label></div>
 <div className="contract-summary"><FileCheck2/><div><strong>Ett årsavtal och en samlad faktura</strong><span>2 990 kr exkl. moms per vald plats första året. Därefter 4 990 kr per plats och år.</span></div></div>
 <label className="checkbox-label"><input type="checkbox" name="termsAccepted" value="yes" required/><span>Jag är behörig att företräda företaget och godkänner <Link href="/partner/villkor" target="_blank">avtalsvillkoren</Link>.</span></label>
 <button className="button checkout-button" type="submit" disabled={!ready}><LockKeyhole/>Teckna avtal och skapa faktura</button><small className="checkout-security">Tillgängligheten kontrolleras på nytt när avtalet skickas in.</small></form>}
 </div></div></main>;
}
