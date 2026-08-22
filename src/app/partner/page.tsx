import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "BoLiv Partner – en exklusiv plats i din kommun",
  description: "Nå husägare när de aktivt söker kunskap och hjälp. BoLiv erbjuder en utvald partner per tjänst och kommun.",
};

export default function PartnerPage() {
  return <main>
    <section className="partner-hero"><div className="container partner-hero-grid"><div>
      <span className="kicker kicker-light">BoLiv Partner</span><h1>En bransch. En kommun. En utvald partner.</h1>
      <p>Möt bostadsägare när de läser på, planerar och är redo att ta nästa steg.</p>
      <Link className="button button-light" href="/partner/ansok">Anmäl intresse <ArrowRight /></Link>
    </div><div className="partner-market-card"><MapPin /><small>Exempel på marknad</small><strong>Takläggare i Borås</strong><span>1 exklusiv partnerplats</span><b>Ledig</b></div></div></section>
    <section className="section container"><div className="section-heading"><div><span className="kicker">Så fungerar det</span><h2>Relevant synlighet utan annonsbrus.</h2></div></div>
      <div className="partner-benefits">
        <article><Target /><h3>Rätt sammanhang</h3><p>Företaget visas intill guider och verktyg som matchar tjänsten.</p></article>
        <article><MapPin /><h3>Lokalt exklusivt</h3><p>Endast en aktiv partner per tjänstekategori och kommun.</p></article>
        <article><Users /><h3>Köpstarka besökare</h3><p>Nå husägare som undersöker kostnader, material och nästa åtgärd.</p></article>
        <article><BadgeCheck /><h3>Tydlig avsändare</h3><p>Partnern presenteras öppet och separerat från BoLivs oberoende innehåll.</p></article>
      </div>
    </section>
    <section className="partner-cta"><div className="container"><div><span className="kicker">Pilotplatser</span><h2>Takläggare blir första kategorin.</h2><p>Vi öppnar nu ett begränsat antal kommuner och kontaktar intresserade företag inför lanseringen.</p></div><Link className="button" href="/partner/ansok">Ansök om din kommun <ArrowRight /></Link></div></section>
  </main>;
}
