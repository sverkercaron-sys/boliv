import { guides as staticGuides, type Guide, type GuideSection } from "@/data/guides";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type ContentRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: { intro?: string; sections?: GuideSection[] } | null;
  reading_time_minutes: number;
  updated_at: string;
  taxonomy_terms: { name: string; slug: string } | null;
};

function mapRow(row: ContentRow): Guide {
  const category = row.taxonomy_terms?.slug ?? "guider";
  return {
    slug: row.slug,
    category,
    categoryLabel: row.taxonomy_terms?.name ?? "Guide",
    title: row.title,
    description: row.excerpt ?? "",
    readingTime: `${row.reading_time_minutes} min`,
    updated: new Intl.DateTimeFormat("sv-SE", { dateStyle: "long" }).format(new Date(row.updated_at)),
    intro: row.body?.intro ?? row.excerpt ?? "",
    sections: Array.isArray(row.body?.sections) ? row.body.sections : [],
  };
}

async function databaseGuides(): Promise<Guide[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_items")
      .select("slug,title,excerpt,body,reading_time_minutes,updated_at,taxonomy_terms:primary_category_id(name,slug)")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as ContentRow[]).map(mapRow);
  } catch {
    return [];
  }
}

export async function getAllPublishedGuides() {
  const dynamic = await databaseGuides();
  const merged = new Map(staticGuides.map((guide) => [guide.slug, guide]));
  dynamic.forEach((guide) => merged.set(guide.slug, guide));
  return Array.from(merged.values());
}

export async function getPublishedGuide(slug: string) {
  return (await getAllPublishedGuides()).find((guide) => guide.slug === slug);
}

export async function getPublishedGuidesByCategory(category: string) {
  return (await getAllPublishedGuides()).filter((guide) => guide.category === category);
}
