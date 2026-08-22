import Link from "next/link";
import { ArrowRight, Building2, CalendarCheck, FileText, FolderKanban, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Property = { id: string; name: string; city: string | null; property_type: string | null };
type Task = { id: string; title: string; due_date: string | null; property_id: string };

export const metadata = { title: "Mitt BoLiv" };

export default async function DashboardPage() {
  let properties: Property[] = [];
  let tasks: Task[] = [];
  let activeProjects = 0;
  let documents = 0;
  const configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createClient();
    const [propertyResult, taskResult, projectResult, documentResult] = await Promise.all([
      supabase.from("properties").select("id,name,city,property_type").order("created_at"),
      supabase.from("maintenance_tasks").select("id,title,due_date,property_id").neq("status", "completed").order("due_date").limit(5),
      supabase.from("projects").select("id", { count: "exact", head: true }).neq("status", "completed"),
      supabase.from("documents").select("id", { count: "exact", head: true }),
    ]);
    properties = propertyResult.data ?? [];
    tasks = taskResult.data ?? [];
    activeProjects = projectResult.count ?? 0;
    documents = documentResult.count ?? 0;
  }

  return (
    <main className="dashboard">
      {!configured && (
        <div className="setup-banner"><strong>Demoläge</strong><span>Gränssnittet är klart. Anslut Supabase för att spara riktiga uppgifter.</span></div>
      )}

      <div className="dashboard-heading">
        <div><span className="kicker">Mitt BoLiv</span><h1>Din bostad. Samlad och under kontroll.</h1></div>
        <Link href="/mitt-boliv/fastigheter/ny" className="button"><Plus /> Lägg till fastighet</Link>
      </div>

      <div className="dashboard-stats">
        <div><Building2 /><span><strong>{properties.length}</strong><small>Fastigheter</small></span></div>
        <div><CalendarCheck /><span><strong>{tasks.length}</strong><small>Kommande uppgifter</small></span></div>
        <div><FolderKanban /><span><strong>{activeProjects}</strong><small>Aktiva projekt</small></span></div>
        <div><FileText /><span><strong>{documents}</strong><small>Dokument</small></span></div>
      </div>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-heading"><h2>Mina fastigheter</h2><Link href="/mitt-boliv/fastigheter">Visa alla</Link></div>
          {properties.length ? properties.map((property) => (
            <Link className="property-row" href={`/mitt-boliv/fastigheter/${property.id}`} key={property.id}>
              <span className="property-icon"><Building2 /></span>
              <span><strong>{property.name}</strong><small>{[property.property_type, property.city].filter(Boolean).join(" · ")}</small></span>
              <ArrowRight />
            </Link>
          )) : (
            <div className="panel-empty"><Building2 /><h3>Lägg till din första fastighet</h3><p>Samla underhåll, projekt och dokument på ett ställe.</p><Link className="button button-small" href="/mitt-boliv/fastigheter/ny">Kom igång</Link></div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading"><h2>Nästa att göra</h2><Link href="/mitt-boliv/underhall">Underhållsplan</Link></div>
          {tasks.length ? tasks.map((task) => (
            <div className="task-row" key={task.id}>
              <span className="task-check" />
              <span><strong>{task.title}</strong><small>{task.due_date ?? "Inget datum"}</small></span>
            </div>
          )) : (
            <div className="panel-empty compact"><CalendarCheck /><h3>Inga uppgifter ännu</h3><p>Dina kommande underhållsåtgärder visas här.</p></div>
          )}
        </div>
      </section>

      <section className="getting-started">
        <span className="kicker">Kom igång</span><h2>Tre steg till bättre koll</h2>
        <div>
          <article><b>1</b><h3>Lägg till bostaden</h3><p>Fyll i grunduppgifterna om huset eller lägenheten.</p></article>
          <article><b>2</b><h3>Skapa underhållsplan</h3><p>BoLiv hjälper dig att lägga rätt saker i kalendern.</p></article>
          <article><b>3</b><h3>Samla historiken</h3><p>Spara projekt, kvitton, garantier och viktiga dokument.</p></article>
        </div>
      </section>
    </main>
  );
}
