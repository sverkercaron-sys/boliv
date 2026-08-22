import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createArticle } from "../actions";

type Category = { id: string; name: string };

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.from("taxonomy_terms").select("id,name").eq("term_type", "category").order("sort_order");
  const categories = (data ?? []) as Category[];
  const error = (await searchParams).error;

  return <main className="editor-page editor-form-page">
    <Link href="/redaktion" className="back-link"><ArrowLeft /> Till artiklar</Link>
    <div className="form-card">
      <span className="kicker">Ny guide</span><h1>Skapa artikel</h1>
      <p>Bygg artikeln med upp till tre avsnitt. Den kan sparas som utkast och förhandsvisas innan publicering.</p>
      {error && <div className="form-message error">{error}</div>}
      <form action={createArticle} className="property-form">
        <div className="form-columns">
          <label>Titel<input name="title" required placeholder="Exempel: Bygga altan – regler och kostnad" /></label>
          <label>Webbadress<input name="slug" placeholder="bygg-altan" /><small>Lämna tomt för att skapa automatiskt.</small></label>
        </div>
        <label>Kort beskrivning<textarea name="excerpt" rows={3} required placeholder="Sammanfatta vad läsaren får hjälp med." /></label>
        <div className="form-columns">
          <label>Kategori<select name="categoryId" required defaultValue=""><option value="" disabled>Välj kategori</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          <label>Lästid i minuter<input name="readingTime" type="number" min="1" defaultValue="7" /></label>
        </div>
        <label>Inledning<textarea name="intro" rows={4} placeholder="Inled artikeln med det viktigaste." /></label>
        {[1, 2, 3].map((number) => <fieldset className="editor-section-fields" key={number}>
          <legend>Avsnitt {number}</legend>
          <label>Rubrik<input name={`sectionHeading${number}`} placeholder={number === 1 ? "Det här behöver du veta" : ""} /></label>
          <label>Brödtext<textarea name={`sectionText${number}`} rows={7} placeholder="Separera stycken med en tom rad." /></label>
          <label>Punktlista<textarea name={`sectionBullets${number}`} rows={4} placeholder={"En punkt per rad"} /></label>
        </fieldset>)}
        <div className="form-columns">
          <label>SEO-titel<input name="seoTitle" placeholder="Lämna tomt för artikelns titel" /></label>
          <label>SEO-beskrivning<input name="seoDescription" placeholder="Lämna tomt för den korta beskrivningen" /></label>
        </div>
        <label>Status<select name="status" defaultValue="draft"><option value="draft">Spara som utkast</option><option value="published">Publicera direkt</option></select></label>
        <button className="button" type="submit"><Save /> Spara artikel</button>
      </form>
    </div>
  </main>;
}
