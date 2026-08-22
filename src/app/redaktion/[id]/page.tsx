import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, Eye, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateArticle } from "../actions";
import { DeleteArticleButton } from "@/components/delete-article-button";

type Section = { heading?: string; paragraphs?: string[]; bullets?: string[] };
type Article = {
  id: string; title: string; slug: string; excerpt: string | null;
  body: { intro?: string; sections?: Section[] } | null;
  primary_category_id: string | null; seo_title: string | null; seo_description: string | null;
  reading_time_minutes: number; status: "draft" | "published";
};
type Category = { id: string; name: string };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function EditArticlePage({ params, searchParams }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: categoryData }] = await Promise.all([
    supabase.from("content_items").select("id,title,slug,excerpt,body,primary_category_id,seo_title,seo_description,reading_time_minutes,status").eq("id", id).single(),
    supabase.from("taxonomy_terms").select("id,name").eq("term_type", "category").order("sort_order"),
  ]);
  if (!data) notFound();
  const article = data as unknown as Article;
  const categories = (categoryData ?? []) as Category[];
  const sections = article.body?.sections ?? [];
  const error = (await searchParams).error;

  return <main className="editor-page editor-form-page">
    <div className="editor-form-tools">
      <Link href="/redaktion" className="back-link"><ArrowLeft /> Till artiklar</Link>
      <Link href={`/redaktion/${id}/forhandsvisa`} className="preview-link"><Eye /> Förhandsvisa</Link>
    </div>
    <div className="form-card">
      <span className="kicker">Redigera guide</span><h1>{article.title}</h1>
      {error && <div className="form-message error">{error}</div>}
      <form action={updateArticle} className="property-form">
        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="oldSlug" value={article.slug} />
        <div className="form-columns">
          <label>Titel<input name="title" required defaultValue={article.title} /></label>
          <label>Webbadress<input name="slug" required defaultValue={article.slug} /></label>
        </div>
        <label>Kort beskrivning<textarea name="excerpt" rows={3} required defaultValue={article.excerpt ?? ""} /></label>
        <div className="form-columns">
          <label>Kategori<select name="categoryId" required defaultValue={article.primary_category_id ?? ""}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          <label>Lästid i minuter<input name="readingTime" type="number" min="1" defaultValue={article.reading_time_minutes} /></label>
        </div>
        <label>Inledning<textarea name="intro" rows={4} defaultValue={article.body?.intro ?? ""} /></label>
        {[0, 1, 2].map((index) => {
          const section = sections[index];
          return <fieldset className="editor-section-fields" key={index}>
            <legend>Avsnitt {index + 1}</legend>
            <label>Rubrik<input name={`sectionHeading${index + 1}`} defaultValue={section?.heading ?? ""} /></label>
            <label>Brödtext<textarea name={`sectionText${index + 1}`} rows={7} defaultValue={(section?.paragraphs ?? []).join("\n\n")} /><small>Separera stycken med en tom rad.</small></label>
            <label>Punktlista<textarea name={`sectionBullets${index + 1}`} rows={4} defaultValue={(section?.bullets ?? []).join("\n")} /><small>En punkt per rad.</small></label>
          </fieldset>;
        })}
        <div className="form-columns">
          <label>SEO-titel<input name="seoTitle" defaultValue={article.seo_title ?? ""} /></label>
          <label>SEO-beskrivning<input name="seoDescription" defaultValue={article.seo_description ?? ""} /></label>
        </div>
        <label>Status<select name="status" defaultValue={article.status}><option value="draft">Utkast</option><option value="published">Publicerad</option></select></label>
        <button className="button" type="submit"><Save /> Spara ändringar</button>
      </form>
      <form action={deleteArticle} className="danger-zone">
        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="slug" value={article.slug} />
        <div><strong>Radera artikel</strong><small>Åtgärden kan inte ångras.</small></div>
        <button type="submit"><Trash2 /> Radera</button>
      </form>
    </div>
  </main>;
}
