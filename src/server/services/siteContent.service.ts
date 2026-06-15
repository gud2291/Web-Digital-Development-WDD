import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/server/db/mongodb";
import SiteContent from "@/server/models/SiteContent";
import type { UpdateSiteContentInput } from "@/server/validation/siteContent";

export async function getSiteContent() {
  await connectDB();
  let doc = await SiteContent.findOne({}).lean();
  if (!doc) {
    const created = await SiteContent.create({});
    doc = created.toObject();
  }
  return doc;
}

/**
 * Cached, deduped site-content read for the PUBLIC site (home, about, contact
 * pages + the public site-content API). Returns exactly the same published doc
 * as `getSiteContent()`.
 *
 * - React `cache()` dedupes repeated reads within a single render.
 * - `unstable_cache` + the `"site-content"` tag avoids a DB round-trip per
 *   request; `revalidate` is a safety net.
 *
 * Freshness is preserved by `revalidateTag("site-content")` in the admin
 * site-content PUT route. This caches only the *published* doc — admin draft
 * preview is overlaid separately via `getPreviewDoc`, so preview is unaffected.
 * Admin reads keep using the uncached `getSiteContent()`.
 */
export const getCachedSiteContent = cache(
  unstable_cache(async () => getSiteContent(), ["site-content"], {
    tags: ["site-content"],
    revalidate: 3600,
  })
);

export async function updateSiteContent(data: UpdateSiteContentInput) {
  await connectDB();
  const doc = await SiteContent.findOne({});
  if (!doc) {
    return SiteContent.create(data);
  }
  Object.assign(doc, data);
  await doc.save();
  return doc.toObject();
}
