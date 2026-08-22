import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://boliv.se";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mitt-boliv/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
