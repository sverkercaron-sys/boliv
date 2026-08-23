import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileCheck2, MapPin, ReceiptText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "BoLiv Partner – köp en exklusiv plats direkt",
  description: "Välj en ledig bransch och kommun, teckna årsavtal och få partnerplatsen aktiverad automatiskt.",
};

export default function PartnerPage() {
  return <main>
    <section className="partner-hero"><div className="container partner-hero-grid"><div>
      <span className="kicker kicker-light">BoLiv Partner</span><h1>En bransch. En kommun. En utvald partner.</h1>
      <p>Välj en ledig marknad, teckna avtalet digitalt och aktivera er plats direkt.</p>
      <Link className="button button-light" href="/partner/ansok">Se lediga marknader <ArrowRight /></Link>
    </div><div className="partner-market-card"><MapPin /><small>Introduktionserbjudande</small><strong>2 990 kr första året</strong><span>Därefter 4 990 kr/år · priser exkl. moms</span><b>Årsfaktura via Fortnox</b></div></div></section>
    <section className="section container"><div className="section-heading"><div><span className="kicker">Helt automatiserat</span><h2>Från ledig marknad till aktiv partner.</h2></div></div>
      <div className="partner-benefits">
        <article><MapPin /><h3>1. Välj marknad</h3><p>Systemet visar endast lediga kombinationer av bransch och kommun.</p></article>
        <article><FileCheck2 /><h3>2. Teckna avtal</h3><p>Fyll i företagsuppgifter och godkänn de versionshanterade villkoren.</p></article>
        <article><ReceiptText /><h3>3. Automatisk faktura</h3><p>Kund och årsfaktura skapas och skickas direkt från Fortnox.</p></article>
        <article><BadgeCheck /><h3>4. Platsen aktiveras</h3><p>Ingen annan kan köpa samma bransch och kommun.</p></article>
      </div>
    </section>
    <section className="partner-cta"><div className="container"><div><span className="kicker">Introduktionspris</span><h2>Ta en ledig kommun för 2 990 kr.</h2><p>Första året 2 990 kr exklusive moms. Därefter 4 990 kr exklusive moms per år, fakturerat årsvis i förskott.</p></div><Link className="button" href="/partner/ansok">Välj bransch och kommun <ShieldCheck /></Link></div></section>
  </main>;
}
