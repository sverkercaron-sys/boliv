import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, FolderKanban, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ projectId: string }>;
type Project = { id: string; name: string; project_type: string | null; status: string; budget_amount: number | null; actual_amount: number | null; planned_start: string | null; planned_end: string | null; notes: string | null; properties: { name: string } | null };
type Document = { id: string; title: string; document_type: string | null };

const statusLabels: Record<string, string> = { idea: "Idé", planned: "Planerat", in_progress: "Pågår", paused: "Pausat", completed: "Klart", cancelled: "Avslutat" };

export default async function ProjectPage({ params }: { params: Params }) {
  const { projectId } = await params;
  const supabase = await createClient();
  const [{ data: rawProject }, { data: rawDocuments }] = await Promise.all([
    supabase.from("projects").select("*,properties(name)").eq("id", projectId).single(),
    supabase.from("documents").select("id,title,document_type").eq("project_id", projectId).order("created_at", { ascending: false }),
  ]);
  if (!rawProject) notFound();
  const project = rawProject as unknown as Project;
  const documents = (rawDocuments ?? []) as Document[];

  return <main className="dashboard">
    <Link href="/mitt-boliv/projekt" className="back-link"><ArrowLeft /> Alla projekt</Link>
    <div className="property-hero"><div className="property-hero-icon"><FolderKanban /></div><div><span className="kicker">{project.project_type ?? "Projekt"} · {project.properties?.name}</span><h1>{project.name}</h1><p><span className="status-pill">{statusLabels[project.status] ?? project.status}</span></p></div></div>
    <div className="property-summary-grid">
      <article><Wallet /><strong>{project.budget_amount ? `${Number(project.budget_amount).toLocaleString("sv-SE")} kr` : "Ej satt"}</strong><span>Budget</span></article>
      <article><Wallet /><strong>{project.actual_amount ? `${Number(project.actual_amount).toLocaleString("sv-SE")} kr` : "0 kr"}</strong><span>Utfall</span></article>
      <article><CalendarDays /><strong>{project.planned_start ?? "Ej satt"}</strong><span>Planerad start</span></article>
      <article><FileText /><strong>{documents.length}</strong><span>Dokument</span></article>
    </div>
    <div className="dashboard-grid">
      <section className="dashboard-panel"><div className="panel-heading"><h2>Projektanteckningar</h2></div><p className="project-notes">{project.notes || "Inga anteckningar ännu."}</p><dl className="property-facts"><div><dt>Start</dt><dd>{project.planned_start ?? "Ej satt"}</dd></div><div><dt>Slut</dt><dd>{project.planned_end ?? "Ej satt"}</dd></div></dl></section>
      <section className="dashboard-panel"><div className="panel-heading"><h2>Dokument</h2><Link href="/mitt-boliv/dokument/ny">Ladda upp</Link></div>{documents.length ? documents.map((document) => <div className="task-row" key={document.id}><FileText /><span><strong>{document.title}</strong><small>{document.document_type ?? "Dokument"}</small></span></div>) : <div className="panel-empty compact"><FileText /><h3>Inga dokument ännu</h3><p>Koppla offerter, avtal och kvitton till projektet.</p></div>}</section>
    </div>
  </main>;
}
