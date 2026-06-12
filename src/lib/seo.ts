import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export interface BuildMetadataInput {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Standard metadata builder. Pages call this with their content and the
 * helper falls back to siteConfig defaults so we get reasonable SEO even
 * before the SeoMeta collection is populated.
 */
export function buildMetadata(input: BuildMetadataInput = {}): Metadata {
  // §17.1 — exactly ONE brand suffix: "Primary Keyword | Web Digital Development".
  // DB titles may already carry the brand; strip any trailing brand suffix
  // (old "| WDD" / "— WDD" variants included) before appending the canonical one.
  const stripped = (input.title || "")
    .replace(/\s*[|—-]\s*(Web Digital Development|WDD)\s*$/i, "")
    .trim();
  const title = stripped ? `${stripped} | ${siteConfig.name}` : siteConfig.title;
  const description = input.description || siteConfig.description;
  const path = input.path || "/";
  const canonical = new URL(path, siteConfig.url).toString();
  const ogImage = input.ogImage || siteConfig.ogImage;
  const keywords = input.keywords?.length ? input.keywords : [...siteConfig.keywords];

  return {
    // `absolute` bypasses the root layout's title template so the brand
    // suffix is never applied twice.
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
  };
}

/**
 * Merge a DB SeoMeta record with page-specific defaults. The DB record
 * wins when present.
 */
export async function metadataFromDb(
  pageSlug: string,
  fallback: BuildMetadataInput = {}
): Promise<Metadata> {
  try {
    const { getSeoMeta } = await import("@/server/services/seoMeta.service");
    const meta = await getSeoMeta(pageSlug);
    if (!meta) return buildMetadata(fallback);
    return buildMetadata({
      title: meta.title || fallback.title,
      description: meta.description || fallback.description,
      path: fallback.path,
      ogImage: meta.ogImage || fallback.ogImage,
      keywords: meta.keywords?.length ? meta.keywords : fallback.keywords,
      noIndex: meta.noIndex,
    });
  } catch {
    return buildMetadata(fallback);
  }
}
