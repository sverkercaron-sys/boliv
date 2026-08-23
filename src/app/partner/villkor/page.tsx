import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Avtalsvillkor – BoLiv Partner" };

export default function PartnerTermsPage() {
  return <main className="section container legal-page">
    <span className="kicker">Version partner-2026-01 · avtalsutkast</span>
    <h1>Avtalsvillkor för BoLiv Partner</h1>
    <div className="form-message error">Villkoren är ett kommersiellt utkast och måste granskas samt kompletteras med BoLivs juridiska företagsuppgifter innan den automatiska kassan öppnas.</div>
    <section><h2>1. Tjänsten</h2><p>Avtalet avser en exklusiv partnerplats för vald tjänstekategori och kommun på BoLiv under avtalsperioden, med förbehåll för dessa villkor.</p></section>
    <section><h2>2. Pris och betalning</h2><p>Introduktionspriset är 2 990 kronor exklusive 25 procent moms för det första avtalsåret. Därefter är priset 4 990 kronor exklusive moms per år. Fakturering sker årsvis i förskott med 30 dagars betalningsvillkor.</p></section>
    <section><h2>3. Avtalsperiod och förnyelse</h2><p>Avtalet gäller i tolv månader från avtalsdagen och förnyas därefter med tolv månader i taget om det inte sägs upp enligt den uppsägningstid som fastställs i den slutliga villkorsversionen.</p></section>
    <section><h2>4. Partnerns ansvar</h2><p>Partnern ansvarar för att företagsuppgifter, behörigheter, försäkringar och marknadsföringsuppgifter är korrekta och att arbeten utförs enligt tillämplig lag och god branschsed.</p></section>
    <section><h2>5. BoLivs ansvar</h2><p>BoLiv tillhandahåller exponeringen men garanterar inte en viss mängd trafik, kontakter, uppdrag eller omsättning.</p></section>
    <section><h2>6. Personuppgifter</h2><p>Personuppgifter behandlas för avtal, fakturering, support och uppföljning enligt BoLivs integritetspolicy.</p></section>
    <p><Link className="button" href="/partner/ansok">Tillbaka till avtalet</Link></p>
  </main>;
}
