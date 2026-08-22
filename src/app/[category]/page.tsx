import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { categoryLabels } from "@/data/guides";
import { getPublishedGuidesByCategory } from "@/lib/content";

type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return Object.keys(categoryLabels).map((category) => ({ category })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = (await params).category; const label = categoryLabels[category]; if (!label) return {};
  return { title: `${label} – guider för din bostad`, description: `BoLivs praktiska guider inom ${label.toLowerCase()} för svenska hus och hem.` };
}
export default async function CategoryPage({ params }: Props) {
  const category = (await params).category; const label = categoryLabels[category]; if (!label) notFound();
  const items = await getPublishedGuidesByCategory(category);
  return <main>
    <section className="category-landing-hero"><div className="container"><span className="kicker">BoLiv Guider</span><h1>{label}</h1><p>Kunskap, checklistor och praktiska råd som hjälper dig fatta bättre beslut om din bostad.</p></div></section>
    <section className="section container"><Link href="/guider" className="back-link">Alla ämnesområden <ArrowRight /></Link>
      <div className="guide-library-grid">{items.map((guide) => <article className="library-card" key={guide.slug}><Link href={`/guider/${guide.slug}`}><span className="library-icon"><BookOpen /></span><small>{guide.readingTime} läsning</small><h2>{guide.title}</h2><p>{guide.description}</p><span className="read-link">Läs guiden <ArrowRight /></span></Link></article>)}</div>
    </section>
  </main>;
}
