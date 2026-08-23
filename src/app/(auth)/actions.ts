"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function withMessage(path: string, type: "error" | "success", message: string) {
  const params = new URLSearchParams({ [type]: message });
  return `${path}?${params.toString()}`;
}

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(withMessage("/logga-in", "error", "Supabase är ännu inte anslutet."));
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "");
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/mitt-boliv";

  if (!email || !password) {
    redirect(withMessage("/logga-in", "error", "Fyll i e-post och lösenord."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(withMessage("/logga-in", "error", "Inloggningen misslyckades. Kontrollera uppgifterna."));
  }

  redirect(next);
}

export async function sendPartnerActivationLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/logga-in?next=/partnerkonto&error=${encodeURIComponent("Ange e-postadressen från partneravtalet.")}`);
  }
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://boliv-olive.vercel.app";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/partnerkonto/aktivera`, shouldCreateUser: false },
  });
  if (error) {
    redirect(`/logga-in?next=/partnerkonto&error=${encodeURIComponent("Aktiveringslänken kunde inte skickas. Kontrollera e-postadressen.")}`);
  }
  redirect("/logga-in?next=/partnerkonto&success=En+ny+aktiveringslänk+har+skickats+till+din+e-post");
}

export async function signup(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(withMessage("/skapa-konto", "error", "Supabase är ännu inte anslutet."));
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent") === "on";

  if (!displayName || !email || password.length < 8) {
    redirect(withMessage("/skapa-konto", "error", "Fyll i alla fält. Lösenordet måste ha minst 8 tecken."));
  }

  if (!consent) {
    redirect(withMessage("/skapa-konto", "error", "Du behöver godkänna villkoren."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    redirect(withMessage("/skapa-konto", "error", "Kontot kunde inte skapas. E-postadressen kan redan användas."));
  }

  redirect(withMessage("/logga-in", "success", "Kontot är skapat. Kontrollera din e-post för att bekräfta adressen."));
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
