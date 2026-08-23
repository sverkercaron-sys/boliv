import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import { getAllPublishedGuides } from "@/lib/content";
import { technicalClusters } from "@/data/technical";

export async function TechnicalClusterHub({ clusterSlug }: { clusterSlug: string }) {
  const cluster = technicalClusters.find((item) => item.slug === clusterSlug);
  if (!cluster) return null;
  const set = new Set<string>(cluster.slugs);
  const guides = (await getAllPublishedGuides()).filter((item) => set.has(item.slug));
  const first = guides[0];
  return <main>
    <section className="roof-hero"><div className="container roof-hero-grid">
      <div><span className="kicker">BoLiv om {cluster.label.toLowerCase()}</span><h1>{cluster.title}</h1><p>{cluster.description}</p>
        {first && <div className="roof-hero-actions"><Link className="button" href={`/guider/${first.slug}`}>Börja med huvudguiden <ArrowRight /></Link><Link className="button roof-secondary" href="/guider"><Wrench /> Alla guider</Link></div>}
      </div>
      <div className="roof-overview-card"><Wrench /><strong>{guides.length} guider</strong><span>Beslut, beställning och kontroll</span><div><CheckCircle2 /> Praktiska checklistor</div><div><ShieldCheck /> Svenska primärkällor</div></div>
    </div></section>
    <section className="section container"><div className="section-heading"><div><span className="kicker">Kunskap före beställning</span><h2>Guider i rätt ordning</h2></div></div>
      <div className="roof-guide-grid">{guides.map((item, index) => <article key={item.slug}><Link href={`/guider/${item.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><small>{item.readingTime} läsning</small><h2>{item.title}</h2><p>{item.description}</p><b>Läs guiden <ArrowRight /></b></Link></article>)}</div>
    </section>
    <section className="roof-path"><div className="container"><span className="kicker kicker-light">BoLiv-metoden</span><h2>Från symtom eller idé till verifierad lösning</h2><div>
      <span><b>1</b><strong>Förstå nuläget</strong><span>Mät och dokumentera innan du väljer produkt.</span></span>
      <span><b>2</b><strong>Jämför lösningar</strong><span>Bedöm funktion, risk och total kostnad.</span></span>
      <span><b>3</b><strong>Kontrollera resultatet</strong><span>Spara provning, intyg och uppföljning.</span></span>
    </div></div></section>
  </main>;
}
