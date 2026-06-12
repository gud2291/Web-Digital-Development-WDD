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
    foundingDate: "2019-06",
    founder: {
      "@type": "Person",
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
    author: a.author
      ? { "@type": "Person", name: a.author }
      : { "@type": "Organization", name: siteConfig.name },
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
