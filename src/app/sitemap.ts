import { MetadataRoute } from "next";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/editorial-board`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/current-issue`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/archives`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/submit-manuscript`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/author-guidelines`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/publication-fees`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    await connectToDatabase();
    const articles = await Article.find({ status: "published" })
      .select("slug updatedAt publicationDate")
      .lean();

    const articleRoutes: MetadataRoute.Sitemap = articles.map((art: any) => ({
      url: `${siteUrl}/articles/${art.slug}`,
      lastModified: art.updatedAt || art.publicationDate || new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    }));

    return [...staticRoutes, ...articleRoutes];
  } catch (err) {
    console.error("Failed to generate article sitemap:", err);
    return staticRoutes;
  }
}
