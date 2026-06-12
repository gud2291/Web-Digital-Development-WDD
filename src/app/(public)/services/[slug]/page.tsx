import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { Badge, Btn, CTABanner, Eyebrow, PH, Reveal, SectionHead } from "@/components/ui";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import { FAQList } from "@/components/FAQList";
import { CldImage } from "@/components/CldImage";
import { getServiceBySlug } from "@/server/services/service.service";
import { getPreviewDoc } from "@/server/preview/getPreviewDoc";
import { metadataFromDb, buildMetadata } from "@/lib/seo";
import { safeIcon } from "@/lib/iconMap";
import { siteConfig } from "@/config/site";
import {
  SchemaMarkup,
  serviceSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/components/SchemaMarkup";

export const dynamic = "force-dynamic";

const BENEFITS: [IconName, string, string][] = [
  ["zap", "2× Faster", "Load time < 1.5s"],
  ["target", "Higher Conversion", "Up to 3× more leads"],
  ["shield", "SEO Ready", "Built to rank Day 1"],
  ["sparkle", "Premium Look", "Brand-aligned design"],
];

const FALLBACK_CHECKS = [
  "100% mobile-responsive design",
  "Built-in SEO best practices",
  "Fast loading (<1.5s)",
  "Easy-to-use CMS",
  "Lead-capture forms",
  "One month of post-launch support",
];

interface PageProps {
  params: { slug: string };
  searchParams?: { preview?: string; token?: string };
}

export async function generateMetadata({ params }: PageProps) {
  const svc = await getServiceBySlug(params.slug).catch(() => null);
  if (!svc) return buildMetadata({ title: "Service", path: `/services/${params.slug}` });
  return metadataFromDb(`services/${params.slug}`, {
    path: `/services/${params.slug}`,
    title: svc.seoTitle || svc.title,
    description: svc.seoDescription || svc.shortDescription || undefined,
    ogImage: svc.coverImage || undefined,
  });
}

export default async function ServiceDetailPage({ params, searchParams }: PageProps) {
  // §15.6 — render the unsaved draft when a valid preview link is present.
  const draft = await getPreviewDoc<Record<string, unknown>>("service", searchParams);
  const svc = draft
    ? ({
        _id: "preview",
        shortDescription: "",
        content: "",
        coverImage: "",
        icon: "monitor",
        features: [],
        faqs: [],
        pricingTiers: [],
        seoTitle: "",
        seoDescription: "",
        visible: true,
        ...draft,
      } as unknown as NonNullable<Awaited<ReturnType<typeof getServiceBySlug>>>)
    : await getServiceBySlug(params.slug).catch(() => null);
  if (!svc) notFound();

  const features = svc.features?.length ? svc.features : FALLBACK_CHECKS;
  // Pricing tiers (svc.pricingTiers) are intentionally NOT displayed publicly —
  // see CONTENT_FINAL.md. They remain editable in the admin panel.
  const faqs = svc.faqs ?? [];
  const icon = safeIcon(svc.icon, "monitor");

  const fullUrl = `${siteConfig.url}/services/${svc.slug}`;

  return (
    <>
      <SchemaMarkup
        data={serviceSchema({
          name: svc.title,
          description: svc.shortDescription || undefined,
          url: fullUrl,
          image: svc.coverImage || undefined,
        })}
      />
      <SchemaMarkup
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: svc.title, url: `/services/${svc.slug}` },
        ])}
      />
      {faqs.length > 0 && <SchemaMarkup data={faqSchema(faqs)} />}
      <section className="page-banner" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="breadcrumb">
            <span>Home</span>
            <Icon name="chevRight" size={12} />
            <Link href="/services">Services</Link>
            <Icon name="chevRight" size={12} />
            <b>{svc.title}</b>
          </div>
          <div className="two-col" style={{ paddingTop: 24, paddingBottom: 64 }}>
            <div>
              <Reveal>
                <ServiceIcon iconName={svc.iconName} accentColor={svc.accentColor} size={28} />
              </Reveal>
              <Reveal>
                <Badge>
                  <Icon name={icon} size={12} />
                  &nbsp;{svc.title}
                </Badge>
              </Reveal>
              <Reveal delay={60}>
                <h1 className="t-h1" style={{ marginTop: 14 }}>{svc.title}</h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="t-lead" style={{ marginTop: 18 }}>
                  {svc.shortDescription ||
                    "Custom-designed digital solutions that look beautiful and drive results."}
                </p>
              </Reveal>
              <Reveal delay={180}>
                <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
                  <Link href="/contact">
                    <Btn size="lg" iconRight="arrowRight">Start a Conversation</Btn>
                  </Link>
                  <Link href="/projects">
                    <Btn size="lg" variant="secondary">View Portfolio</Btn>
                  </Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}>
              {svc.coverImage ? (
                <div style={{ position: "relative", width: "100%", height: 380, borderRadius: 16, overflow: "hidden" }}>
                  <CldImage
                    src={svc.coverImage}
                    alt={svc.title}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <PH h={380} variant="solid" label="hero illustration" style={{ borderRadius: 16 }} />
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <Reveal>
            <div>
              <Eyebrow>SERVICE OVERVIEW</Eyebrow>
              <h2 className="t-h3" style={{ marginTop: 8 }}>Designed to grow your business</h2>
              {svc.content ? (
                <div
                  className="prose"
                  style={{ marginTop: 14, color: "#475569" }}
                  dangerouslySetInnerHTML={{ __html: svc.content }}
                />
              ) : (
                <p style={{ marginTop: 14, color: "#475569" }}>
                  Every project is built around your real business goals — capturing leads,
                  ranking on Google, and giving customers a smooth experience on any device.
                </p>
              )}
              <ul className="check-list">
                {features.slice(0, 8).map((b) => (
                  <li key={b}>
                    <div className="check-item__icon">
                      <Icon name="check" size={12} stroke={3} />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <Eyebrow>KEY BENEFITS</Eyebrow>
              <h2 className="t-h3" style={{ marginTop: 8 }}>What you get</h2>
              <div className="benefits-grid">
                {BENEFITS.map(([ic, t, d]) => (
                  <div key={t} className="card" style={{ padding: 20 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "#EFF6FF",
                        color: "#2563EB",
                        display: "grid",
                        placeItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Icon name={ic} />
                    </div>
                    <div style={{ fontWeight: 700 }}>{t}</div>
                    <div className="t-small" style={{ marginTop: 4 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section section--alt">
          <div className="container" style={{ maxWidth: 820, margin: "0 auto" }}>
            <Reveal>
              <SectionHead kicker="FAQ" title="Frequently Asked Questions" />
            </Reveal>
            <FAQList items={faqs.map((f): [string, string] => [f.q, f.a])} />
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
