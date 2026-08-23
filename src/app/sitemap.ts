import type { MetadataRoute } from "next";
import { categoryLabels } from "@/data/guides";
import { getAllPublishedGuides } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://boliv.se";
  const updated = new Date();
  const [guides, municipalityResult] = await Promise.all([
    getAllPublishedGuides(),
    createClient().then((client) => client.from("municipalities").select("slug")),
  ]);
  const municipalities = municipalityResult.data ?? [];

  return [
    { url: base, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/guider`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/sok`, lastModified: updated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/renovera/tak`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/renovera/badrum`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/underhalla/vvs`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    ...["/kopa-bostad/kopa", "/kopa-bostad/besiktning", "/kopa-bostad/salja", "/kopa-bostad/styling", "/ekonomi/bolan", "/ekonomi/forsakring"].map((path) => ({ url: `${base}${path}`, lastModified: updated, changeFrequency: "weekly" as const, priority: 0.9 })),
    { url: `${base}/underhalla/tryggt-hem`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/installationer/smarta-hem`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tradgard/utemiljo`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/fritidshus`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    ...["energi/el-och-laddning", "energi/varmepumpar", "energi/solceller", "underhalla/dranering", "underhalla/fukt", "underhalla/radon"].map((path) => ({ url: `${base}/${path}`, lastModified: updated, changeFrequency: "weekly" as const, priority: 0.9 })),
    { url: `${base}/verktyg/takkalkyl`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/hitta-foretag`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/partner`, lastModified: updated, changeFrequency: "monthly", priority: 0.5 },
    ...Object.keys(categoryLabels).map((category) => ({ url: `${base}/${category}`, lastModified: updated, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...guides.map((guide) => ({ url: `${base}/guider/${guide.slug}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...municipalities.map((item) => ({ url: `${base}/taklaggare/${item.slug}`, lastModified: updated, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
