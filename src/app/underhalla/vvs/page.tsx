import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Droplets, ShieldCheck, Wrench } from "lucide-react";
import { getAllPublishedGuides } from "@/lib/content";
import { plumbingGuideSet } from "@/data/plumbing";

export const metadata: Metadata = {
  title: "VVS och vatten – guider om läckage, rör och egen brunn",
  description: "BoLivs guider om VVS i hemmet: vattenläckor, rör, avstängning, vattentryck, kök, VVS-företag och egen brunn.",
  alternates: { canonical: "/underhalla/vvs" },
};

export default async function PlumbingHubPage() {
  const all = await getAllPublishedGuides();
  const guides = all.filter((guide) => plumbingGuideSet.has(guide.slug));
  return <main>
    <section className="roof-hero"><div className="container roof-hero-grid">
      <div><span className="kicker">BoLiv om VVS och vatten</span><h1>Förebygg skadan och agera rätt när vattnet läcker.</h1><p>Oberoende guider för villa, bostadsrätt och fritidshus – från vardagsfel och akutlägen till egen brunn.</p>
        <div className="roof-hero-actions"><Link className="button" href="/guider/vvs-i-hemmet">Börja med VVS-guiden <ArrowRight /></Link><Link className="button roof-secondary" href="/guider/vattenlacka-akut"><Droplets /> Vid vattenläcka</Link></div>
      </div>
      <div className="roof-overview-card"><Wrench /><strong>{guides.length} VVS-guider</strong><span>Förebygg, felsök och beställ rätt hjälp</span><div><CheckCircle2 /> Praktiska åtgärdslistor</div><div><ShieldCheck /> Kontrollerade svenska källor</div></div>
    </div></section>

    <section className="section container">
      <div className="section-heading"><div><span className="kicker">Vatten i hela bostaden</span><h2>Från droppande kran till dold läcka</h2></div></div>
      <div className="roof-guide-grid">{guides.map((guide, index) => <article key={guide.slug}>
        <Link href={`/guider/${guide.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><small>{guide.readingTime} läsning</small><h2>{guide.title}</h2><p>{guide.description}</p><b>Läs guiden <ArrowRight /></b></Link>
      </article>)}</div>
    </section>

    <section className="roof-path"><div className="container"><span className="kicker kicker-light">Viktigast först</span><h2>Skapa kontroll över vattnet hemma</h2><div>
      <Link href="/guider/avstangningsventiler-vattenmatare"><b>1</b><strong>Hitta avstängningen</strong><span>Var redo innan något händer.</span></Link>
      <Link href="/guider/upptacka-dolt-vattenlackage"><b>2</b><strong>Se tidiga tecken</strong><span>Upptäck små läckage.</span></Link>
      <Link href="/guider/anlita-vvs-foretag"><b>3</b><strong>Beställ rätt hjälp</strong><span>Jämför företag och offerter.</span></Link>
    </div></div></section>
  </main>;
}
