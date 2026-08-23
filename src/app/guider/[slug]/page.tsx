import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { guides as staticGuides } from "@/data/guides";
import { getAllPublishedGuides, getPublishedGuide } from "@/lib/content";
import { roofGuideSet } from "@/data/roof";
import { bathroomGuideSet } from "@/data/bathroom";
import { plumbingGuideSet } from "@/data/plumbing";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return staticGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getPublishedGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title, description: guide.description,
    alternates: { canonical: `/guider/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, type: "article", locale: "sv_SE" },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = await getPublishedGuide((await params).slug);
  if (!guide) notFound();
  const allGuides = await getAllPublishedGuides();
  const inRoofCluster = roofGuideSet.has(guide.slug);
  const inBathroomCluster = bathroomGuideSet.has(guide.slug);
  const inPlumbingCluster = plumbingGuideSet.has(guide.slug);
  const clusterSet = inRoofCluster ? roofGuideSet : inBathroomCluster ? bathroomGuideSet : inPlumbingCluster ? plumbingGuideSet : null;
  const related = allGuides.filter((item) => (clusterSet ? clusterSet.has(item.slug) : item.category === guide.category) && item.slug !== guide.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article", headline: guide.title,
    description: guide.description, dateModified: "2026-08-22", inLanguage: "sv-SE",
    author: { "@type": "Organization", name: "BoLiv" }, publisher: { "@type": "Organization", name: "BoLiv" },
  };

  return (
    <main className="article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="article-hero"><div className="article-container">
        <Link href={inRoofCluster ? "/renovera/tak" : inBathroomCluster ? "/renovera/badrum" : inPlumbingCluster ? "/underhalla/vvs" : "/guider"} className="back-link"><ArrowLeft /> {inRoofCluster ? "Allt om tak" : inBathroomCluster ? "Allt om badrum" : inPlumbingCluster ? "Allt om VVS och vatten" : "Alla guider"}</Link>
        <Link href={`/${guide.category}`} className="article-category">{guide.categoryLabel}</Link>
        <h1>{guide.title}</h1><p>{guide.description}</p>
        <div className="article-meta"><span><Clock /> {guide.readingTime} läsning</span><span><ShieldCheck /> Uppdaterad {guide.updated}</span></div>
      </div></header>
      <div className="article-layout article-container">
        <article className="article-content">
          <p className="article-intro">{guide.intro}</p>
          {guide.sections.map((section) => <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>)}
          {guide.sources && guide.sources.length > 0 && <section className="article-sources"><h2>Källor och vidare läsning</h2><ul>{guide.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></section>}
          <aside className="article-cta"><span className="kicker">Mitt BoLiv</span><h2>Spara projekt, kostnader och dokument.</h2><p>Samla bostadens historik i en privat digital pärm.</p><Link className="button" href="/skapa-konto">Skapa gratis konto <ArrowRight /></Link></aside>
        </article>
        <aside className="article-sidebar"><strong>I den här guiden</strong>{guide.sections.map((section) => <span key={section.heading}>{section.heading}</span>)}<small>BoLivs guider ger generell information. Kontrollera alltid myndighetskrav och anlita behörig expert när det behövs.</small></aside>
      </div>
      {related.length > 0 && <section className="related-guides"><div className="article-container">
        <span className="kicker">Läs vidare</span><h2>Fler guider inom {guide.categoryLabel.toLowerCase()}</h2>
        <div>{related.map((item) => <Link href={`/guider/${item.slug}`} key={item.slug}><strong>{item.title}</strong><ArrowRight /></Link>)}</div>
      </div></section>}
    </main>
  );
}
