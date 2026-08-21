import Link from "next/link";
import { ArrowRight, Check, Home } from "lucide-react";
import { signup } from "../actions";

type SearchParams = Promise<{ error?: string }>;

export const metadata = { title: "Skapa Mitt BoLiv" };

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const message = await searchParams;

  return (
    <main className="auth-page signup-page">
      <div className="signup-benefits">
        <span className="kicker kicker-light">Mitt BoLiv</span>
        <h1>Få ordning på allt som hör till ditt hem.</h1>
        <ul>
          <li><Check /> Lägg till en eller flera fastigheter</li>
          <li><Check /> Planera underhåll och renoveringar</li>
          <li><Check /> Samla kvitton, garantier och dokument</li>
          <li><Check /> Bygg upp en värdefull historik</li>
        </ul>
      </div>
      <div className="auth-card">
        <Link href="/" className="brand auth-brand">Bo<span>Liv</span></Link>
        <div className="auth-icon"><Home /></div>
        <h2>Skapa ditt konto</h2>
        <p>Det är gratis att komma igång.</p>

        {message.error && <div className="form-message error">{message.error}</div>}

        <form action={signup} className="auth-form">
          <label>Namn<input name="displayName" autoComplete="name" required /></label>
          <label>E-postadress<input type="email" name="email" autoComplete="email" required /></label>
          <label>Lösenord<input type="password" name="password" autoComplete="new-password" minLength={8} required /><small>Minst 8 tecken</small></label>
          <label className="checkbox-label"><input type="checkbox" name="consent" required /><span>Jag godkänner BoLivs användarvillkor och integritetspolicy.</span></label>
          <button className="button" type="submit">Skapa Mitt BoLiv <ArrowRight /></button>
        </form>
        <p className="auth-switch">Har du redan ett konto? <Link href="/logga-in">Logga in</Link></p>
      </div>
    </main>
  );
}
