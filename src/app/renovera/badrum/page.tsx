import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, Droplets, ShieldCheck } from "lucide-react";
import { getAllPublishedGuides } from "@/lib/content";
import { bathroomGuideSet } from "@/data/bathroom";

export const metadata: Metadata = {
  title: "Badrum – guider om renovering, kostnad, tätskikt och VVS",
  description: "BoLivs samlade kunskap om badrum: planering, pris, tätskikt, VVS, el, offerter, dokumentation och slutkontroll.",
  alternates: { canonical: "/renovera/badrum" },
};

export default async function BathroomHubPage() {
  const all = await getAllPublishedGuides();
  const guides = all.filter((guide) => bathroomGuideSet.has(guide.slug));
  return <main>
    <section className="roof-hero"><div className="container roof-hero-grid">
      <div><span className="kicker">BoLiv om badrum</span><h1>Ett tryggt badrum börjar med rätt beslut.</h1><p>Oberoende guider om planering, kostnad, tätskikt, VVS, el och dokumentation för villa och bostadsrätt.</p>
        <div className="roof-hero-actions"><Link className="button" href="/guider/renovera-badrum">Börja med helhetsguiden <ArrowRight /></Link><Link className="button roof-secondary" href="/guider/renovera-badrum-kostnad"><ClipboardCheck /> Gör en budget</Link></div>
      </div>
      <div className="roof-overview-card"><Droplets /><strong>{guides.length} badrumsguider</strong><span>Från första skiss till slutkontroll</span><div><CheckCircle2 /> Praktiska checklistor</div><div><ShieldCheck /> Svenska regler och branschkrav</div></div>
    </div></section>

    <section className="section container">
      <div className="section-heading"><div><span className="kicker">Hela badrumsresan</span><h2>Planera, beställ och kontrollera</h2></div></div>
      <div className="roof-guide-grid">{guides.map((guide, index) => <article key={guide.slug}>
        <Link href={`/guider/${guide.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><small>{guide.readingTime} läsning</small><h2>{guide.title}</h2><p>{guide.description}</p><b>Läs guiden <ArrowRight /></b></Link>
      </article>)}</div>
    </section>

    <section className="roof-path"><div className="container"><span className="kicker kicker-light">Rekommenderad ordning</span><h2>Ska du renovera badrummet?</h2><div>
      <Link href="/guider/renovera-badrum-kostnad"><b>1</b><strong>Sätt budgeten</strong><span>Förstå hela kostnaden.</span></Link>
      <Link href="/guider/jamfora-badrumsofferter"><b>2</b><strong>Jämför offerter</strong><span>Hitta luckor före avtalet.</span></Link>
      <Link href="/guider/slutkontroll-badrum"><b>3</b><strong>Kontrollera leveransen</strong><span>Säkra funktion och dokument.</span></Link>
    </div></div></section>
  </main>;
}
