import { siteConfig } from "@/config/site";

/**
 * Renders JSON-LD structured data as a <script> tag.
 * Use one component per @type — schema.org allows multiple LD blocks.
 */
interface SchemaProps {
  data: Record<string, unknown>;
}

/**
 * JSON.stringify escapes quotes and backslashes but NOT `<`, `>` or `&`. Any
 * string in the graph that came from a person — a review body, a client name,
 * a CMS title — could therefore carry a literal `</script>` and close this
 * block early, turning the rest into live HTML.
 *
 * Escaping those three characters to their \uXXXX form keeps the payload valid
 * JSON that parses back to the exact same values (so Google reads identical
 * structured data), while making it impossible to break out of the tag.
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function SchemaMarkup({ data }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

// ── Helpers that build typed schema objects ────────────────────────────────

/**
 * Returns an absolute https URL for any url/image/logo/item value Google
 * requires to be absolute. Already-absolute (http/https) values pass through;
 * relative paths are resolved against the canonical site origin. Blank/invalid
 * values return undefined so callers can omit the field.
 */
function absoluteUrl(value?: string | null): string | undefined {
  const v = (value ?? "").trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  return `${siteConfig.url}${v.startsWith("/") ? "" : "/"}${v}`;
}

/** The canonical, always-absolute fallback image (site OG card). */
function fallbackImage(): string {
  return `${siteConfig.url}${siteConfig.ogImage}`;
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    logo: `${siteConfig.url}/assets/logo.png`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "₹₹",
    foundingDate: "2019-06",
    founder: {
      "@type": "Person",
      "@id": `${siteConfig.url}#founder`,
      name: "Gudia Yadav",
      jobTitle: "Founder & CEO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.590067,
      longitude: 77.086238,
    },
    areaServed: ["Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad", "India"],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    sameAs: Object.values(siteConfig.social).filter(Boolean),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}#business` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * AboutPage + founder Person (D4 / E-E-A-T). Links the About page and the named
 * founder to the canonical `#business` entity. Facts only — name, role and the
 * business affiliation that are already true site-wide.
 */
export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteConfig.url}/about#aboutpage`,
        url: `${siteConfig.url}/about`,
        name: `About ${siteConfig.name}`,
        mainEntity: { "@id": `${siteConfig.url}#business` },
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}#founder`,
        name: "Gudia Yadav",
        jobTitle: "Founder & CEO",
        worksFor: { "@id": `${siteConfig.url}#business` },
        url: `${siteConfig.url}/about`,
      },
    ],
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

export interface ArticleSchemaInput {
  title: string;
  description?: string;
  url: string;
  image?: string;
  author?: string;
  datePublished?: Date | string;
  dateModified?: Date | string;
}

export function articleSchema(a: ArticleSchemaInput) {
  // Google caps headline at 110 chars; keep the visible title but truncate the
  // structured-data value so the Article item stays valid.
  const headline = a.title.length > 110 ? `${a.title.slice(0, 109).trimEnd()}…` : a.title;
  // Article requires at least one valid absolute image — fall back to the site
  // OG card when the post has none so the item never goes invalid.
  const image = absoluteUrl(a.image) ?? fallbackImage();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: a.description,
    image: [image],
    // Real Person author (E-E-A-T) linked to the About page + the business; falls
    // back to the Organization only when no author name is available.
    author: a.author
      ? {
          "@type": "Person",
          name: a.author,
          url: `${siteConfig.url}/about`,
          worksFor: { "@id": `${siteConfig.url}#business` },
        }
      : { "@type": "Organization", "@id": `${siteConfig.url}#business`, name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/assets/logo.png` },
    },
    datePublished: a.datePublished ? new Date(a.datePublished).toISOString() : undefined,
    dateModified: a.dateModified
      ? new Date(a.dateModified).toISOString()
      : a.datePublished
        ? new Date(a.datePublished).toISOString()
        : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(a.url) ?? siteConfig.url },
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

/** FAQPage JSON-LD — use on any page that renders a visible FAQ block. */
export function faqSchema(items: FaqItem[]) {
  // Every Question needs a non-empty name and a non-empty answer text, else the
  // FAQPage item is invalid — drop any blank pair.
  const valid = items.filter((f) => f.q?.trim() && f.a?.trim());
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.q.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.a.trim() },
    })),
  };
}

export interface ServiceSchemaInput {
  name: string;
  description?: string;
  url: string;
  image?: string;
}

export function serviceSchema(s: ServiceSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    image: absoluteUrl(s.image),
    provider: {
      "@id": `${siteConfig.url}#business`,
      "@type": "ProfessionalService",
      name: siteConfig.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address.street,
        addressLocality: siteConfig.address.city,
        addressRegion: siteConfig.address.region,
        postalCode: siteConfig.address.postalCode,
        addressCountry: siteConfig.address.country,
      },
    },
    areaServed: "IN",
    serviceType: s.name,
    url: absoluteUrl(s.url) ?? siteConfig.url,
  };
}

/**
 * SpeakableSpecification (D5) — marks the elements a voice assistant can read
 * aloud as a concise spoken answer. `cssSelector` entries MUST point at elements
 * that are actually rendered in the page DOM. Returns a WebPage node carrying the
 * `speakable` property.
 */
export function speakableSchema(cssSelector: string[], pageUrl: string = siteConfig.url) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector,
    },
  };
}

export interface ReviewSchemaInput {
  author: string;
  rating: number;
  body: string;
  datePublished?: Date | string | number;
}

/**
 * Review / AggregateRating attached to the canonical `#business` entity.
 *
 * Google policy + the §0 ground rules require schema to mirror only what is
 * VISIBLE on the page. So:
 *  - `reviews` must be the testimonials actually rendered on that page.
 *  - `aggregate` is emitted ONLY when the page visibly shows that same average
 *    and count (e.g. the reviews page's "X out of 5 · N reviews"). Pages that
 *    show individual reviews but no computed aggregate should omit `aggregate`
 *    and get `review` items only.
 * Re-using the `#business` @id merges these into the same entity declared in
 * the root layout (localBusinessSchema), not a second business node.
 */
export function businessReviewsSchema(input: {
  reviews: ReviewSchemaInput[];
  aggregate?: { ratingValue: number; reviewCount: number };
}) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
  };

  const clamp = (n: number) => Math.min(5, Math.max(1, n));

  if (
    input.aggregate &&
    input.aggregate.reviewCount > 0 &&
    Number.isFinite(input.aggregate.ratingValue)
  ) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      // Match the visible "X out of 5" string (one decimal place).
      ratingValue: Number(clamp(input.aggregate.ratingValue).toFixed(1)),
      reviewCount: input.aggregate.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // A Review is only valid with an author name and a numeric reviewRating, so
  // drop any testimonial missing those before emitting.
  const validReviews = input.reviews.filter(
    (r) => r.author?.trim() && Number.isFinite(r.rating) && r.rating > 0
  );

  if (validReviews.length) {
    node.review = validReviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author.trim() },
      reviewRating: {
        "@type": "Rating",
        ratingValue: clamp(r.rating),
        bestRating: 5,
        worstRating: 1,
      },
      ...(r.body?.trim() ? { reviewBody: r.body.trim() } : {}),
      ...(r.datePublished
        ? { datePublished: new Date(r.datePublished).toISOString().slice(0, 10) }
        : {}),
    }));
  }

  return node;
}
