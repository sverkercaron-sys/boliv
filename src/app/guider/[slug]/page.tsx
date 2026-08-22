import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { getGuide, guides } from "@/data/guides";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guider/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      locale: "sv_SE",
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const related = guides
    .filter((item) => item.category === guide.category && item.slug !== guide.slug)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: "2026-08-22",
    inLanguage: "sv-SE",
    author: { "@type": "Organization", name: "BoLiv" },
    publisher: { "@type": "Organization", name: "BoLiv" },
  };

  return (
    <main className="article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="article-hero">
        <div className="article-container">
          <Link href="/guider" className="back-link"><ArrowLeft /> Alla guider</Link>
          <Link href={`/${guide.category}`} className="article-category">{guide.categoryLabel}</Link>
          <h1>{guide.title}</h1>
          <p>{guide.description}</p>
          <div className="article-meta">
            <span><Clock /> {guide.readingTime} läsning</span>
            <span><ShieldCheck /> Uppdaterad {guide.updated}</span>
          </div>
        </div>
      </header>

      <div className="article-layout article-container">
        <article className="article-content">
          <p className="article-intro">{guide.intro}</p>
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && (
                <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
              )}
            </section>
          ))}
          <aside className="article-cta">
            <span className="kicker">Mitt BoLiv</span>
            <h2>Spara projekt, kostnader och dokument.</h2>
            <p>Samla bostadens historik i en privat digital pärm.</p>
            <Link className="button" href="/skapa-konto">Skapa gratis konto <ArrowRight /></Link>
          </aside>
        </article>
        <aside className="article-sidebar">
          <strong>I den här guiden</strong>
          {guide.sections.map((section) => <span key={section.heading}>{section.heading}</span>)}
          <small>BoLivs guider ger generell information. Kontrollera alltid myndighetskrav och anlita behörig expert när det behövs.</small>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="related-guides">
          <div className="article-container">
            <span className="kicker">Läs vidare</span>
            <h2>Fler guider inom {guide.categoryLabel.toLowerCase()}</h2>
            <div>
              {related.map((item) => (
                <Link href={`/guider/${item.slug}`} key={item.slug}>
                  <strong>{item.title}</strong><ArrowRight />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
