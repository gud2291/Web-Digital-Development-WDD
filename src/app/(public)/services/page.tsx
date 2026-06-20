import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { Btn, CTABanner, Reveal, SectionHead } from "@/components/ui";
import { FAQList } from "@/components/FAQList";
import { SchemaMarkup, faqSchema } from "@/components/SchemaMarkup";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import { SectionDivider } from "@/components/public/SectionDivider";
import { listServices } from "@/server/services/service.service";
import { safeIcon } from "@/lib/iconMap";
import { metadataFromDb } from "@/lib/seo";

// ISR (A3): cache for 1h; admin edits appear within the window. Safe — this page
// reads no per-request data (no searchParams/preview), only published CMS content.
export const revalidate = 3600;

export async function generateMetadata() {
  return metadataFromDb("services", {
    path: "/services",
    title: "Web Design & Development Services",
    description:
      "Website design, development, SEO, e-commerce and digital marketing for Indian businesses — everything to launch, rank and grow. Get a free quote.",
  });
}

const FALLBACK_SERVICES: [IconName, string, string, string, string[], string][] = [
  ["monitor", "Website Design", "Custom, conversion-focused designs.", "#2563EB",
    ["UI/UX design", "Wireframes", "Brand alignment", "Mobile-first"], "website-design"],
  ["code", "Website Development", "Fast, secure, scalable websites.", "#EC4899",
    ["HTML/CSS/JS", "WordPress", "CMS", "Hosting setup"], "website-development"],
  ["search", "SEO Optimization", "Rank higher on Google.", "#22C55E",
    ["On-page SEO", "Technical audit", "Local SEO", "Reporting"], "seo"],
  ["cart", "E-commerce Solutions", "Online stores that scale.", "#F59E0B",
    ["Shopify", "WooCommerce", "Payment gateways", "Inventory"], "ecommerce"],
  ["megaphone", "Digital Marketing", "Ads & content that grow.", "#8B5CF6",
    ["Google Ads", "Meta Ads", "Content", "Email"], "digital-marketing"],
  ["smartphone", "Web Maintenance", "Updates & security handled.", "#14B8A6",
    ["Backups", "Security", "Content edits", "Speed audits"], "maintenance"],
];

const PROCESS_STEPS: [string, string][] = [
  ["Research", "Audience, competitors, goals"],
  ["Design", "Wireframes → polished UI"],
  ["Develop", "Clean, SEO-ready build"],
  ["Test", "QA, speed, accessibility"],
  ["Launch", "Go live + 1mo support"],
];

const FALLBACK_FAQ: [string, string][] = [
  ["How long does a website take?", "Most projects ship in 3–5 weeks. Larger e-commerce sites can take 6–8."],
  ["Do you provide hosting?", "Yes — we set up reliable, secure hosting and handle domain configuration."],
  ["Will my website rank on Google?", "All our sites are SEO-ready. For aggressive growth, pair with our SEO package."],
  ["Can I update content myself?", "Absolutely. We hand over a CMS dashboard and walk you through everything."],
  ["What if I need changes later?", "Pick our monthly maintenance plan — content edits, updates and security included."],
];

const ACCENT_COLORS = ["#22C55E", "#2563EB", "#F59E0B", "#8B5CF6"];

export default async function ServicesPage() {
  const servicesRaw = await listServices().catch(() => []);

  const services = servicesRaw.length
    ? servicesRaw.map((s, i) => ({
        icon: safeIcon(s.icon, FALLBACK_SERVICES[i % FALLBACK_SERVICES.length][0]),
        iconName: s.iconName || "Globe",
        accentColor: s.accentColor || (["blue", "green", "orange", "purple"] as const)[i % 4],
        title: s.title,
        desc: s.shortDescription || "",
        color: ACCENT_COLORS[i % ACCENT_COLORS.length],
        features: s.features?.length ? s.features.slice(0, 4) : [],
        slug: s.slug,
      }))
    : FALLBACK_SERVICES.map(([icon, title, desc, color, features, slug]) => ({
        icon, iconName: "Globe", accentColor: "blue", title, desc, color, features, slug,
      }));

  const filterPills = ["All", "Website Design", "Website Development", "SEO", "E-commerce", "Marketing"];

  // Mix DB FAQs from all services with fallback
  const dbFaqs = servicesRaw.flatMap((s) => (s.faqs ?? []).map((f) => [f.q, f.a] as [string, string]));
  const faq = dbFaqs.length ? dbFaqs.slice(0, 6) : FALLBACK_FAQ;

  return (
    <>
      <section className="page-banner">
        <div className="container" style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
          <div className="breadcrumb">
            <span>Home</span>
            <Icon name="chevRight" size={12} />
            <b>Services</b>
          </div>
          <Reveal><h1 className="t-h1">Our Digital Services</h1></Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 14 }}>
              Everything you need to launch online and grow — design, development, SEO, and
              marketing under one roof, from a Delhi studio serving businesses across India and abroad.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container filter-pills">
        {filterPills.map((p, i) => (
          <button key={p} className={`pill ${i === 0 ? "pill--active" : ""}`}>{p}</button>
        ))}
      </div>

      <section style={{ paddingBottom: 80 }}>
        <div className="container services-grid">
          {services.map((s, idx) => (
            <Reveal key={s.title + idx} delay={idx * 60}>
              <div className="card card--interactive" style={{ padding: 28 }}>
                <ServiceIcon iconName={s.iconName} accentColor={s.accentColor} />
                <h2 className="t-h4">{s.title}</h2>
                <p className="t-small" style={{ marginTop: 8 }}>{s.desc}</p>
                {s.features.length > 0 && (
                  <ul className="svc-feats">
                    {s.features.map((f) => (
                      <li key={f}>
                        <Icon name="check" size={12} color="#22C55E" stroke={3} />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: "auto" }} className="svc-actions">
                  <Link href={`/services/${s.slug}`}>
                    <Btn size="sm" iconRight="arrowRight">View Details</Btn>
                  </Link>
                  <Link href="/contact">
                    <Btn size="sm" variant="ghost" className="card-cta">Get Quote</Btn>
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <SectionDivider from="#ffffff" to="#F7F9FC" />

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <SectionHead kicker="OUR PROVEN PROCESS" title="A clear path from idea to launch" />
          </Reveal>
          <div className="process-grid process-grid--5">
            {PROCESS_STEPS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 60}>
                <div className="card" style={{ textAlign: "center", padding: 22 }}>
                  <div className="process-card__num" style={{ width: 44, height: 44, fontSize: 16 }}>
                    {i + 1}
                  </div>
                  <div style={{ fontWeight: 600 }}>{t}</div>
                  <div className="t-small" style={{ marginTop: 6, fontSize: 12.5 }}>{d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider from="#F7F9FC" to="#ffffff" flip />

      <section className="section">
        <div className="container" style={{ maxWidth: 820, margin: "0 auto" }}>
          <Reveal>
            <SectionHead kicker="FAQ" title="Frequently Asked Questions" />
          </Reveal>
          {/* C2 — FAQPage schema mirroring the visible FAQ above. */}
          <SchemaMarkup data={faqSchema(faq.map(([q, a]) => ({ q, a })))} />
          <FAQList items={faq} />
        </div>
      </section>

      <CTABanner />
    </>
  );
}
