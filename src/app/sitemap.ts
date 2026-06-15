import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listServices } from "@/server/services/service.service";
import { listBlogs } from "@/server/services/blog.service";
import { listProjects } from "@/server/services/project.service";
import { listLegalPages } from "@/server/services/legalPage.service";
import { listLocationPages } from "@/server/services/locationPage.service";
import { getHomepage } from "@/server/services/homepage.service";

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

// Stable per-deploy timestamp (evaluated once at module load), used as the
// last-modified for static pages that have no real content signal. Preferred
// over a per-request `new Date()` so dateless pages don't appear to change on
// every crawl (a weak/ignored signal).
const BUILD_TIME = new Date();

/** Most recent `updatedAt` across a list of docs, or `fallback` when none have one. */
function latestUpdatedAt(items: Array<{ updatedAt?: unknown }>, fallback: Date): Date {
  let max = 0;
  for (const it of items) {
    const t = it.updatedAt ? new Date(it.updatedAt as string | number | Date).getTime() : 0;
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max ? new Date(max) : fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  // All fetches run in parallel. Each service-layer fn applies the right
  // visibility filter by default (published: true / visible: true) so we only
  // emit URLs that are publicly resolvable.
  const [services, blogResult, projects, legalPages, locationPages, homepage] = await Promise.all([
    listServices().catch(() => []),
    // Lift the cap to 5000. Past that, sitemap index files become the right answer.
    listBlogs({ page: 1, limit: 5000 }).catch(() => ({
      items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
    })),
    listProjects().catch(() => []),
    listLegalPages().catch(() => []),
    listLocationPages().catch(() => []),
    getHomepage().catch(() => null),
  ]);

  // Real last-modified per static path where a content signal exists (homepage
  // settings + the newest child of each list page); otherwise the stable build
  // time. Avoids stamping every static page with an always-"now" date.
  const staticLastMod: Record<string, Date> = {
    "/": homepage?.updatedAt ? new Date(homepage.updatedAt) : BUILD_TIME,
    "/services": latestUpdatedAt(services, BUILD_TIME),
    "/projects": latestUpdatedAt(projects, BUILD_TIME),
    "/blog": latestUpdatedAt(blogResult.items, BUILD_TIME),
  };

  const staticUrls: MetadataRoute.Sitemap = STATIC_PATHS.map((s) => ({
    url: `${base}${s.path}`,
    lastModified: staticLastMod[s.path] ?? BUILD_TIME,
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

  // /projects/[slug] detail pages exist — emit one URL per published project.
  // Guard against an empty slug (slug is auto-generated from title on save, but
  // isn't a hard-required field) so we never emit a broken /projects/ URL.
  const projectUrls: MetadataRoute.Sitemap = projects
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

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

  return [...staticUrls, ...serviceUrls, ...blogUrls, ...projectUrls, ...legalUrls, ...locationUrls];
}
