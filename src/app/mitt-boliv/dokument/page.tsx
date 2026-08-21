import { FileText } from "lucide-react";

export const metadata = { title: "Dokument" };

export default function DocumentsPage() {
  return <main className="dashboard"><div className="dashboard-heading"><div><span className="kicker">Mitt BoLiv</span><h1>Dokument</h1><p>Kvitton, garantier, avtal och protokoll på ett tryggt ställe.</p></div></div><div className="panel-empty large"><FileText /><h2>Ditt privata dokumentarkiv</h2><p>Filerna lagras privat när Supabase Storage har anslutits.</p></div></main>;
}
