import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { createProperty } from "../../actions";

type SearchParams = Promise<{ error?: string }>;

export const metadata = { title: "Lägg till fastighet" };

export default async function NewPropertyPage({ searchParams }: { searchParams: SearchParams }) {
  const message = await searchParams;

  return (
    <main className="dashboard form-page">
      <Link href="/mitt-boliv" className="back-link"><ArrowLeft /> Till översikten</Link>
      <div className="form-card">
        <div className="auth-icon"><Building2 /></div>
        <span className="kicker">Ny fastighet</span>
        <h1>Berätta om din bostad</h1>
        <p>Du kan komplettera med fler detaljer senare.</p>
        {message.error && <div className="form-message error">{message.error}</div>}
        <form action={createProperty} className="property-form">
          <label>Vad vill du kalla fastigheten?<input name="name" placeholder="Till exempel Huset i Borås" required /></label>
          <div className="form-columns">
            <label>Typ av bostad<select name="propertyType" defaultValue=""><option value="" disabled>Välj typ</option><option>Villa</option><option>Radhus</option><option>Bostadsrätt</option><option>Fritidshus</option><option>Gård</option></select></label>
            <label>Ort<input name="city" placeholder="Borås" /></label>
          </div>
          <div className="form-columns">
            <label>Byggår<input name="constructionYear" type="number" min="1600" max="2200" placeholder="1974" /></label>
            <label>Boarea, m²<input name="livingArea" type="number" min="0" step="0.1" placeholder="165" /></label>
          </div>
          <button className="button" type="submit">Spara fastigheten</button>
        </form>
      </div>
    </main>
  );
}
