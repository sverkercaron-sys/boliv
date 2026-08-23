import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, FileCheck2, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isFortnoxConfigured } from "@/lib/fortnox";
import { purchasePartnerMarket } from "../actions";

export const metadata: Metadata = {
  title: "Teckna BoLiv Partner",
  description: "Välj en ledig bransch och kommun, godkänn avtalet och aktivera partnerplatsen direkt.",
};

type Props = { searchParams: Promise<{ kommun?: string; bransch?: string; error?: string }> };
type Market = {
  service_slug: string;
  service_name: string;
  municipality_slug: string;
  municipality_name: string;
  county_name: string;
};

export default async function PartnerCheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc("available_partner_markets");
  const markets = (data ?? []) as Market[];
  const services = Array.from(new Map(markets.map(item => [item.service_slug, item.service_name])).entries());
  const municipalities = Array.from(new Map(markets.map(item => [item.municipality_slug, { name: item.municipality_name, county: item.county_name }])).entries());
  const fortnoxReady = isFortnoxConfigured();
  const idempotencyKey = crypto.randomUUID();

  return <main className="partner-form-page"><div className="partner-form-wrap partner-checkout-wrap">
    <Link href="/partner" className="back-link"><ArrowLeft /> BoLiv Partner</Link>
    <div className="checkout-price-card">
      <span className="partner-label available">Introduktionserbjudande</span>
      <strong>2 990 kr</strong><small>exkl. moms · första året</small>
      <p>Därefter 4 990 kr exkl. moms per år. Årsvis fakturering i förskott, 30 dagars betalningsvillkor.</p>
    </div>
    <div className="form-card"><span className="kicker">Teckna direkt</span><h1>Välj och aktivera er marknad.</h1>
      <p>Endast lediga kombinationer visas. När avtalet skickas in reserveras platsen, fakturan skapas i Fortnox och partnerplatsen aktiveras.</p>
      {params.error && <div className="form-message error">{params.error}</div>}
      {!fortnoxReady && <div className="form-message error">Kassan är förberedd men öppnar först när Fortnox-kopplingen har aktiverats.</div>}
      {markets.length === 0 ? <div className="panel-empty"><BadgeCheck /><h3>Inga lediga marknader just nu</h3></div> :
      <form action={purchasePartnerMarket} className="property-form">
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <div className="form-columns">
          <label>Bransch<select name="service" defaultValue={params.bransch ?? services[0]?.[0]} required>{services.map(([slug,name])=><option value={slug} key={slug}>{name}</option>)}</select></label>
          <label>Kommun<select name="municipality" defaultValue={params.kommun ?? ""} required><option value="">Välj ledig kommun</option>{municipalities.map(([slug,item])=><option value={slug} key={slug}>{item.name} · {item.county}</option>)}</select></label>
        </div>
        <h2>Företagsuppgifter</h2>
        <div className="form-columns"><label>Företagsnamn<input name="companyName" required /></label><label>Organisationsnummer<input name="organizationNumber" required /></label></div>
        <div className="form-columns"><label>Kontaktperson<input name="contactName" required /></label><label>E-post för avtal och faktura<input name="email" type="email" required /></label></div>
        <label>Telefon<input name="phone" type="tel" /></label>
        <h2>Fakturaadress</h2>
        <label>Adress<input name="billingAddress" required /></label>
        <div className="form-columns"><label>Postnummer<input name="billingPostalCode" required /></label><label>Ort<input name="billingCity" required /></label></div>
        <div className="contract-summary"><FileCheck2 /><div><strong>Årsavtal – BoLiv Partner</strong><span>2 990 kr exkl. moms första året. Förnyas årsvis för 4 990 kr exkl. moms.</span></div></div>
        <label className="checkbox-label"><input type="checkbox" name="termsAccepted" value="yes" required /><span>Jag är behörig att företräda företaget och godkänner <Link href="/partner/villkor" target="_blank">BoLiv Partners avtalsvillkor</Link>.</span></label>
        <button className="button checkout-button" type="submit" disabled={!fortnoxReady}><LockKeyhole /> Teckna avtal och skapa faktura</button>
        <small className="checkout-security">Tillgängligheten kontrolleras igen när du skickar in. Ingen kortbetalning sker.</small>
      </form>}
    </div>
  </div></main>;
}
