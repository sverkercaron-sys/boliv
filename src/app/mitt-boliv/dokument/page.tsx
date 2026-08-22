import Link from "next/link";
import { Download, FileText, FileUp, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ success?: string }>;
type Document = { id: string; title: string; document_type: string | null; storage_path: string; mime_type: string | null; document_date: string | null; created_at: string; properties: { name: string } | null };

export const metadata = { title: "Dokument" };

export default async function DocumentsPage({ searchParams }: { searchParams: SearchParams }) {
  const message = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("documents").select("id,title,document_type,storage_path,mime_type,document_date,created_at,properties(name)").order("created_at", { ascending: false });
  const documents = (data ?? []) as unknown as Document[];

  const signedDocuments = await Promise.all(documents.map(async (document) => {
    const { data: signed } = await supabase.storage.from("property-documents").createSignedUrl(document.storage_path, 300);
    return { ...document, downloadUrl: signed?.signedUrl ?? null };
  }));

  return <main className="dashboard">
    <div className="dashboard-heading"><div><span className="kicker">Mitt BoLiv</span><h1>Dokument</h1><p>Kvitton, garantier, avtal och protokoll på ett tryggt ställe.</p></div><Link href="/mitt-boliv/dokument/ny" className="button"><Plus /> Ladda upp</Link></div>
    {message.success && <div className="form-message success">{message.success}</div>}
    {signedDocuments.length ? <div className="document-list">{signedDocuments.map((document) => <article className="document-row" key={document.id}>
      <span className="document-icon"><FileText /></span>
      <span><small>{document.document_type ?? "Dokument"} · {document.properties?.name ?? "Fastighet"}</small><strong>{document.title}</strong><em>{document.document_date ?? new Date(document.created_at).toLocaleDateString("sv-SE")}</em></span>
      {document.downloadUrl && <a href={document.downloadUrl} target="_blank" rel="noreferrer" className="download-link"><Download /> Öppna</a>}
    </article>)}</div> : <div className="panel-empty large"><FileUp /><h2>Ditt privata dokumentarkiv</h2><p>Samla kvitton, garantier, offerter och andra viktiga handlingar.</p><Link href="/mitt-boliv/dokument/ny" className="button">Ladda upp första dokumentet</Link></div>}
  </main>;
}
