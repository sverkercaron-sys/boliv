"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");

  const { data: allowed } = await supabase.rpc("has_editor_role");
  if (!allowed) redirect("/");
  return { supabase, user };
}

function cleanSlug(value: string) {
  return value
    .toLocaleLowerCase("sv")
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createArticle(formData: FormData) {
  const { supabase, user } = await requireEditor();

  const title = String(formData.get("title") ?? "").trim();
  const slug = cleanSlug(String(formData.get("slug") ?? title));
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const sectionHeading = String(formData.get("sectionHeading") ?? "").trim();
  const sectionText = String(formData.get("sectionText") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const readingTime = Math.max(1, Number(formData.get("readingTime") ?? 5));
  const status = String(formData.get("status") ?? "draft") === "published" ? "published" : "draft";

  if (!title || !slug || !excerpt || !categoryId) {
    redirect("/redaktion/ny?error=Fyll+i+titel,+webbadress,+beskrivning+och+kategori");
  }

  const paragraphs = sectionText.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const body = {
    intro,
    sections: sectionHeading || paragraphs.length
      ? [{ heading: sectionHeading || "Om guiden", paragraphs }]
      : [],
  };

  const { error } = await supabase.from("content_items").insert({
    title,
    slug,
    excerpt,
    body,
    primary_category_id: categoryId,
    author_id: user.id,
    seo_title: seoTitle || title,
    seo_description: seoDescription || excerpt,
    reading_time_minutes: readingTime,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    const message = error.code === "23505" ? "Webbadressen+används+redan" : "Artikeln+kunde+inte+sparas";
    redirect(`/redaktion/ny?error=${message}`);
  }

  revalidatePath("/guider");
  revalidatePath("/redaktion");
  redirect("/redaktion?success=Artikeln+är+sparad");
}

export async function setArticleStatus(formData: FormData) {
  const { supabase } = await requireEditor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") === "published" ? "published" : "draft";
  if (!id) return;

  await supabase.from("content_items").update({
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath("/guider");
  revalidatePath("/redaktion");
}
