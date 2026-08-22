import Link from "next/link";
import { ArrowLeft, FileUp } from "lucide-react";
import { uploadDocument } from "../../actions";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ error?: string }>;

export const metadata = { title: "Ladda upp dokument" };

export default async function NewDocumentPage({ searchParams }: { searchParams: SearchParams }) {
  const message = await searchParams;
  const supabase = await createClient();
  const [{ data: properties }, { data: projects }] = await Promise.all([
    supabase.from("properties").select("id,name").order("name"),
    supabase.from("projects").select("id,name,property_id").order("name"),
  ]);

  return <main className="dashboard form-page">
    <Link href="/mitt-boliv/dokument" className="back-link"><ArrowLeft /> Till dokument</Link>
    <div className="form-card">
      <div className="auth-icon"><FileUp /></div>
      <span className="kicker">Nytt dokument</span>
      <h1>Spara en viktig handling</h1>
      <p>PDF, JPG, PNG, WebP eller textfil. Högst 10 MB.</p>
      {message.error && <div className="form-message error">{message.error}</div>}
      <form action={uploadDocument} className="property-form">
        <label>Titel<input name="title" placeholder="Till exempel Garanti bergvärmepump" required /></label>
        <div className="form-columns">
          <label>Typ<select name="documentType" defaultValue="Kvitto"><option>Kvitto</option><option>Garanti</option><option>Offert</option><option>Avtal</option><option>Faktura</option><option>Besiktningsprotokoll</option><option>Ritning</option><option>Försäkring</option><option>Annat</option></select></label>
          <label>Datum<input name="documentDate" type="date" /></label>
        </div>
        <label>Fastighet<select name="propertyId" required defaultValue=""><option value="" disabled>Välj fastighet</option>{properties?.map((property) => <option value={property.id} key={property.id}>{property.name}</option>)}</select></label>
        <label>Projekt, valfritt<select name="projectId" defaultValue=""><option value="">Inget projekt</option>{projects?.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label>
        <label className="file-drop">Välj fil<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt" required /><span>Filen lagras privat och kan bara nås från ditt konto.</span></label>
        <button className="button" type="submit">Ladda upp dokument</button>
      </form>
    </div>
  </main>;
}
