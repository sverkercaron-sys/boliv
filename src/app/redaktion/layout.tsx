import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Building2, ExternalLink, FilePlus2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Redaktion" };

export default async function EditorialLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");

  const { data: allowed } = await supabase.rpc("has_editor_role");
  if (!allowed) redirect("/");

  return (
    <div className="editor-shell">
      <aside className="editor-sidebar">
        <Link href="/" className="brand app-brand">Bo<span>Liv</span></Link>
        <small>REDAKTION</small>
        <nav>
          <Link href="/redaktion"><BookOpen /> Artiklar</Link>
          <Link href="/redaktion/ny"><FilePlus2 /> Ny artikel</Link>
          <Link href="/redaktion/partners"><Building2 /> Partnerförfrågningar</Link>
          <Link href="/guider"><ExternalLink /> Visa guider</Link>
        </nav>
      </aside>
      <div className="editor-content">{children}</div>
    </div>
  );
}
