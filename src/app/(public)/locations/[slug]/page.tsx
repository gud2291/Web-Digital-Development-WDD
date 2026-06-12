import { notFound } from "next/navigation";
import { Reveal, SectionHead, Btn, CTABanner } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SchemaMarkup, breadcrumbSchema } from "@/components/SchemaMarkup";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const res = await fetch(`${siteConfig.url}/api/public/locations/${params.slug}`, { cache: "no-store" });
    if (!res.ok) return buildMetadata({ title: "Location", path: `/locations/${params.slug}` });
    const doc = await res.json();
    return buildMetadata({
      path: `/locations/${params.slug}`,
      title: doc.seoTitle,
      description: doc.seoDescription,
      keywords: doc.keywords,
    });
  } catch {
    return buildMetadata({ title: "Location", path: `/locations/${params.slug}` });
  }
}

export default async function LocationPage({ params }: PageProps) {
  let doc: Record<string, unknown>;
  try {
    const res = await fetch(`${siteConfig.url}/api/public/locations/${params.slug}`, { cache: "no-store" });
    if (!res.ok) notFound();
    doc = await res.json();
  } catch {
    notFound();
  }

  return (
    <>
      <SchemaMarkup
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: `${doc.city}`, url: `/locations/${doc.slug}` },
        ])}
      />
      <section className="page-banner">
        <div className="container" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <div className="breadcrumb">
            <span>Home</span>
            <Icon name="chevRight" size={12} />
            <span>Services</span>
            <Icon name="chevRight" size={12} />
            <b>{String(doc.city)}</b>
          </div>
          <Reveal>
            <h1 className="t-h1">Website Design & Development in {String(doc.city)}</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 14 }}>
              Professional web design, development and SEO services for {String(doc.city)} and {String(doc.region)}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
          <Reveal>
            <article className="prose" style={{ color: "#475569" }}>
              <div dangerouslySetInnerHTML={{ __html: String(doc.content) }} />
            </article>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <SectionHead title="Ready to build your website?" align="center" />
          </Reveal>
          <Reveal delay={80}>
            <p style={{ marginTop: 16, color: "#475569" }}>
              Book a 20-minute call with our team. We'll discuss your goals and send a written proposal.
            </p>
            <Link href="/contact">
              <Btn size="lg" iconRight="arrowRight" style={{ marginTop: 24 }}>
                Start a Conversation
              </Btn>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
