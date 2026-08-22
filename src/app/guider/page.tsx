import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { categoryLabels, guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Guider för hus och hem",
  description: "Praktiska och oberoende guider om att bygga, renovera, underhålla, köpa och finansiera en bostad.",
};

export default function GuidesPage() {
  return (
    <main>
      <section className="guide-archive-hero">
        <div className="container">
          <span className="kicker">BoLiv Guider</span>
          <h1>Kunskap för hela livet med din bostad.</h1>
          <p>Konkreta svar, checklistor och beslutsstöd för svenska hus och hem.</p>
          <form className="search-box" action="/sok">
            <Search aria-hidden="true" />
            <input name="q" aria-label="Sök bland guider" placeholder="Sök efter till exempel tak, badrum eller värmepump" />
            <button type="submit">Sök</button>
          </form>
        </div>
      </section>

      <section className="section container">
        <div className="guide-category-links">
          {Object.entries(categoryLabels).map(([slug, label]) => (
            <Link href={`/${slug}`} key={slug}>{label}</Link>
          ))}
        </div>
        <div className="section-heading">
          <div><span className="kicker">Senast uppdaterat</span><h2>Alla guider</h2></div>
          <span className="guide-count">{guides.length} guider</span>
        </div>
        <div className="guide-library-grid">
          {guides.map((guide) => (
            <article className="library-card" key={guide.slug}>
              <Link href={`/guider/${guide.slug}`}>
                <span className="library-icon"><BookOpen /></span>
                <small>{guide.categoryLabel} · {guide.readingTime}</small>
                <h2>{guide.title}</h2>
                <p>{guide.description}</p>
                <span className="read-link">Läs guiden <ArrowRight /></span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
