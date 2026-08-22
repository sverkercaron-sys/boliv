import Link from "next/link";
import { BookOpen, FilePlus2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { setArticleStatus } from "./actions";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  updated_at: string;
  taxonomy_terms: { name: string } | null;
};

export default async function EditorialPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select("id,title,slug,status,updated_at,taxonomy_terms:primary_category_id(name)")
    .order("updated_at", { ascending: false });

  const articles = (data ?? []) as unknown as Article[];
  const success = (await searchParams).success;

  return (
    <main className="editor-page">
      <div className="dashboard-heading">
        <div><span className="kicker">BoLiv Redaktion</span><h1>Artiklar</h1><p>Skapa, granska och publicera guider.</p></div>
        <Link href="/redaktion/ny" className="button"><FilePlus2 /> Ny artikel</Link>
      </div>
      {success && <div className="form-message success">{success}</div>}
      {articles.length ? (
        <div className="editor-list">
          {articles.map((article) => (
            <article key={article.id}>
              <span className="library-icon"><BookOpen /></span>
              <div>
                <small>{article.taxonomy_terms?.name ?? "Okategoriserad"}</small>
                <strong>{article.title}</strong>
                <em>/guider/{article.slug}</em>
              </div>
              <span className={`status-pill ${article.status}`}>{article.status === "published" ? "Publicerad" : "Utkast"}</span>
              <form action={setArticleStatus}>
                <input type="hidden" name="id" value={article.id} />
                <input type="hidden" name="status" value={article.status === "published" ? "draft" : "published"} />
                <button type="submit">{article.status === "published" ? "Avpublicera" : "Publicera"}</button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel-empty large"><BookOpen /><h2>Inga databasartiklar ännu</h2><p>De befintliga guiderna fortsätter visas. Skapa nästa guide här.</p><Link className="button" href="/redaktion/ny">Skapa artikel</Link></div>
      )}
    </main>
  );
}
