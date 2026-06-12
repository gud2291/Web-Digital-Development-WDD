import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CTABanner, Reveal } from "@/components/ui";
import { listServices } from "@/server/services/service.service";
import { listBlogs } from "@/server/services/blog.service";
import { listLegalPages } from "@/server/services/legalPage.service";
import { metadataFromDb } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return metadataFromDb("sitemap", {
    path: "/sitemap",
    title: "Sitemap",
    description: "Everything on our website, organized in one place.",
  });
}

type Group = [string, [string, string][]];

const MAIN_PAGES: [string, string][] = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Blog", "/blog"],
  ["Reviews", "/reviews"],
  ["Contact", "/contact"],
];

const FALLBACK_SERVICES: [string, string][] = [
  ["Website Design", "/services"],
  ["Website Development", "/services"],
  ["SEO Optimization", "/services"],
  ["E-commerce", "/services"],
  ["Digital Marketing", "/services"],
  ["Web Maintenance", "/services"],
];

const FALLBACK_LEGAL: [string, string][] = [
  ["Privacy Policy", "/legal/privacy-policy"],
  ["Terms of Service", "/legal/terms"],
  ["Refund Policy", "/legal/refund"],
];

const LEGAL_TITLES: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  terms: "Terms of Service",
  refund: "Refund Policy",
};

export default async function SitemapPageView() {
  const [servicesRaw, blogResult, legalRaw] = await Promise.all([
    listServices().catch(() => []),
    listBlogs({ page: 1, limit: 12 }).catch(() => ({
      items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
    })),
    listLegalPages().catch(() => []),
  ]);

  const services: [string, string][] = servicesRaw.length
    ? servicesRaw.map((s): [string, string] => [s.title, `/services/${s.slug}`])
    : FALLBACK_SERVICES;

  const blogLinks: [string, string][] = blogResult.items.length
    ? blogResult.items.map((b): [string, string] => [b.title, `/blog/${b.slug}`])
    : [];

  const legal: [string, string][] = legalRaw.length
    ? legalRaw.map((l): [string, string] => [
        l.title || LEGAL_TITLES[l.slug] || l.slug,
        `/legal/${l.slug}`,
      ])
    : FALLBACK_LEGAL;

  const groups: Group[] = [
    ["Main Pages", MAIN_PAGES],
    ["Services", services],
    ["Legal", legal],
  ];
  // Insert "Latest Articles" before the Legal group when blog posts exist.
  if (blogLinks.length) groups.splice(2, 0, ["Latest Articles", blogLinks.slice(0, 8)]);

  return (
    <>
      <section style={{ background: "var(--c-bg-section)", padding: "56px 0 40px" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
          <Reveal><h1 className="t-h1" style={{ fontSize: 48 }}>Sitemap</h1></Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 12 }}>
              Everything on our website, organized in one place.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container sitemap-grid">
          {groups.map(([title, items], idx) => (
            <Reveal key={title} delay={idx * 60}>
              <div className="card" style={{ padding: 28 }}>
                <h4 className="t-h4" style={{ fontSize: 18 }}>{title}</h4>
                <ul className="sitemap-links">
                  {items.map(([label, to]) => (
                    <li key={`${title}-${label}-${to}`}>
                      <Link
                        href={to}
                        style={{
                          fontSize: 14,
                          color: "#475569",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Icon name="chevRight" size={12} color="#94A3B8" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <CTABanner
          title="Still can't find what you're looking for?"
          sub="Reach out and we'll help in under 4 hours."
        />
      </section>
    </>
  );
}
