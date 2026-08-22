import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata:Metadata={title:"Avregistrerad från BoLiv",robots:{index:false,follow:false}};
type Props={params:Promise<{token:string}>};

export default async function UnsubscribePage({params}:Props){
  const {token}=await params;
  const supabase=await createClient();
  const {data}=await supabase.rpc("unsubscribe_sales_email",{token});
  return <main className="auth-page"><div className="auth-card unsubscribe-card"><div className="auth-icon"><CheckCircle2/></div><h1>{data?"Du är avregistrerad":"Länken kunde inte verifieras"}</h1><p>{data?"Vi kommer inte att skicka fler säljmejl till den här adressen.":"Kontakta BoLiv om du vill säkerställa att adressen tas bort från framtida utskick."}</p><Link className="button" href="/">Till BoLiv</Link></div></main>;
}
