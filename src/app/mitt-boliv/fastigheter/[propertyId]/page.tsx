import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, FileText, FolderKanban, Home, Plus, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createMaintenanceTask } from "../../actions";

type Params = Promise<{ propertyId: string }>;

export default async function PropertyPage({ params }: { params: Params }) {
  const { propertyId } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="dashboard">
        <Link href="/mitt-boliv" className="back-link"><ArrowLeft /> Till översikten</Link>
        <div className="panel-empty large"><Home /><h1>Fastighetsvyn är redo</h1><p>När Supabase har anslutits kan fastighetens underhåll, projekt och dokument sparas här.</p><Link href="/mitt-boliv/fastigheter/ny" className="button">Visa formuläret</Link></div>
      </main>
    );
  }

  const supabase = await createClient();
  const [{ data: property }, { data: tasks }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", propertyId).single(),
    supabase.from("maintenance_tasks").select("*").eq("property_id", propertyId).order("due_date"),
  ]);

  if (!property) notFound();

  return (
    <main className="dashboard">
      <Link href="/mitt-boliv/fastigheter" className="back-link"><ArrowLeft /> Mina fastigheter</Link>
      <div className="property-hero">
        <div className="property-hero-icon"><Home /></div>
        <div><span className="kicker">{property.property_type ?? "Fastighet"}</span><h1>{property.name}</h1><p>{[property.city, property.construction_year && `Byggd ${property.construction_year}`, property.living_area_m2 && `${property.living_area_m2} m²`].filter(Boolean).join(" · ")}</p></div>
      </div>

      <div className="property-summary-grid">
        <article><CalendarCheck /><strong>{tasks?.filter((task) => task.status !== "completed").length ?? 0}</strong><span>Kommande underhåll</span></article>
        <article><FolderKanban /><strong>0</strong><span>Aktiva projekt</span></article>
        <article><FileText /><strong>0</strong><span>Dokument</span></article>
        <article><Wrench /><strong>0 kr</strong><span>Planerad kostnad</span></article>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-heading"><h2>Underhållsplan</h2></div>
          {tasks?.map((task) => <div className="task-row" key={task.id}><span className="task-check" /><span><strong>{task.title}</strong><small>{task.due_date ?? "Datum saknas"}</small></span></div>)}
          {!tasks?.length && <div className="panel-empty compact"><CalendarCheck /><h3>Planen är tom</h3><p>Lägg till den första uppgiften nedan.</p></div>}
          <form action={createMaintenanceTask} className="quick-task-form">
            <input type="hidden" name="propertyId" value={property.id} />
            <input name="title" placeholder="Till exempel kontrollera taket" required />
            <input name="dueDate" type="date" />
            <button className="button button-small" type="submit"><Plus /> Lägg till</button>
          </form>
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading"><h2>Fastighetsuppgifter</h2></div>
          <dl className="property-facts">
            <div><dt>Typ</dt><dd>{property.property_type ?? "Ej angivet"}</dd></div>
            <div><dt>Byggår</dt><dd>{property.construction_year ?? "Ej angivet"}</dd></div>
            <div><dt>Boarea</dt><dd>{property.living_area_m2 ? `${property.living_area_m2} m²` : "Ej angivet"}</dd></div>
            <div><dt>Ort</dt><dd>{property.city ?? "Ej angivet"}</dd></div>
          </dl>
        </section>
      </div>
    </main>
  );
}
