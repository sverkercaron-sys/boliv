import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Section = { heading?: string; paragraphs?: string[]; bullets?: string[] };
type Article = {
  id: string; title: string; excerpt: string | null; body: { intro?: string; sections?: Section[] } | null;
  reading_time_minutes: number; updated_at: string; taxonomy_terms: { name: string } | null;
};
type Props = { params: Promise<{ id: string }> };

export default async function PreviewArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("content_items").select("id,title,excerpt,body,reading_time_minutes,updated_at,taxonomy_terms:primary_category_id(name)").eq("id", id).single();
  if (!data) notFound();
  const article = data as unknown as Article;
  const updated = new Intl.DateTimeFormat("sv-SE", { dateStyle: "long" }).format(new Date(article.updated_at));

  return <main className="editor-preview">
    <div className="preview-banner"><Eye /> Förhandsvisning – sidan är bara synlig för redaktionen <Link href={`/redaktion/${id}`}><ArrowLeft /> Fortsätt redigera</Link></div>
    <header className="article-hero"><div className="article-container">
      <span className="article-category">{article.taxonomy_terms?.name ?? "Guide"}</span>
      <h1>{article.title}</h1><p>{article.excerpt}</p>
      <div className="article-meta"><span><Clock /> {article.reading_time_minutes} min läsning</span><span><ShieldCheck /> Uppdaterad {updated}</span></div>
    </div></header>
    <div className="article-layout article-container"><article className="article-content">
      <p className="article-intro">{article.body?.intro}</p>
      {(article.body?.sections ?? []).map((section, index) => <section key={index}><h2>{section.heading}</h2>{(section.paragraphs ?? []).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{!!section.bullets?.length && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}
    </article></div>
  </main>;
}
