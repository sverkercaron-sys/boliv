import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Hitta företag för ditt hem", description: "Hitta BoLivs utvalda lokala partnerföretag och kunskap inför ditt projekt." };
type Municipality = { name: string; slug: string; county_name: string };

export default async function FindCompaniesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("municipalities").select("name,slug,county_name").order("name");
  const municipalities = (data ?? []) as Municipality[];
  return <main><section className="category-landing-hero"><div className="container"><span className="kicker">Rätt hjälp nära dig</span><h1>Hitta takläggare i din kommun.</h1><p>Läs på, räkna på projektet och se om BoLiv har en utvald lokal partner.</p></div></section>
    <section className="section container"><div className="section-heading"><div><span className="kicker">Pilotkommuner</span><h2>Välj kommun</h2></div></div><div className="municipality-grid">{municipalities.map((item) => <Link href={`/taklaggare/${item.slug}`} key={item.slug}><MapPin /><span><strong>{item.name}</strong><small>{item.county_name}</small></span><ArrowRight /></Link>)}</div></section>
  </main>;
}
