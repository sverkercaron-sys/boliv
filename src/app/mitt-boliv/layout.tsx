import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, CalendarDays, FileText, FolderKanban, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logout } from "@/app/(auth)/actions";

export default async function MittBoLivLayout({ children }: { children: React.ReactNode }) {
  let displayName = "Demoläge";

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/logga-in");
    displayName = user.user_metadata.display_name || user.email || "Mitt BoLiv";
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/" className="brand app-brand">Bo<span>Liv</span></Link>
        <div className="app-user"><span>{displayName.slice(0, 1).toUpperCase()}</span><div><small>Inloggad som</small><strong>{displayName}</strong></div></div>
        <nav>
          <Link href="/mitt-boliv"><LayoutDashboard /> Översikt</Link>
          <Link href="/mitt-boliv/fastigheter"><Building2 /> Fastigheter</Link>
          <Link href="/mitt-boliv/underhall"><CalendarDays /> Underhåll</Link>
          <Link href="/mitt-boliv/projekt"><FolderKanban /> Projekt</Link>
          <Link href="/mitt-boliv/dokument"><FileText /> Dokument</Link>
        </nav>
        <form action={logout}><button type="submit"><LogOut /> Logga ut</button></form>
      </aside>
      <div className="app-content">
        <header className="app-topbar"><Link href="/">Till BoLivs guider</Link><Link className="button button-small" href="/mitt-boliv/fastigheter/ny">Lägg till fastighet</Link></header>
        {children}
      </div>
    </div>
  );
}
