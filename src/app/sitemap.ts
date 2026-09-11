import type { MetadataRoute } from "next";
import { nav, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, priority: 1 },
    ...nav.map((item) => ({
      url: `${site.url}${item.href}`,
      lastModified: now,
      priority: 0.8,
    })),
  ];
}
