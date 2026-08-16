import type { MetadataRoute } from "next";

// Public pages only. /admin is intentionally absent.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://vince-welke.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
