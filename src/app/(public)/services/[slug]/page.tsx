import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { Badge, Btn, CTABanner, Eyebrow, PH, Reveal, SectionHead } from "@/components/ui";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import { FAQList } from "@/components/FAQList";
import { CldImage } from "@/components/CldImage";
import { getServiceBySlug, listServices } from "@/server/services/service.service";
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

// ISR: prerender published services via generateStaticParams; cache 1h. Admin
// saves call revalidatePath("/services/[slug]") so edits appear immediately.
// Drafts render via draftMode() for editors only.
export const revalidate = 3600;

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

// §E1 — real customer questions shown on every service page when the service has
// no admin-entered FAQs. Universal (apply to any service), factual, 40–60 words,
// and mirrored 1:1 into FAQPage JSON-LD below. Per-service FAQs in the DB override.
const FALLBACK_SERVICE_FAQS: { q: string; a: string }[] = [
  {
    q: "How much does this cost?",
    a: "Pricing depends on your scope and requirements, so we give a fixed, written quote after a short discovery call — with no hidden charges. Most small-business projects are surprisingly affordable, and you will know the exact figure before any work starts. Book a free consultation to get yours.",
  },
  {
    q: "How long does it take?",
    a: "Most projects are completed in three to five weeks; larger or more complex work can take six to eight. The biggest variable is how quickly content and feedback come from your side, so we keep things moving with clear milestones and regular updates from day one.",
  },
  {
    q: "Do you work with businesses outside Delhi?",
    a: "Yes. We are based in Palam, New Delhi, but we have delivered 400+ projects for clients across India and abroad. Everything — discovery, work, feedback and delivery — can be handled online over call, email and WhatsApp, so your location is never a barrier to working with us.",
  },
  {
    q: "What happens after the project is delivered?",
    a: "Every project includes one month of free support to fix any issues and make small tweaks. After that, optional maintenance plans cover ongoing updates, security, backups and edits. For websites you also get a simple CMS, so your team can manage day-to-day content yourselves.",
  },
  {
    q: "How do we get started?",
    a: "It starts with a free, no-obligation consultation. We learn about your business, goals and budget, then send a clear written scope and a fixed quote. Once approved, we begin discovery and design. You can reach us by phone, email, WhatsApp or the contact form to book it.",
  },
  {
    q: "Do you offer other services too?",
    a: "Yes. Web Digital Development is a full-service studio — website design, development, SEO, e-commerce and digital marketing, all under one roof. Many clients start with one service and grow into others, so everything stays consistent and you deal with a single, accountable team you already trust.",
  },
];

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const services = await listServices().catch(() => []);
  return services.filter((s) => s.slug).map((s) => ({ slug: s.slug as string }));
}

export async function generateMetadata({ params }: PageProps) {
  const svc = await getServiceBySlug(params.slug).catch(() => null);
  if (!svc) return buildMetadata({ title: "Service", path: `/services/${params.slug}` });
  return metadataFromDb(`services/${params.slug}`, {
    path: `/services/${params.slug}`,
    title: svc.seoTitle || svc.title,
    // Per-service fallback so empty SEO fields don't reuse the homepage meta.
    description:
      svc.seoDescription ||
      svc.shortDescription ||
      `${svc.title} in Delhi by Web Digital Development — get a free, no-obligation quote.`,
    ogImage: svc.coverImage || undefined,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  // §15.6 — render the unsaved draft when the editor is in draft mode.
  const draft = await getPreviewDoc<Record<string, unknown>>("service");
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
  // §E1 — show admin-entered FAQs when present, else the universal fallback set
  // so every service page has visible, snippet-eligible Q&A (and matching schema).
  const faqs = svc.faqs?.length ? svc.faqs : FALLBACK_SERVICE_FAQS;
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
