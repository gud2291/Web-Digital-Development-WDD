import { siteConfig } from "@/config/site";

/**
 * Renders JSON-LD structured data as a <script> tag.
 * Use one component per @type — schema.org allows multiple LD blocks.
 */
interface SchemaProps {
  data: Record<string, unknown>;
}

export function SchemaMarkup({ data }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      // The JSON.stringify output is safe — schema.org structured data is JSON,
      // and the surrounding <script type="application/ld+json"> block is not
      // executed as JavaScript by browsers.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Helpers that build typed schema objects ────────────────────────────────

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
      jobTitle: "Founder",
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
        jobTitle: "Founder",
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
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: a.image ? [a.image] : undefined,
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
    mainEntityOfPage: { "@type": "WebPage", "@id": a.url },
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

/** FAQPage JSON-LD — use on any page that renders a visible FAQ block. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
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
    image: s.image,
    provider: { "@id": `${siteConfig.url}#business` },
    areaServed: "IN",
    serviceType: s.name,
    url: s.url,
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
  };

  if (input.aggregate && input.aggregate.reviewCount > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      // Match the visible "X out of 5" string (one decimal place).
      ratingValue: Number(input.aggregate.ratingValue.toFixed(1)),
      reviewCount: input.aggregate.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (input.reviews.length) {
    node.review = input.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.body,
      ...(r.datePublished
        ? { datePublished: new Date(r.datePublished).toISOString().slice(0, 10) }
        : {}),
    }));
  }

  return node;
}
