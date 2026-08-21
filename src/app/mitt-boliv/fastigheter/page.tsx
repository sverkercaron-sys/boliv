import Link from "next/link";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Property = { id: string; name: string; city: string | null; property_type: string | null; construction_year: number | null };

export const metadata = { title: "Mina fastigheter" };

export default async function PropertiesPage() {
  let properties: Property[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const result = await supabase.from("properties").select("id,name,city,property_type,construction_year").order("created_at");
    properties = result.data ?? [];
  }

  return (
    <main className="dashboard">
      <div className="dashboard-heading"><div><span className="kicker">Mitt BoLiv</span><h1>Mina fastigheter</h1><p>Hantera en eller flera bostäder på samma konto.</p></div><Link href="/mitt-boliv/fastigheter/ny" className="button"><Plus /> Lägg till fastighet</Link></div>
      <div className="property-card-grid">
        {properties.map((property) => (
          <Link href={`/mitt-boliv/fastigheter/${property.id}`} className="property-card" key={property.id}>
            <div className="property-card-visual"><Building2 /></div>
            <div><small>{property.property_type ?? "Fastighet"}</small><h2>{property.name}</h2><p>{[property.city, property.construction_year && `Byggd ${property.construction_year}`].filter(Boolean).join(" · ")}</p><span className="read-link">Öppna fastigheten <ArrowRight /></span></div>
          </Link>
        ))}
        {!properties.length && <div className="panel-empty large"><Building2 /><h2>Här kommer dina fastigheter att visas</h2><p>Lägg till den första bostaden för att börja planera och dokumentera.</p><Link href="/mitt-boliv/fastigheter/ny" className="button">Lägg till fastighet</Link></div>}
      </div>
    </main>
  );
}
