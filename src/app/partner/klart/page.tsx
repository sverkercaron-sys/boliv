import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Partneravtalet är tecknat" };
type Props = { searchParams: Promise<{ avtal?: string }> };

export default async function PartnerCompletePage({ searchParams }: Props) {
  const { avtal } = await searchParams;
  return <main className="partner-form-page"><div className="partner-form-wrap"><div className="form-card checkout-complete">
    <BadgeCheck /><span className="kicker">Klart</span><h1>Er partnerplats är aktiverad.</h1>
    <p>Avtalet är registrerat och fakturan har skapats och skickats via Fortnox. Fakturan har 30 dagars betalningsvillkor.</p>
    {avtal && <div className="contract-reference"><FileText /><span><small>Avtalsreferens</small><strong>{avtal}</strong></span></div>}
    <Link className="button" href="/hitta-foretag">Se lokala marknader</Link>
  </div></div></main>;
}
