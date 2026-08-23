import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Partneravtalet är tecknat" };
type Props = { searchParams: Promise<{ avtal?: string }> };

export default async function PartnerCompletePage({ searchParams }: Props) {
  const { avtal } = await searchParams;
  return <main className="partner-form-page"><div className="partner-form-wrap"><div className="form-card checkout-complete">
    <BadgeCheck /><span className="kicker">Klart</span><h1>Era partnerplatser är sålda och reserverade.</h1>
    <p>Avtalet är registrerat och en samlad faktura har skickats via Fortnox. Företagsnamnet visas nu på de valda marknaderna. Företagssidan publiceras automatiskt när betalningen registreras.</p>
    {avtal && <div className="contract-reference"><FileText /><span><small>Avtalsreferens</small><strong>{avtal}</strong></span></div>}
    <Link className="button" href="/partnerkonto">Öppna ert backoffice</Link>
  </div></div></main>;
}
