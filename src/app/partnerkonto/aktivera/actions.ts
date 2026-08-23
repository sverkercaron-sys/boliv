"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function activatePartnerAccount(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 8) redirect("/partnerkonto/aktivera?error=Lösenordet+måste+ha+minst+8+tecken");
  if (password !== confirmation) redirect("/partnerkonto/aktivera?error=Lösenorden+är+inte+likadana");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in?next=/partnerkonto/aktivera&error=Aktiveringslänken+har+gått+ut");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/partnerkonto/aktivera?error=Kontot+kunde+inte+aktiveras");
  redirect("/partnerkonto?success=Kontot+är+aktiverat");
}
