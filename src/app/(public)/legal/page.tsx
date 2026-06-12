import Link from "next/link";
import { Btn, Reveal } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { listLegalPages } from "@/server/services/legalPage.service";
import { metadataFromDb } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { SchemaMarkup, breadcrumbSchema } from "@/components/SchemaMarkup";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return metadataFromDb("legal", {
    path: "/legal",
    title: "Legal",
    description:
      "Privacy Policy, Terms of Service, and Refund Policy for Web Digital Development.",
  });
}

/** Fallback cards shown when the DB is empty. */
const FALLBACK_PAGES = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "Learn how we collect, use, and protect your personal information.",
    icon: "shield" as const,
    color: "#2563EB",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description:
      "The rules and guidelines that govern use of our services.",
    icon: "file" as const,
    color: "#8B5CF6",
  },
  {
    slug: "refund",
    title: "Refund Policy",
    description:
      "Our refund eligibility criteria and process explained clearly.",
    icon: "download" as const,
    color: "#22C55E",
  },
];

export default async function LegalIndexPage() {
  const docs = await listLegalPages().catch(() => []);

  // Merge DB docs with fallback so we always show all 3
  const pages = FALLBACK_PAGES.map((fb) => {
    const doc = (docs as Array<{ slug: string; title: string; lastUpdated?: Date }>).find(
      (d) => d.slug === fb.slug
    );
    return {
      slug: fb.slug,
      title: doc?.title || fb.title,
      description: fb.description,
      icon: fb.icon,
      color: fb.color,
      lastUpdated: doc?.lastUpdated ? formatDate(doc.lastUpdated) : null,
    };
  });

  return (
    <>
      <SchemaMarkup
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Legal", url: "/legal" },
        ])}
      />

      {/* ── Hero / banner ── */}
      <section className="page-banner">
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}
        >
          <div className="breadcrumb">
            <span>Home</span>
            <Icon name="chevRight" size={12} />
            <b>Legal</b>
          </div>
          <Reveal>
            <h1 className="t-h1">Legal &amp; Policies</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 14 }}>
              Transparency matters. Review our privacy practices, terms of
              service, and refund policy below.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Card grid ── */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              maxWidth: 960,
              margin: "0 auto",
            }}
          >
            {pages.map((p, idx) => (
              <Reveal key={p.slug} delay={idx * 60}>
                <Link
                  href={`/legal/${p.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    className="card card--hover"
                    style={{
                      padding: 28,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: p.color + "18",
                        color: p.color,
                      }}
                    >
                      <Icon name={p.icon} size={22} />
                    </div>
                    <h2
                      className="t-h4"
                      style={{ margin: 0, fontWeight: 700 }}
                    >
                      {p.title}
                    </h2>
                    <p className="t-small" style={{ flex: 1 }}>
                      {p.description}
                    </p>
                    {p.lastUpdated && (
                      <span
                        className="t-small"
                        style={{ opacity: 0.55, fontSize: 12 }}
                      >
                        Last updated: {p.lastUpdated}
                      </span>
                    )}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#2563EB",
                        fontWeight: 600,
                        fontSize: 14,
                        marginTop: "auto",
                      }}
                    >
                      Read Full Policy
                      <Icon name="arrowRight" size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="section section--alt">
        <div className="container" style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <div
              className="card"
              style={{
                padding: 32,
                textAlign: "center",
                background: "var(--c-bg-section)",
                borderColor: "var(--c-primary-100)",
              }}
            >
              <h3 className="t-h3">Have Legal Questions?</h3>
              <p className="t-small" style={{ marginTop: 8, maxWidth: 480, margin: "8px auto 0" }}>
                If you need clarification on any of our policies, you're welcome to
                get in touch with our team.
              </p>
              <div style={{ marginTop: 20 }}>
                <Link href="/contact">
                  <Btn iconRight="arrowRight">Contact Us</Btn>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
