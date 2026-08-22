"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function createProperty(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/mitt-boliv/fastigheter/ny?error=Supabase+är+ännu+inte+anslutet");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/logga-in");

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const propertyType = String(formData.get("propertyType") ?? "").trim();
  const constructionYearValue = String(formData.get("constructionYear") ?? "").trim();
  const livingAreaValue = String(formData.get("livingArea") ?? "").trim();

  if (!name) redirect("/mitt-boliv/fastigheter/ny?error=Ge+fastigheten+ett+namn");

  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: user.id,
      name,
      city: city || null,
      property_type: propertyType || null,
      construction_year: constructionYearValue ? Number(constructionYearValue) : null,
      living_area_m2: livingAreaValue ? Number(livingAreaValue) : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/mitt-boliv/fastigheter/ny?error=Fastigheten+kunde+inte+sparas");
  }

  revalidatePath("/mitt-boliv");
  redirect(`/mitt-boliv/fastigheter/${data.id}`);
}

export async function createMaintenanceTask(formData: FormData) {
  if (!isSupabaseConfigured()) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");

  const propertyId = String(formData.get("propertyId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!propertyId || !title) return;

  await supabase.from("maintenance_tasks").insert({
    owner_id: user.id,
    property_id: propertyId,
    title,
    due_date: dueDate || null,
    status: "planned",
  });

  revalidatePath(`/mitt-boliv/fastigheter/${propertyId}`);
}


export async function createProject(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/mitt-boliv/projekt/ny?error=Supabase+är+inte+anslutet");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");

  const propertyId = String(formData.get("propertyId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const projectType = String(formData.get("projectType") ?? "");
  const budgetValue = String(formData.get("budget") ?? "");
  const plannedStart = String(formData.get("plannedStart") ?? "");
  const plannedEnd = String(formData.get("plannedEnd") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!propertyId || !name) redirect("/mitt-boliv/projekt/ny?error=Fyll+i+projektets+namn+och+fastighet");

  const { data, error } = await supabase.from("projects").insert({
    owner_id: user.id,
    property_id: propertyId,
    name,
    project_type: projectType || null,
    status: "planned",
    budget_amount: budgetValue ? Number(budgetValue) : null,
    planned_start: plannedStart || null,
    planned_end: plannedEnd || null,
    notes: notes || null,
  }).select("id").single();

  if (error || !data) redirect("/mitt-boliv/projekt/ny?error=Projektet+kunde+inte+sparas");

  revalidatePath("/mitt-boliv/projekt");
  revalidatePath("/mitt-boliv");
  redirect(`/mitt-boliv/projekt/${data.id}`);
}

function safeFileName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function uploadDocument(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/mitt-boliv/dokument/ny?error=Supabase+är+inte+anslutet");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");

  const file = formData.get("file");
  const propertyId = String(formData.get("propertyId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "");
  const documentDate = String(formData.get("documentDate") ?? "");

  if (!(file instanceof File) || !propertyId || !title) {
    redirect("/mitt-boliv/dokument/ny?error=Välj+fastighet,+titel+och+fil");
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"];
  if (!allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
    redirect("/mitt-boliv/dokument/ny?error=Filtypen+stöds+inte+eller+filen+är+större+än+10+MB");
  }

  const storagePath = `${user.id}/${propertyId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("property-documents")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) redirect("/mitt-boliv/dokument/ny?error=Filen+kunde+inte+laddas+upp");

  const { error: databaseError } = await supabase.from("documents").insert({
    owner_id: user.id,
    property_id: propertyId,
    project_id: projectId || null,
    title,
    document_type: documentType || null,
    storage_path: storagePath,
    mime_type: file.type,
    document_date: documentDate || null,
  });

  if (databaseError) {
    await supabase.storage.from("property-documents").remove([storagePath]);
    redirect("/mitt-boliv/dokument/ny?error=Dokumentet+kunde+inte+sparas");
  }

  revalidatePath("/mitt-boliv/dokument");
  revalidatePath("/mitt-boliv");
  redirect("/mitt-boliv/dokument?success=Dokumentet+är+sparat");
}
