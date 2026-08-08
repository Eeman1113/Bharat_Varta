import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/rss";

const SITE_URL = "https://bharatvarta.vercel.app";
const MAX_URLS = 5000;

// Regenerate the sitemap on the same 10-minute cadence as the RSS layer.
// The underlying getAllArticles() has its own fetch-level revalidation, so
// this cheap ISR just guarantees we don't hold a stale in-memory copy.
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/archive`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/subscribe`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await getAllArticles();
    articleRoutes = articles.slice(0, MAX_URLS - staticRoutes.length).map((a) => ({
      url: `${SITE_URL}/read/${a.id}`,
      lastModified: new Date(a.pubDate),
      changeFrequency: "hourly" as const,
      priority: 0.7,
    }));
  } catch {
    // If the RSS layer is down, still ship the static routes rather than 500.
    articleRoutes = [];
  }

  return [...staticRoutes, ...articleRoutes];
}
