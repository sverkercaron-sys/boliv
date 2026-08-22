"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["new", "contacted", "qualified", "won", "closed"]);

export async function updateLeadStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !allowedStatuses.has(status)) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");
  const { data: allowed } = await supabase.rpc("has_editor_role");
  if (!allowed) redirect("/");

  await supabase.from("partner_leads").update({ status }).eq("id", id);
  revalidatePath("/redaktion/partners");
}
