import { CalendarCheck } from "lucide-react";

export const metadata = { title: "Underhåll" };

export default function MaintenancePage() {
  return <main className="dashboard"><div className="dashboard-heading"><div><span className="kicker">Mitt BoLiv</span><h1>Underhåll</h1><p>Alla fastigheters kommande och genomförda åtgärder.</p></div></div><div className="panel-empty large"><CalendarCheck /><h2>Din årskalender byggs här</h2><p>När du har lagt till en fastighet kan BoLiv föreslå relevanta åtgärder och intervall.</p></div></main>;
}
