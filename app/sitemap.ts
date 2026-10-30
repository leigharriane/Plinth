import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";
import { siteUrl } from "@/lib/site-url";
import siteConfig from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl.href,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
  if (siteConfig.resume === "/resume") {
    entries.push({
      url: new URL("/resume", siteUrl).href,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const project of caseStudies) {
    entries.push({
      url: new URL(`/works/${project.caseStudy.slug}`, siteUrl).href,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    });
  }
  return entries;
}
