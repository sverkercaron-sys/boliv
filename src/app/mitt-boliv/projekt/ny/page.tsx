import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { createProject } from "../../actions";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ error?: string }>;

export const metadata = { title: "Nytt projekt" };

export default async function NewProjectPage({ searchParams }: { searchParams: SearchParams }) {
  const message = await searchParams;
  const supabase = await createClient();
  const { data: properties } = await supabase.from("properties").select("id,name").order("name");

  return <main className="dashboard form-page">
    <Link href="/mitt-boliv/projekt" className="back-link"><ArrowLeft /> Till projekt</Link>
    <div className="form-card">
      <div className="auth-icon"><FolderKanban /></div>
      <span className="kicker">Nytt projekt</span>
      <h1>Planera nästa förbättring</h1>
      <p>Samla budget, tidsplan och dokument från start.</p>
      {message.error && <div className="form-message error">{message.error}</div>}
      <form action={createProject} className="property-form">
        <label>Projektets namn<input name="name" placeholder="Till exempel Renovera badrummet" required /></label>
        <label>Fastighet<select name="propertyId" required defaultValue=""><option value="" disabled>Välj fastighet</option>{properties?.map((property) => <option value={property.id} key={property.id}>{property.name}</option>)}</select></label>
        <div className="form-columns">
          <label>Typ<select name="projectType" defaultValue="Renovering"><option>Renovering</option><option>Underhåll</option><option>Tillbyggnad</option><option>Installation</option><option>Trädgård</option><option>Annat</option></select></label>
          <label>Budget, kr<input name="budget" type="number" min="0" step="100" placeholder="150000" /></label>
        </div>
        <div className="form-columns">
          <label>Planerad start<input name="plannedStart" type="date" /></label>
          <label>Planerat slut<input name="plannedEnd" type="date" /></label>
        </div>
        <label>Anteckningar<textarea name="notes" rows={5} placeholder="Mål, önskemål och sådant som är viktigt att komma ihåg." /></label>
        <button className="button" type="submit">Skapa projekt</button>
      </form>
    </div>
  </main>;
}
