"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const leadStatuses = new Set(["new", "contacted", "qualified", "won", "closed"]);
const placementStatuses = new Set(["available", "reserved", "active", "paused", "ended"]);

async function editorClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");
  const { data: allowed } = await supabase.rpc("has_editor_role");
  if (!allowed) redirect("/");
  return supabase;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function updateLeadStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !leadStatuses.has(status)) return;
  const supabase = await editorClient();
  await supabase.from("partner_leads").update({ status }).eq("id", id);
  revalidatePath("/redaktion/partners");
}

export async function createPartnerOrganization(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const organizationNumber = String(formData.get("organizationNumber") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();
  if (name.length < 2) redirect("/redaktion/partners?error=Ange+företagsnamn");

  const supabase = await editorClient();
  const { error } = await supabase.from("partner_organizations").insert({
    name,
    slug: `${slugify(name)}-${Date.now().toString(36)}`,
    organization_number: organizationNumber || null,
    email: email || null,
    phone: phone || null,
    website_url: websiteUrl || null,
    description: description || null,
    internal_notes: internalNotes || null,
    status: "active",
  });
  if (error) redirect(`/redaktion/partners?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/redaktion/partners");
  redirect("/redaktion/partners?success=Företaget+är+skapat");
}

export async function createPartnerPlacement(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const serviceCategoryId = String(formData.get("serviceCategoryId") ?? "");
  const municipalityCode = String(formData.get("municipalityCode") ?? "");
  const status = String(formData.get("status") ?? "reserved");
  const monthlyPriceRaw = String(formData.get("monthlyPrice") ?? "").replace(",", ".");
  const startsAt = String(formData.get("startsAt") ?? "");
  const endsAt = String(formData.get("endsAt") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();
  if (!organizationId || !serviceCategoryId || !municipalityCode || !placementStatuses.has(status)) {
    redirect("/redaktion/partners?error=Välj+företag,+tjänst+och+kommun");
  }

  const supabase = await editorClient();
  const { error } = await supabase.from("partner_placements").insert({
    organization_id: organizationId,
    service_category_id: serviceCategoryId,
    municipality_code: municipalityCode,
    status,
    monthly_price: monthlyPriceRaw ? Number(monthlyPriceRaw) : null,
    starts_at: startsAt || null,
    ends_at: endsAt || null,
    internal_notes: internalNotes || null,
  });
  if (error) {
    const message = error.code === "23505" ? "Kommunplatsen är redan reserverad eller aktiv" : error.message;
    redirect(`/redaktion/partners?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/redaktion/partners");
  redirect("/redaktion/partners?success=Partnerplatsen+är+skapad");
}

export async function updatePlacementStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !placementStatuses.has(status)) return;
  const supabase = await editorClient();
  const { error } = await supabase.from("partner_placements").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) redirect(`/redaktion/partners?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/redaktion/partners");
}
