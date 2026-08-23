import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { activatePartnerAccount } from "./actions";

type Props = { searchParams: Promise<{ error?: string }> };
export const metadata = { title: "Aktivera partnerkonto" };

export default async function ActivatePartnerAccount({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in?next=/partnerkonto/aktivera&error=Öppna+aktiveringslänken+i+e-postmeddelandet");

  return <main className="auth-page"><div className="auth-card">
    <Link href="/" className="brand auth-brand">Bo<span>Liv</span></Link>
    <div className="auth-icon"><KeyRound /></div>
    <h1>Välj ett lösenord</h1>
    <p>Aktivera företagets partnerkonto. Därefter kommer ni direkt till ert backoffice.</p>
    {params.error && <div className="form-message error">{params.error}</div>}
    <form action={activatePartnerAccount} className="auth-form">
      <label>Nytt lösenord<input type="password" name="password" autoComplete="new-password" minLength={8} required /><small>Minst 8 tecken</small></label>
      <label>Upprepa lösenordet<input type="password" name="confirmation" autoComplete="new-password" minLength={8} required /></label>
      <button className="button" type="submit">Aktivera partnerkontot <ArrowRight /></button>
    </form>
  </div></main>;
}
