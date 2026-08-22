import type { MetadataRoute } from "next";
import { categoryLabels } from "@/data/guides";
import { getAllPublishedGuides } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://boliv.se";
  const updated = new Date();
  const guides = await getAllPublishedGuides();
  return [
    { url: base, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/guider`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/sok`, lastModified: updated, changeFrequency: "monthly", priority: 0.5 },
    ...Object.keys(categoryLabels).map((category) => ({ url: `${base}/${category}`, lastModified: updated, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...guides.map((guide) => ({ url: `${base}/guider/${guide.slug}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
