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
