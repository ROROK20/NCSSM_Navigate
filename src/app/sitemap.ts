import type { MetadataRoute } from "next";
import { nav } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, priority: 1 },
    ...nav.map((item) => ({
      url: `${siteUrl}${item.href}`,
      lastModified: now,
      priority: 0.8,
    })),
  ];
}
