import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Calculator, Check, MapPin, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ kommun: string }> };
type Municipality = { code: string; name: string; county_name: string; slug: string };
type Placement = { partner_organizations: { name: string; description: string | null; website_url: string | null; phone: string | null } | null };

async function getMarket(slug: string) {
  const supabase = await createClient();
  const { data: municipality } = await supabase.from("municipalities").select("code,name,county_name,slug").eq("slug", slug).single();
  if (!municipality) return null;
  const { data: service } = await supabase.from("service_categories").select("id").eq("slug", "taklaggare").single();
  let placement: Placement | null = null;
  if (service) {
    const { data } = await supabase.from("partner_placements").select("partner_organizations(name,description,website_url,phone)").eq("municipality_code", municipality.code).eq("service_category_id", service.id).eq("status", "active").maybeSingle();
    placement = data as unknown as Placement | null;
  }
  return { municipality: municipality as Municipality, partner: placement?.partner_organizations ?? null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = await getMarket((await params).kommun);
  if (!market) return {};
  return {
    title: `Takläggare i ${market.municipality.name} – guider och lokal hjälp`,
    description: `Planerar du takbyte i ${market.municipality.name}? Läs BoLivs guider, räkna på kostnaden och hitta en lokal takläggare.`,
    alternates: { canonical: `/taklaggare/${market.municipality.slug}` },
  };
}

export default async function LocalRooferPage({ params }: Props) {
  const market = await getMarket((await params).kommun);
  if (!market) notFound();
  const { municipality, partner } = market;
  const faq = [
    { q: `Vad kostar ett takbyte i ${municipality.name}?`, a: "Priset beror på takyta, lutning, material, åtkomlighet och underlagets skick. Börja med takkalkylen och begär sedan en specificerad offert." },
    { q: "Hur många offerter bör jag ta in?", a: "Ta gärna in flera jämförbara offerter med samma omfattning. Kontrollera försäkring, referenser, garantier och betalningsplan." },
    { q: "Behövs bygglov för nytt tak?", a: "Det kan krävas om material eller utseende ändras, särskilt inom detaljplan eller kulturmiljö. Kontrollera med kommunen före beställning." },
  ];
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="local-market-hero"><div className="container"><span className="kicker"><MapPin /> {municipality.county_name}</span><h1>Takläggare i {municipality.name}</h1><p>Kunskap och lokal hjälp för dig som ska reparera, underhålla eller byta tak.</p><div><Link className="button" href="/verktyg/takkalkyl"><Calculator /> Räkna på taket</Link><Link className="button local-outline" href="/renovera/tak">Läs takguiderna <ArrowRight /></Link></div></div></section>
    <section className="section container local-market-grid"><div>
      <span className="kicker">Inför takprojektet</span><h2>Ta kontroll innan du beställer.</h2><p>Ett bra underlag gör offerterna lättare att jämföra och minskar risken för kostsamma missförstånd.</p>
      <ul className="local-checklist"><li><Check /> Bedöm takets och underlagets skick</li><li><Check /> Jämför material för rätt taklutning</li><li><Check /> Specificera plåt, ställning och avfall</li><li><Check /> Skriv avtal och dokumentera arbetet</li></ul>
      <div className="local-guide-links"><Link href="/guider/byta-tak">Komplett guide till takbyte <ArrowRight /></Link><Link href="/guider/jamfora-takofferter">Jämför takofferter <ArrowRight /></Link><Link href="/guider/bygglov-byta-tak">Bygglov för takbyte <ArrowRight /></Link></div>
    </div>
    <aside className="partner-slot">
      {partner ? <><span className="partner-label">Utvald BoLiv Partner</span><BadgeCheck /><h2>{partner.name}</h2><p>{partner.description ?? `Takläggare för projekt i ${municipality.name}.`}</p>{partner.phone && <a href={`tel:${partner.phone}`}>{partner.phone}</a>}{partner.website_url && <a className="button" href={partner.website_url} rel="sponsored noopener" target="_blank">Besök företaget <ArrowRight /></a>}<small>Kommersiell partnerplats. BoLivs redaktionella guider är oberoende.</small></>
      : <><span className="partner-label available">Partnerplats ledig</span><ShieldCheck /><h2>Är ni takläggare i {municipality.name}?</h2><p>BoLiv väljer en exklusiv partner för den här tjänsten och kommunen.</p><Link className="button" href={`/partner/ansok?kommun=${municipality.slug}`}>Anmäl intresse <ArrowRight /></Link><small>En aktiv partnerplats per tjänst och kommun.</small></>}
    </aside></section>
    <section className="local-faq"><div className="container"><span className="kicker">Vanliga frågor</span><h2>Takbyte i {municipality.name}</h2>{faq.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>
  </main>;
}
