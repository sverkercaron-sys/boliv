import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Guide } from "@/data/guides";

type Cluster = {
  title: string;
  description: string;
  kicker: string;
  hero: string;
  slugs: readonly string[];
};

export function ContentClusterHub({ cluster, guides }: { cluster: Cluster; guides: Guide[] }) {
  const ordered = cluster.slugs.map((slug) => guides.find((item) => item.slug === slug)).filter((item): item is Guide => Boolean(item));
  return <main>
    <section className="roof-hero"><div className="container roof-hero-grid">
      <div><span className="kicker">{cluster.kicker}</span><h1>{cluster.hero}</h1><p>{cluster.description}</p>
        <div className="roof-hero-actions"><Link className="button" href={`/guider/${cluster.slugs[0]}`}>Börja med huvudguiden <ArrowRight /></Link></div>
      </div>
      <div className="roof-overview-card"><BookOpen /><strong>{ordered.length} fördjupande guider</strong><span>Oberoende stöd för svenska bostäder</span><div><CheckCircle2 /> Praktiska kontroller</div><div><ShieldCheck /> Myndighetskällor där det krävs</div></div>
    </div></section>
    <section className="section container">
      <div className="section-heading"><div><span className="kicker">Samlad kunskap</span><h2>{cluster.title}</h2></div></div>
      <div className="roof-guide-grid">{ordered.map((guide, index) => <article key={guide.slug}><Link href={`/guider/${guide.slug}`}>
        <span>{String(index + 1).padStart(2, "0")}</span><small>{guide.readingTime} läsning</small><h2>{guide.title}</h2><p>{guide.description}</p><b>Läs guiden <ArrowRight /></b>
      </Link></article>)}</div>
    </section>
    <section className="roof-path"><div className="container"><span className="kicker kicker-light">Så använder du BoLiv</span><h2>Från kontroll till dokumenterad åtgärd</h2><div>
      <Link href={`/guider/${cluster.slugs[0]}`}><b>1</b><strong>Förstå området</strong><span>Börja med huvudguiden.</span></Link>
      <Link href={`/guider/${cluster.slugs[1]}`}><b>2</b><strong>Kontrollera bostaden</strong><span>Hitta behov och risker.</span></Link>
      <Link href="/mitt-boliv"><b>3</b><strong>Spara historiken</strong><span>Samla åtgärder och dokument.</span></Link>
    </div></div></section>
  </main>;
}
