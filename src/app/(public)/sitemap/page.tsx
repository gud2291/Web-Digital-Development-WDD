import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CTABanner, Reveal } from "@/components/ui";
import { listServices } from "@/server/services/service.service";
import { listBlogs } from "@/server/services/blog.service";
import { listLegalPages } from "@/server/services/legalPage.service";
import { metadataFromDb } from "@/lib/seo";

// ISR (A3): cache for 1h; admin edits appear within the window. Safe — this page
// reads no per-request data (no searchParams/preview), only published CMS content.
export const revalidate = 3600;

export async function generateMetadata() {
  return metadataFromDb("sitemap", {
    path: "/sitemap",
    title: "Sitemap",
    description:
      "Every page on the Web Digital Development site — services, portfolio, blog, reviews and contact — organized in one place for quick, easy browsing.",
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
                <h2 className="t-h4" style={{ fontSize: 18 }}>{title}</h2>
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

        <div className="container" style={{ maxWidth: 820, margin: "48px auto 0" }}>
          <Reveal>
            <h2 className="t-h2" style={{ fontSize: 28 }}>Find your way around our website</h2>
          </Reveal>
          <Reveal delay={60}>
            <p style={{ marginTop: 14, color: "#475569" }}>
              This page lists every public section of the Web Digital Development website in one
              place. Use it as a quick index when you want to jump straight to a service, read a
              guide on the blog, or check our latest work. The links above are grouped by topic, so
              you can scan them at a glance and reach any page in a single click. New visitors often
              start with Services or Projects; returning clients usually head for the blog or the
              contact page.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h3 className="t-h4" style={{ marginTop: 30 }}>What each section covers</h3>
          </Reveal>
          <Reveal delay={140}>
            <ul style={{ marginTop: 12, paddingLeft: 20, color: "#475569", display: "grid", gap: 10 }}>
              <li>
                <b>Services</b> — website design, development, SEO, e-commerce and digital marketing
                for Indian businesses, each on its own detailed page.
              </li>
              <li>
                <b>Projects</b> — a portfolio of real websites we have built since 2019, every one
                with a live link you can open and check for yourself.
              </li>
              <li>
                <b>Blog</b> — plain-English guides on web design, SEO and growing a business online,
                written for owners rather than developers.
              </li>
              <li>
                <b>Reviews</b> — unedited feedback from real clients in Delhi and abroad, with a
                rating breakdown you can verify.
              </li>
              <li>
                <b>Contact</b> — call, WhatsApp or send a message. We reply within four business
                hours and never use a call centre.
              </li>
              <li>
                <b>Legal</b> — our privacy policy, terms of service and refund policy, written in
                clear language.
              </li>
            </ul>
          </Reveal>

          <Reveal delay={180}>
            <h3 className="t-h4" style={{ marginTop: 26 }}>About Web Digital Development</h3>
          </Reveal>
          <Reveal delay={220}>
            <p style={{ marginTop: 10, color: "#475569" }}>
              Web Digital Development is a website design and development studio based in Palam, New
              Delhi. We have served 250+ clients across India and abroad since 2019, building fast,
              mobile-first sites that are ready to rank on Google from day one. Whether you need a
              brand-new website, a redesign, or ongoing SEO and maintenance, every page listed above
              is a good starting point. If you cannot find what you are looking for, the contact link
              reaches our team directly — there is always a real person on the other end.
            </p>
          </Reveal>
        </div>

        <CTABanner
          title="Still can't find what you're looking for?"
          sub="Reach out and we'll help in under 4 hours."
        />
      </section>
    </>
  );
}
