import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listServices } from "@/server/services/service.service";
import { listBlogs } from "@/server/services/blog.service";
import { listProjects } from "@/server/services/project.service";
import { listLegalPages } from "@/server/services/legalPage.service";
import { listLocationPages } from "@/server/services/locationPage.service";

export const dynamic = "force-dynamic";

/**
 * Priority + changeFrequency map. CLAUDE.md §12.4 + the Phase 5 spec table:
 *   - home:                          1.0 / daily
 *   - list pages (services/blog/…):  0.9 / weekly
 *   - detail pages (slug routes):    0.7 / weekly
 *   - static (about/contact/...):    0.6 / monthly
 *   - legal:                         0.3 / yearly
 */

const STATIC_PATHS: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  // list pages
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
  // static pages
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.6, changeFrequency: "monthly" },
  { path: "/sitemap", priority: 0.6, changeFrequency: "monthly" },
];

const FALLBACK_LEGAL_SLUGS: string[] = ["privacy-policy", "terms", "refund"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  // All fetches run in parallel. Each service-layer fn applies the right
  // visibility filter by default (published: true / visible: true) so we only
  // emit URLs that are publicly resolvable.
  const [services, blogResult, projects, legalPages, locationPages] = await Promise.all([
    listServices().catch(() => []),
    // Lift the cap to 5000. Past that, sitemap index files become the right answer.
    listBlogs({ page: 1, limit: 5000 }).catch(() => ({
      items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
    })),
    listProjects().catch(() => []),
    listLegalPages().catch(() => []),
    listLocationPages().catch(() => []),
  ]);

  const staticUrls: MetadataRoute.Sitemap = STATIC_PATHS.map((s) => ({
    url: `${base}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  const serviceUrls: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogResult.items.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Projects are listing-only on this site — no /projects/[slug] route exists,
  // so emitting per-project URLs would yield 404s. The query above still runs
  // (cheap, parallel) in case detail pages are added later; the moment a
  // /projects/[slug] route exists this block can be uncommented.
  void projects;

  // Legal pages always have a fixed slug set even if the DB is empty (the
  // public /legal/[slug] route falls back to baked-in copy), so we always
  // emit the three URLs.
  const legalSlugs = legalPages.length ? legalPages.map((l) => l.slug) : FALLBACK_LEGAL_SLUGS;
  const legalUrls: MetadataRoute.Sitemap = legalSlugs.map((slug) => {
    const doc = legalPages.find((l) => l.slug === slug);
    return {
      url: `${base}/legal/${slug}`,
      lastModified: doc?.lastUpdated ? new Date(doc.lastUpdated) : now,
      changeFrequency: "yearly",
      priority: 0.3,
    };
  });

  const locationUrls: MetadataRoute.Sitemap = locationPages.map((loc) => ({
    url: `${base}/locations/${loc.slug}`,
    lastModified: loc.updatedAt ? new Date(loc.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticUrls, ...serviceUrls, ...blogUrls, ...legalUrls, ...locationUrls];
}
