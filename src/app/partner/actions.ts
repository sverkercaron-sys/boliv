"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitPartnerLead(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const organizationNumber = String(formData.get("organizationNumber") ?? "").trim();
  const municipalitySlug = String(formData.get("municipality") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (website) redirect("/partner/ansok?success=Tack");
  if (!companyName || !contactName || !email || !email.includes("@")) {
    redirect(`/partner/ansok?kommun=${encodeURIComponent(municipalitySlug)}&error=Fyll+i+företag,+kontaktperson+och+e-post`);
  }

  const supabase = await createClient();
  const [{ data: municipality }, { data: service }] = await Promise.all([
    municipalitySlug ? supabase.from("municipalities").select("code").eq("slug", municipalitySlug).single() : Promise.resolve({ data: null }),
    supabase.from("service_categories").select("id").eq("slug", "taklaggare").single(),
  ]);

  const { error } = await supabase.from("partner_leads").insert({
    company_name: companyName.slice(0, 120),
    contact_name: contactName.slice(0, 120),
    email: email.slice(0, 254),
    phone: phone.slice(0, 40) || null,
    organization_number: organizationNumber.slice(0, 30) || null,
    municipality_code: municipality?.code ?? null,
    service_category_id: service?.id ?? null,
    message: message.slice(0, 2000) || null,
    source_path: municipalitySlug ? `/taklaggare/${municipalitySlug}` : "/partner",
  });

  if (error) redirect(`/partner/ansok?kommun=${encodeURIComponent(municipalitySlug)}&error=Intresseanmälan+kunde+inte+skickas`);
  redirect("/partner/ansok?success=Tack!+Vi+återkommer+inom+kort.");
}
