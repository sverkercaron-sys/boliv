import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, ShieldCheck } from "lucide-react";
import { getAllPublishedGuides } from "@/lib/content";
import { housingClusters, housingGuideSets, type HousingCluster } from "@/data/housing";

export async function HousingClusterHub({ cluster }: { cluster: HousingCluster }) {
  const config = housingClusters[cluster];
  const guides = (await getAllPublishedGuides()).filter((guide) => housingGuideSets[cluster].has(guide.slug));
  return <main>
    <section className="roof-hero"><div className="container roof-hero-grid">
      <div><span className="kicker">{config.kicker}</span><h1>{config.title}</h1><p>{config.lead}</p>
        <div className="roof-hero-actions"><Link className="button" href={`/guider/${config.start}`}>Börja med huvudguiden <ArrowRight /></Link><Link className="button roof-secondary" href="/mitt-boliv"><Home /> Samla i Mitt BoLiv</Link></div>
      </div>
      <div className="roof-overview-card"><Home /><strong>{guides.length} fördjupande guider</strong><span>Oberoende vägledning genom hela beslutet</span><div><CheckCircle2 /> Praktiska checklistor</div><div><ShieldCheck /> Svenska primärkällor</div></div>
    </div></section>
    <section className="section container"><div className="section-heading"><div><span className="kicker">BoLiv guidar</span><h2>Ta nästa steg med bättre underlag</h2></div></div>
      <div className="roof-guide-grid">{guides.map((guide, index) => <article key={guide.slug}><Link href={`/guider/${guide.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><small>{guide.readingTime} läsning</small><h2>{guide.title}</h2><p>{guide.description}</p><b>Läs guiden <ArrowRight /></b></Link></article>)}</div>
    </section>
    <section className="roof-path"><div className="container"><span className="kicker kicker-light">Så använder du guiderna</span><h2>Förstå, kontrollera och dokumentera</h2><div>
      <Link href={`/guider/${guides[0]?.slug ?? config.start}`}><b>1</b><strong>Få överblick</strong><span>Börja med helheten.</span></Link>
      <Link href={`/guider/${guides[1]?.slug ?? config.start}`}><b>2</b><strong>Granska detaljerna</strong><span>Se risker och villkor.</span></Link>
      <Link href="/mitt-boliv"><b>3</b><strong>Spara underlaget</strong><span>Behåll beslut och dokument.</span></Link>
    </div></div></section>
  </main>;
}
