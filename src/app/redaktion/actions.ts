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
  return value.toLocaleLowerCase("sv").normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function articleValues(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = cleanSlug(String(formData.get("slug") ?? title));
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const readingTime = Math.max(1, Number(formData.get("readingTime") ?? 5));
  const status = String(formData.get("status") ?? "draft") === "published" ? "published" : "draft";

  const sections = [1, 2, 3].map((number) => {
    const heading = String(formData.get(`sectionHeading${number}`) ?? formData.get(number === 1 ? "sectionHeading" : "") ?? "").trim();
    const text = String(formData.get(`sectionText${number}`) ?? formData.get(number === 1 ? "sectionText" : "") ?? "").trim();
    const bulletsText = String(formData.get(`sectionBullets${number}`) ?? "").trim();
    return {
      heading: heading || "Om guiden",
      paragraphs: text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean),
      bullets: bulletsText.split("\n").map((item) => item.replace(/^[-•]\s*/, "").trim()).filter(Boolean),
    };
  }).filter((section) => section.paragraphs.length || section.bullets.length || section.heading !== "Om guiden");

  return { title, slug, excerpt, intro, categoryId, seoTitle, seoDescription, readingTime, status, body: { intro, sections } };
}

function revalidateArticle(slug?: string) {
  revalidatePath("/guider");
  revalidatePath("/redaktion");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/guider/${slug}`);
}

export async function createArticle(formData: FormData) {
  const { supabase, user } = await requireEditor();
  const values = articleValues(formData);
  if (!values.title || !values.slug || !values.excerpt || !values.categoryId) redirect("/redaktion/ny?error=Fyll+i+titel,+webbadress,+beskrivning+och+kategori");

  const { error } = await supabase.from("content_items").insert({
    title: values.title, slug: values.slug, excerpt: values.excerpt, body: values.body,
    primary_category_id: values.categoryId, author_id: user.id,
    seo_title: values.seoTitle || values.title, seo_description: values.seoDescription || values.excerpt,
    reading_time_minutes: values.readingTime, status: values.status,
    published_at: values.status === "published" ? new Date().toISOString() : null,
  });
  if (error) redirect(`/redaktion/ny?error=${error.code === "23505" ? "Webbadressen+används+redan" : "Artikeln+kunde+inte+sparas"}`);
  revalidateArticle(values.slug);
  redirect("/redaktion?success=Artikeln+är+sparad");
}

export async function updateArticle(formData: FormData) {
  const { supabase } = await requireEditor();
  const id = String(formData.get("id") ?? "");
  const oldSlug = String(formData.get("oldSlug") ?? "");
  const values = articleValues(formData);
  if (!id || !values.title || !values.slug || !values.excerpt || !values.categoryId) redirect(`/redaktion/${id}?error=Kontrollera+de+obligatoriska+fälten`);

  const { error } = await supabase.from("content_items").update({
    title: values.title, slug: values.slug, excerpt: values.excerpt, body: values.body,
    primary_category_id: values.categoryId, seo_title: values.seoTitle || values.title,
    seo_description: values.seoDescription || values.excerpt, reading_time_minutes: values.readingTime,
    status: values.status, published_at: values.status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) redirect(`/redaktion/${id}?error=${error.code === "23505" ? "Webbadressen+används+redan" : "Ändringarna+kunde+inte+sparas"}`);
  revalidateArticle(values.slug);
  if (oldSlug && oldSlug !== values.slug) revalidatePath(`/guider/${oldSlug}`);
  redirect("/redaktion?success=Ändringarna+är+sparade");
}

export async function setArticleStatus(formData: FormData) {
  const { supabase } = await requireEditor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") === "published" ? "published" : "draft";
  if (!id) return;
  const { data } = await supabase.from("content_items").update({ status, published_at: status === "published" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id).select("slug").single();
  revalidateArticle(data?.slug);
}

export async function deleteArticle(formData: FormData) {
  const { supabase } = await requireEditor();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!id) return;
  await supabase.from("content_items").delete().eq("id", id);
  revalidateArticle(slug);
  redirect("/redaktion?success=Artikeln+är+raderad");
}
