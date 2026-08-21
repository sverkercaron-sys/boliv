import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { login } from "../actions";

type SearchParams = Promise<{ error?: string; success?: string }>;

export const metadata = { title: "Logga in" };

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const message = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="brand auth-brand">Bo<span>Liv</span></Link>
        <div className="auth-icon"><LockKeyhole /></div>
        <h1>Välkommen tillbaka</h1>
        <p>Logga in för att fortsätta till dina fastigheter.</p>

        {message.error && <div className="form-message error">{message.error}</div>}
        {message.success && <div className="form-message success">{message.success}</div>}

        <form action={login} className="auth-form">
          <label>E-postadress<input type="email" name="email" autoComplete="email" required /></label>
          <label>Lösenord<input type="password" name="password" autoComplete="current-password" required /></label>
          <button className="button" type="submit">Logga in <ArrowRight /></button>
        </form>
        <p className="auth-switch">Inget konto ännu? <Link href="/skapa-konto">Skapa Mitt BoLiv gratis</Link></p>
      </div>
    </main>
  );
}
