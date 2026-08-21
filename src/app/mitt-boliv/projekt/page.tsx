import { FolderKanban } from "lucide-react";

export const metadata = { title: "Projekt" };

export default function ProjectsPage() {
  return <main className="dashboard"><div className="dashboard-heading"><div><span className="kicker">Mitt BoLiv</span><h1>Projekt</h1><p>Planera renoveringar och följ budget, dokument och framsteg.</p></div></div><div className="panel-empty large"><FolderKanban /><h2>Samla nästa renovering här</h2><p>Projektflödet för budget, checklista, offerter och bilder är förberett.</p></div></main>;
}
