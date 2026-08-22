import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { submitPartnerLead } from "../actions";

export const metadata: Metadata = { title: "Ansök om att bli BoLiv Partner", description: "Anmäl företagets intresse för en exklusiv partnerplats i en kommun." };

type Props = { searchParams: Promise<{ kommun?: string; success?: string; error?: string }> };
type Municipality = { slug: string; name: string };

export default async function PartnerApplyPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("municipalities").select("slug,name").order("name");
  const municipalities = (data ?? []) as Municipality[];

  return <main className="partner-form-page"><div className="partner-form-wrap">
    <Link href="/partner" className="back-link"><ArrowLeft /> BoLiv Partner</Link>
    <div className="form-card"><span className="kicker">Intresseanmälan</span><h1>Vilken marknad vill ni äga?</h1><p>Intresseanmälan är inte bindande. Vi kontaktar er med upplägg, pris och tillgänglighet.</p>
      {params.success && <div className="form-message success">{params.success}</div>}
      {params.error && <div className="form-message error">{params.error}</div>}
      {!params.success && <form action={submitPartnerLead} className="property-form">
        <div className="form-columns"><label>Företagsnamn<input name="companyName" required /></label><label>Organisationsnummer<input name="organizationNumber" /></label></div>
        <div className="form-columns"><label>Kontaktperson<input name="contactName" required /></label><label>E-post<input name="email" type="email" required /></label></div>
        <div className="form-columns"><label>Telefon<input name="phone" type="tel" /></label><label>Kommun<select name="municipality" defaultValue={params.kommun ?? ""}><option value="">Välj kommun</option>{municipalities.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label></div>
        <label>Berätta kort om företaget<textarea name="message" rows={5} /></label>
        <label className="partner-honeypot" aria-hidden="true">Webbplats<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <label className="checkbox-label"><input type="checkbox" required /><span>Jag godkänner att BoLiv kontaktar mig om partnererbjudandet.</span></label>
        <button className="button" type="submit"><Send /> Skicka intresseanmälan</button>
      </form>}
    </div>
  </div></main>;
}
