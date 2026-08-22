import Link from "next/link";
import { ArrowRight, FolderKanban, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Project = { id: string; name: string; project_type: string | null; status: string; budget_amount: number | null; planned_start: string | null; properties: { name: string } | null };

export const metadata = { title: "Projekt" };

const statusLabels: Record<string, string> = { idea: "Idé", planned: "Planerat", in_progress: "Pågår", paused: "Pausat", completed: "Klart", cancelled: "Avslutat" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id,name,project_type,status,budget_amount,planned_start,properties(name)").order("created_at", { ascending: false });
  const projects = (data ?? []) as unknown as Project[];

  return <main className="dashboard">
    <div className="dashboard-heading"><div><span className="kicker">Mitt BoLiv</span><h1>Projekt</h1><p>Planera renoveringar och följ budget, dokument och framsteg.</p></div><Link href="/mitt-boliv/projekt/ny" className="button"><Plus /> Nytt projekt</Link></div>
    {projects.length ? <div className="project-list">{projects.map((project) => <Link href={`/mitt-boliv/projekt/${project.id}`} className="project-list-item" key={project.id}>
      <span className="project-list-icon"><FolderKanban /></span>
      <span><small>{project.project_type ?? "Projekt"} · {project.properties?.name ?? "Fastighet"}</small><strong>{project.name}</strong><em>{statusLabels[project.status] ?? project.status}</em></span>
      <span className="project-budget"><small>Budget</small><strong>{project.budget_amount ? `${Number(project.budget_amount).toLocaleString("sv-SE")} kr` : "Ej satt"}</strong></span>
      <ArrowRight />
    </Link>)}</div> : <div className="panel-empty large"><FolderKanban /><h2>Samla nästa renovering här</h2><p>Planera budget, tidslinje och dokument från första idé till färdigt resultat.</p><Link href="/mitt-boliv/projekt/ny" className="button">Skapa första projektet</Link></div>}
  </main>;
}
