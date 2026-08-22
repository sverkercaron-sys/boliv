import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2, Hammer, ShieldCheck } from "lucide-react";
import { getAllPublishedGuides } from "@/lib/content";
import { roofGuideSet } from "@/data/roof";

export const metadata: Metadata = {
  title: "Tak – guider om takbyte, material, kostnad och underhåll",
  description: "BoLivs samlade kunskap om tak: takbyte, priser, tegel, betong, plåt, papp, läckage, underhåll, bygglov och ROT-avdrag.",
  alternates: { canonical: "/renovera/tak" },
};

export default async function RoofHubPage() {
  const all = await getAllPublishedGuides();
  const guides = all.filter((guide) => roofGuideSet.has(guide.slug));
  return <main>
    <section className="roof-hero"><div className="container roof-hero-grid">
      <div><span className="kicker">BoLiv om tak</span><h1>Tryggare beslut från första kontroll till färdigt tak.</h1><p>Oberoende guider om material, kostnader, offerter, skador och underhåll för svenska hus.</p>
        <div className="roof-hero-actions"><Link className="button" href="/guider/byta-tak">Börja med takbytet <ArrowRight /></Link><Link className="button roof-secondary" href="/verktyg/takkalkyl"><Calculator /> Räkna på taket</Link></div>
      </div>
      <div className="roof-overview-card"><Hammer /><strong>{guides.length} takguider</strong><span>Från planering till löpande skötsel</span><div><CheckCircle2 /> Praktiska checklistor</div><div><ShieldCheck /> Anpassat för svenska hus</div></div>
    </div></section>

    <section className="section container">
      <div className="section-heading"><div><span className="kicker">Hela takresan</span><h2>Allt du behöver veta om tak</h2></div></div>
      <div className="roof-guide-grid">{guides.map((guide, index) => <article key={guide.slug}>
        <Link href={`/guider/${guide.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><small>{guide.readingTime} läsning</small><h2>{guide.title}</h2><p>{guide.description}</p><b>Läs guiden <ArrowRight /></b></Link>
      </article>)}</div>
    </section>

    <section className="roof-path"><div className="container"><span className="kicker kicker-light">Rekommenderad ordning</span><h2>Planerar du ett takbyte?</h2><div>
      <Link href="/guider/kostnad-byta-tak"><b>1</b><strong>Gör en budget</strong><span>Förstå hela kostnaden.</span></Link>
      <Link href="/guider/valja-takmaterial"><b>2</b><strong>Välj material</strong><span>Jämför tekniska krav.</span></Link>
      <Link href="/guider/jamfora-takofferter"><b>3</b><strong>Granska offerter</strong><span>Skriv ett tryggt avtal.</span></Link>
    </div></div></section>
  </main>;
}
