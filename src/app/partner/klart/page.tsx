import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, FileText, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Partneravtalet är tecknat" };
type Props = { searchParams: Promise<{ avtal?: string }> };

export default async function PartnerCompletePage({ searchParams }: Props) {
  const { avtal } = await searchParams;
  return <main className="partner-form-page"><div className="partner-form-wrap"><div className="form-card checkout-complete">
    <BadgeCheck /><span className="kicker">Klart</span><h1>Era partnerplatser är reserverade.</h1>
    <p>Avtalet är registrerat och fakturaunderlaget är skapat. Företagsnamnet visas nu på de valda marknaderna.</p>
    <div className="contract-summary"><Mail /><div><strong>Kontrollera er e-post</strong><span>Vi har skickat en säker aktiveringslänk till adressen som angavs i avtalet. Öppna länken och välj ett lösenord för att komma till företagets backoffice.</span></div></div>
    {avtal && <div className="contract-reference"><FileText /><span><small>Avtalsreferens</small><strong>{avtal}</strong></span></div>}
    <Link className="button" href="/logga-in?next=/partnerkonto">Jag har redan ett BoLiv-konto</Link>
  </div></div></main>;
}
