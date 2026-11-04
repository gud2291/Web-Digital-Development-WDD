import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export interface BuildMetadataInput {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
  /** "article" for blog posts so OG consumers get article:* tags. */
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
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
  // Only the bundled default card has known dimensions (1200x630); CMS images
  // vary, so we don't guess theirs.
  const ogImageEntry =
    ogImage === siteConfig.ogImage
      ? { url: ogImage, width: 1200, height: 630, alt: siteConfig.name }
      : { url: ogImage, alt: stripped || siteConfig.name };
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
      locale: "en_IN",
      images: [ogImageEntry],
      ...(input.ogType === "article"
        ? {
            type: "article" as const,
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            authors: input.authors,
          }
        : { type: "website" as const }),
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
      ogType: fallback.ogType,
      publishedTime: fallback.publishedTime,
      modifiedTime: fallback.modifiedTime,
      authors: fallback.authors,
    });
  } catch {
    return buildMetadata(fallback);
  }
}
