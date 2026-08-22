import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Sök bland BoLivs guider",
  description: "Sök efter guider och råd om hus, hem, renovering, underhåll och bostadsekonomi.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const query = ((await searchParams).q ?? "").trim();
  const normalized = query.toLocaleLowerCase("sv");
  const results = query
    ? guides.filter((guide) =>
        [guide.title, guide.description, guide.categoryLabel, guide.intro]
          .join(" ")
          .toLocaleLowerCase("sv")
          .includes(normalized)
      )
    : [];

  return (
    <main>
      <section className="search-page-hero">
        <div className="container">
          <span className="kicker">Sök på BoLiv</span>
          <h1>Vad vill du veta om ditt boende?</h1>
          <form className="search-box" action="/sok">
            <Search aria-hidden="true" />
            <input name="q" defaultValue={query} aria-label="Sök bland guider" placeholder="Tak, badrum, visning..." autoFocus />
            <button type="submit">Sök</button>
          </form>
        </div>
      </section>
      <section className="section container search-results">
        {query ? (
          <>
            <div className="section-heading">
              <div><span className="kicker">Sökresultat</span><h2>{results.length ? `${results.length} träffar för ”${query}”` : `Inga träffar för ”${query}”`}</h2></div>
            </div>
            {results.length ? (
              <div className="search-result-list">
                {results.map((guide) => (
                  <Link href={`/guider/${guide.slug}`} key={guide.slug}>
                    <small>{guide.categoryLabel} · {guide.readingTime}</small>
                    <strong>{guide.title}</strong>
                    <p>{guide.description}</p>
                    <ArrowRight />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="search-empty">
                <Search />
                <h3>Prova ett annat sökord</h3>
                <p>Sök exempelvis efter tak, badrum, underhåll, värmepump eller budget.</p>
                <Link href="/guider" className="button">Visa alla guider</Link>
              </div>
            )}
          </>
        ) : (
          <div className="search-empty">
            <Search />
            <h2>Skriv vad du behöver hjälp med</h2>
            <p>Vi söker bland BoLivs guider och checklistor.</p>
          </div>
        )}
      </section>
    </main>
  );
}
