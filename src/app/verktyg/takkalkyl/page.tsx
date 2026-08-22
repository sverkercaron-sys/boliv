import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calculator } from "lucide-react";
import { RoofCalculator } from "@/components/roof-calculator";

export const metadata: Metadata = {
  title: "Takkalkyl – uppskatta kostnaden för takbyte",
  description: "Gör en första uppskattning av kostnaden för takbyte utifrån takyta, material och komplexitet.",
  alternates: { canonical: "/verktyg/takkalkyl" },
};

export default function RoofCalculatorPage() {
  return <main>
    <section className="calculator-hero"><div className="article-container"><Link href="/renovera/tak" className="back-link"><ArrowLeft /> Alla takguider</Link><span className="kicker">BoLiv Verktyg</span><h1><Calculator /> Takkalkyl</h1><p>Få ett första kostnadsintervall innan du börjar jämföra offerter.</p></div></section>
    <section className="section article-container"><RoofCalculator /><div className="calculator-next"><h2>Gå vidare med bättre underlag</h2><p>Kalkylen är en uppskattning, inte en offert. Läs kostnadsguiden och kontrollera vad entreprenörerna faktiskt inkluderar.</p><Link className="button" href="/guider/kostnad-byta-tak">Läs kostnadsguiden <ArrowRight /></Link></div></section>
  </main>;
}
