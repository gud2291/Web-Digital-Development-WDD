import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { CTABanner, Eyebrow, Reveal, SectionHead } from "@/components/ui";
import { Counter } from "@/components/public/Counter";
import { SectionDivider } from "@/components/public/SectionDivider";
import { getCachedSiteContent } from "@/server/services/siteContent.service";
import { getPreviewDoc } from "@/server/preview/getPreviewDoc";
import { listTeam } from "@/server/services/team.service";
import { metadataFromDb } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { SafeImage } from "@/components/public/SafeImage";
import { cldOptimize } from "@/lib/cloudinary";
import { SchemaMarkup, aboutPageSchema, faqSchema } from "@/components/SchemaMarkup";
import { FAQList } from "@/components/FAQList";

// ISR: cached HTML; site-content & team admin saves call revalidatePath("/about")
// so edits appear immediately. Drafts render via draftMode() for editors only.
export const revalidate = 3600;

export async function generateMetadata() {
  return metadataFromDb("about", {
    path: "/about",
    title: "About Our Delhi Web Design Studio",
    description:
      "Delhi web design & development studio since 2019, founder-led by Gudia Yadav — 400+ sites delivered for 250+ clients across India and abroad. Meet our founder, mission, vision and team.",
    keywords: [
      "about web digital development",
      "Gudia Yadav founder web design",
      "web design studio Delhi founder",
      "our mission and vision",
      ...siteConfig.keywords,
    ],
  });
}

const FALLBACK_REASONS: [IconName, string, string][] = [
  ["target", "Result-Driven", "We measure success in your leads, not awards."],
  ["zap", "Fast Turnaround", "Most websites ship in 3–5 weeks, fully tested."],
  ["users", "Senior Designers", "No juniors handling your project blind."],
  ["shield", "Clear Written Scope", "Everything agreed in writing before we start."],
  ["chat", "Real Support", "Reply in under 4 hours during business days."],
  ["sparkle", "Unique Designs", "Zero templates. Every pixel is yours."],
];

const FALLBACK_TIMELINE: [string, string, string][] = [
  ["2019", "Studio founded", "Web Digital Development started in New Delhi; first client signed — Expoed, Spain"],
  ["2020", "60+ projects", "COVID arrives and every business suddenly wants a website"],
  ["2022", "SEO + marketing", "Added SEO and digital marketing as full services"],
  ["2024", "300+ launches", "Team grows with senior developers and a content writer"],
  ["2026", "New stack", "Rebuilt our own site on Next.js with an AI chatbot — this one"],
];

const FALLBACK_TEAM: [string, string, string][] = [
  ["Rohit Sharma", "Founder & CEO", "#DBE7FE"],
  ["Ankit Khanna", "Head of Design", "#FCE7F3"],
  ["Neha Verma", "Lead Developer", "#FEF3C7"],
  ["Priya Singh", "SEO Director", "#DCFCE7"],
];

const MINI_STATS: [string, string][] = [
  ["6+", "Years"],
  ["400+", "Projects"],
  ["250+", "Clients"],
  ["6", "Team"],
];

const TIMELINE_THEMES = [
  { color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)", icon: "rocket" as IconName },
  { color: "#A855F7", glow: "rgba(168, 85, 247, 0.45)", icon: "code" as IconName },
  { color: "#F87171", glow: "rgba(248, 113, 113, 0.45)", icon: "target" as IconName },
  { color: "#60A5FA", glow: "rgba(96, 165, 250, 0.45)", icon: "users" as IconName },
  { color: "#FBBF24", glow: "rgba(251, 191, 36, 0.45)", icon: "sparkle" as IconName },
];

const TEAM_BG_COLORS = ["#DBE7FE", "#FCE7F3", "#FEF3C7", "#DCFCE7", "#EFF6FF", "#FEE2E2"];

// Founder & CEO section — sensible fallbacks so the section renders cleanly
// before an admin fills in the site-content fields.
const FOUNDER_NAME_FALLBACK = "Gudia Yadav";
const FOUNDER_TITLE_FALLBACK = "Founder & CEO";
const FOUNDER_PHOTO_ALT_FALLBACK = "Gudia Yadav, Founder & CEO of Web Digital Development";
const FOUNDER_NOTE_FALLBACK =
  "When I started Web Digital Development in 2019, I believed a world-class website shouldn't be a luxury only big brands can afford. That belief still drives everything we do. Every project that leaves our studio passes across my desk — because your website carries my name as much as yours. My promise is simple: premium design, honest pricing, and real support that doesn't disappear after launch.";
const FOUNDER_MISSION_FALLBACK =
  "To help small and mid-sized businesses across India and beyond build fast, beautiful, high-performing websites they're genuinely proud of — pairing premium design with honest pricing and support that stays with them long after launch.";
const FOUNDER_VISION_FALLBACK =
  "To become India's most trusted web design studio — the first name a growing business thinks of when it wants a website that looks world-class and actually drives real growth.";
const FOUNDER_HIGHLIGHTS_FALLBACK: { value: string; label: string }[] = [
  { value: "2019", label: "Building since" },
  { value: "400+", label: "Projects shipped" },
  { value: "Hands-on", label: "On every build" },
];

function founderInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// "What We Bring to the Table" — each service linked to its /services/[slug] page.
// Slugs match the homepage list (verified against seed-content.ts).
const WHO_WE_BRING: [string, string, string][] = [
  [
    "Website Design & Development",
    "Clean, modern, fully responsive websites built to impress and convert.",
    "website-development",
  ],
  [
    "Website Redesign",
    "Breathing new life into outdated sites while preserving your brand identity.",
    "website-designing",
  ],
  [
    "Graphic Design",
    "Logos, brochures, catalogues, and visual assets that keep your brand consistent.",
    "graphic-designing",
  ],
  [
    "SEO & Content Strategy",
    "Keyword-focused content and on-page optimization that helps you get found on Google.",
    "seo-services",
  ],
  [
    "Online Marketing & SMO",
    "Social media and digital marketing strategies that connect you with the right audience.",
    "digital-marketing",
  ],
];

const ABOUT_FAQ: [string, string][] = [
  [
    "Why choose Web Digital Development?",
    "We are a client-first web design and development studio in Delhi with over 6 years of experience, delivering 400+ custom websites for 250+ clients across India and globally. Unlike generic agencies, we don't use rigid templates; every site is crafted with hand-tailored design, fast performance, search engine optimization, and direct founder-led quality control. We focus on transparent pricing, clear timelines, and long-term support to ensure your website directly drives lead generation and business growth.",
  ],
  [
    "How much does a website cost?",
    "Website costs depend on your project scope, features, and custom requirements. Basic business landing pages typically start around ₹15,000 to ₹25,000, multi-page corporate websites range between ₹25,000 and ₹60,000, while custom e-commerce stores and advanced web apps vary based on specific functionality like payment gateways, user dashboards, and custom integrations. We provide a transparent, fixed-price quote after an initial consultation—with zero hidden charges.",
  ],
  [
    "How long does development take?",
    "Most standard business websites are completed and launched within 2 to 4 weeks. Smaller landing pages can be ready in 7 to 10 days, while larger e-commerce sites or custom web applications may take 4 to 6 weeks. We establish clear project milestones from day one and deliver regular progress updates so your website launches on schedule without compromising on quality or testing.",
  ],
  [
    "Do you redesign existing websites?",
    "Yes, we specialize in complete website redesigns. We modernize outdated visuals, improve mobile responsiveness, speed up page load times, and revamp the user experience (UX) while carefully preserving your existing SEO rankings, backlink structure, and brand domain authority. We also assist with seamless domain migration and content strategy updates.",
  ],
  [
    "Do you build WordPress websites?",
    "Yes, we build fully customized, secure, and easy-to-manage WordPress websites tailored to your brand. In addition to WordPress, we also build high-performance custom websites using modern web tech stacks like Next.js, React, Node.js, and HTML5/CSS3, giving you the flexibility to choose the best technology for your performance, scalability, and content management needs.",
  ],
  [
    "Will my website be mobile friendly?",
    "Absolutely. Every website we design is 100% mobile-responsive and optimized for all screen sizes—including smartphones, tablets, laptops, and desktops. We follow a mobile-first design strategy to guarantee fast loading speeds, intuitive navigation, smooth touch interactions, and an exceptional user experience on every device.",
  ],
  [
    "Do you provide SEO?",
    "Yes, all our websites include comprehensive on-page SEO best practices as standard—including clean semantic HTML, meta title & description optimization, image optimization, schema markup (structured data), and fast loading speeds for Search Engine, Generative Engine (GEO), and Answer Engine (AEO) visibility. We also offer dedicated SEO services, including keyword research, technical SEO audits, content strategy, and ongoing search ranking optimization.",
  ],
  [
    "Do you offer website maintenance?",
    "Yes, we provide comprehensive post-launch website maintenance and technical support plans. Our services include regular security updates, core & plugin updates, automated backups, performance monitoring, content updates, and quick bug fixes to keep your website fast, secure, and running smoothly 24/7.",
  ],
];

export default async function AboutPage() {
  const [siteContentDb, teamRaw, draft] = await Promise.all([
    getCachedSiteContent().catch(() => null),
    listTeam().catch(() => []),
    getPreviewDoc<Record<string, unknown>>("site-content"),
  ]);
  const siteContent = (draft as unknown as typeof siteContentDb) ?? siteContentDb;

  const about = siteContent?.about ?? null;

  const reasons: [IconName, string, string][] = about?.whyChooseUs?.length
    ? about.whyChooseUs.slice(0, 6).map((line, i): [IconName, string, string] => {
        const [defIcon, defTitle, defDesc] = FALLBACK_REASONS[i % FALLBACK_REASONS.length];
        // If the line uses a "Title — Description" or "Title: Description" pattern, split it.
        const m = line.match(/^(.*?)[—:-]\s*(.*)$/);
        const title = m?.[1]?.trim() || defTitle;
        const desc = m?.[2]?.trim() || (m ? "" : line);
        return [defIcon, title, desc || defDesc];
      })
    : FALLBACK_REASONS;

  const timeline: [string, string, string][] = about?.timeline?.length
    ? about.timeline.map((t): [string, string, string] => [t.year || "", t.title || "", t.description || ""])
    : FALLBACK_TIMELINE;

  const team = teamRaw.length
    ? teamRaw.map((m, i) => ({
        name: m.name,
        role: m.designation || "",
        bg: TEAM_BG_COLORS[i % TEAM_BG_COLORS.length],
        photo: m.photo || "",
        linkedin: m.linkedinUrl || "",
      }))
    : FALLBACK_TEAM.map(([name, role, bg]) => ({ name, role, bg, photo: "", linkedin: "" }));

  const founderName = about?.founderName || FOUNDER_NAME_FALLBACK;
  const founderTitle = about?.founderTitle || FOUNDER_TITLE_FALLBACK;
  const founderPhoto = about?.founderPhoto || "";
  const founderPhotoAlt = about?.founderPhotoAlt || FOUNDER_PHOTO_ALT_FALLBACK;
  const founderNote = about?.founderNote || FOUNDER_NOTE_FALLBACK;
  const mission = about?.mission || FOUNDER_MISSION_FALLBACK;
  const vision = about?.vision || FOUNDER_VISION_FALLBACK;
  const founderHighlights: { value: string; label: string }[] = about?.founderHighlights?.length
    ? about.founderHighlights.slice(0, 3).map((h) => ({ value: h.value || "", label: h.label || "" }))
    : FOUNDER_HIGHLIGHTS_FALLBACK;

  return (
    <>
      {/* D4 — AboutPage + founder Person entity, linked to the #business node. */}
      <SchemaMarkup data={aboutPageSchema()} />
      <section className="page-banner">
        <div className="container" style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
          <div className="breadcrumb">
            <span>Home</span>
            <Icon name="chevRight" size={12} />
            <b>About Us</b>
          </div>
          <Reveal><h1 className="t-h1">About Web Digital Development</h1></Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 16 }}>
              A passionate team of designers and developers helping Indian businesses look
              professional online and grow with confidence.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <Reveal>
              <Eyebrow>OUR STORY</Eyebrow>
              <h2 className="t-h2" style={{ marginTop: 8 }}>
                {about?.heading ||
                  "We're a team of digital experts passionate about your growth."}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              {about?.description ? (
                <p style={{ marginTop: 18, color: "#475569", whiteSpace: "pre-line" }}>
                  {about.description}
                </p>
              ) : (
                <>
                  <p style={{ marginTop: 18, color: "#475569" }}>
                    Web Digital Development is a website design and development studio in Palam,
                    New Delhi, founded in 2019 by Gudia Yadav. It started with one simple belief:
                    small and mid-sized Indian businesses deserve websites as good as the ones
                    global brands enjoy — without the global-brand invoice.
                  </p>
                  <p style={{ marginTop: 14, color: "#475569" }}>
                    Since then we&apos;ve delivered 400+ websites and digital growth services to
                    250+ clients across India and abroad — and the founder still reviews every
                    design before it goes live.
                  </p>
                </>
              )}
            </Reveal>
            <Reveal delay={160}>
              <div className="mini-stats">
                {MINI_STATS.map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#1D4ED8" }}>
                      <Counter value={v} />
                    </div>
                    <div className="t-small">{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <div style={{ position: "relative", height: "100%", minHeight: 400, width: "100%", borderRadius: 16, overflow: "hidden" }}>
            <SafeImage src={cldOptimize(about?.heroImage || "https://res.cloudinary.com/dt4i2xbs8/image/upload/f_auto,q_auto/wdd/about/our-story", "w_1200")} alt="Web Digital Development studio workspace in Delhi" fallbackLabel="WDD Studio, Delhi" loading="eager" fetchPriority="high" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
        </div>
      </section>

      {/* Who We Are — fuller version that complements (doesn't repeat) the Our
          Story founder narrative above. h2 title, h3 sub-headings; service links
          point to each /services/[slug]. Page keeps its single h1 in the banner. */}
      <section className="section section--pt-24">
        <div className="container">
          <Reveal>
            <Eyebrow>WHO WE ARE</Eyebrow>
            <h2 className="t-h2" style={{ marginTop: 14 }}>
              Who We Are
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="t-lead" style={{ marginTop: 16 }}>
              Since 2019, we&apos;ve helped businesses across industries build websites that
              don&apos;t just exist online, but actually perform.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="t-h3" style={{ marginTop: 40 }}>
              What We Bring to the Table
            </h3>
            <p className="t-small" style={{ marginTop: 12 }}>
              We&apos;re not a one-size-fits-all agency. Every project starts with understanding your
              business — your goals, your audience, and what makes you different. From there, we put
              our expertise to work across:
            </p>
            <ul
              className="about-preview__checks"
              style={{ listStyle: "none", margin: 0, marginTop: 22, padding: 0 }}
            >
              {WHO_WE_BRING.map(([title, desc, slug]) => (
                <li key={title} className="check-item" style={{ listStyle: "none" }}>
                  <div className="check-item__icon">
                    <Icon name="check" size={12} stroke={3} />
                  </div>
                  <div>
                    <Link href={`/services/${slug}`} className="svc-link" style={{ marginTop: 0 }}>
                      {title}
                    </Link>
                    <div className="t-small">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="t-h3" style={{ marginTop: 40 }}>
              Why It Matters
            </h3>
            <p className="t-small" style={{ marginTop: 12 }}>
              Your website is often the very first interaction someone has with your brand — your
              digital storefront, your business card, and your most accessible point of contact, all
              rolled into one.
            </p>
            <p className="t-small" style={{ marginTop: 16 }}>
              A well-designed website builds trust instantly. A poorly designed one can cost you
              customers before they read a single word. That&apos;s why we take every project
              seriously, no matter the size.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="t-h3" style={{ marginTop: 40 }}>
              Built for Businesses That Mean Business
            </h3>
            <p className="t-small" style={{ marginTop: 12 }}>
              Since 2019 we&apos;ve refined our process so that what you get isn&apos;t just a
              beautiful website — it&apos;s a reliable digital asset that supports your growth. Our
              designers and developers stay current with the latest web standards, design trends, and
              search best practices, so your site launches ready to perform.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="t-h3" style={{ marginTop: 40 }}>
              A Note From Gudia Yadav
            </h3>
            <p className="t-small" style={{ marginTop: 12 }}>
              I care less about the size of a project and more about whether it moves your business
              forward. If we work together, you&apos;ll deal with people who pick up the phone and
              actually own the outcome — not a faceless agency. That&apos;s the standard I hold every
              project to.
            </p>
          </Reveal>
        </div>
      </section>

      <SectionDivider from="#ffffff" to="#F7F9FC" />

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <SectionHead kicker="WHY CHOOSE US" title="Reasons Clients Stay With Us" />
          </Reveal>
          <div className="services-grid services-grid--reasons">
            {reasons.map(([ic, t, d], idx) => (
              <Reveal key={t + idx} delay={idx * 60}>
                <div className="card card--hover card--interactive">
                  <div className="svc-icon" style={{ background: "var(--c-primary-50)", color: "#2563EB" }}>
                    <Icon name={ic} />
                  </div>
                  <h3 className="t-h4">{t}</h3>
                  <p className="t-small" style={{ marginTop: 6 }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider from="#F7F9FC" to="#ffffff" flip />

      {/* Founder & CEO — premium section, sits directly above "Our Journey".
          Photo one side (framed with an offset accent block for depth, and an
          initials fallback when no photo is set), name/title/note/signature/
          highlights the other. Mission and Vision below as equal-height,
          icon-topped cards with a hover lift. Section title is h2; Mission and
          Vision labels are h3. */}
      <section className="section section--founder">
        <div className="container two-col">
          <div style={{ position: "relative", height: "100%", minHeight: 400 }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                width: "100%",
                height: "100%",
                borderRadius: 24,
                background: "linear-gradient(135deg, var(--c-primary-600), var(--c-primary-700))",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                height: "100%",
                width: "100%",
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid var(--c-border)",
                boxShadow: "var(--sh-card-hover)",
              }}
            >
              <Reveal>
                {founderPhoto ? (
                  <SafeImage
                    src={cldOptimize(founderPhoto, "w_800")}
                    alt={founderPhotoAlt}
                    fallbackLabel={founderName}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={founderPhotoAlt}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #1B4DA8 0%, #2563EB 100%)",
                      color: "#DBEAFE",
                      fontSize: 56,
                      fontWeight: 800,
                    }}
                  >
                    {founderInitials(founderName)}
                  </div>
                )}
              </Reveal>
            </div>
          </div>
          <div>
            <Reveal>
              <Eyebrow>LEADERSHIP</Eyebrow>
              <h2 className="t-h2" style={{ marginTop: 8 }}>{founderTitle}</h2>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ marginTop: 16, fontSize: 20, fontWeight: 700 }}>{founderName}</div>
              <div className="t-small" style={{ marginTop: 2 }}>{founderTitle} · Web Digital Development</div>
            </Reveal>
            <Reveal delay={140}>
              <blockquote className="pull-quote" style={{ marginTop: 22, lineHeight: 1.7 }}>
                {founderNote}
              </blockquote>
              <div
                style={{
                  marginTop: 12,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--c-primary-700)",
                }}
              >
                — {founderName}, {founderTitle}
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 28, marginTop: 28 }}>
                {founderHighlights.map((h, i) => (
                  <div key={h.label + i}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--c-primary-700)" }}>{h.value}</div>
                    <div className="t-small" style={{ marginTop: 2 }}>{h.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <div className="container" style={{ marginTop: 48 }}>
          <div className="two-col">
            <Reveal>
              <div className="card card--hover" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <div className="svc-icon" style={{ background: "var(--c-primary-50)", color: "#2563EB" }}>
                  <Icon name="target" />
                </div>
                <h3 className="t-h3">Mission</h3>
                <p className="t-small" style={{ marginTop: 10 }}>{mission}</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="card card--hover" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <div className="svc-icon" style={{ background: "var(--c-primary-50)", color: "#2563EB" }}>
                  <Icon name="eye" />
                </div>
                <h3 className="t-h3">Vision</h3>
                <p className="t-small" style={{ marginTop: 10 }}>{vision}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--timeline">
        <div className="container">
          <Reveal>
            <SectionHead kicker="OUR JOURNEY" title="From a 2-person studio to 24+ team" />
          </Reveal>

          <div className="zigzag-timeline">
            {timeline.map(([y, t, d], idx) => {
              const isLeft = idx % 2 === 0;
              const theme = TIMELINE_THEMES[idx % TIMELINE_THEMES.length];
              return (
                <Reveal key={y + idx} delay={idx * 80}>
                  <div
                    className={`zigzag-item ${isLeft ? "zigzag-item--left" : "zigzag-item--right"}`}
                    style={{
                      "--step-color": `var(--timeline-color-${idx % TIMELINE_THEMES.length})`,
                      "--step-glow": `var(--timeline-glow-${idx % TIMELINE_THEMES.length})`,
                    } as React.CSSProperties}
                  >

                    {/* Circle Node */}
                    <div className="zigzag-item__col zigzag-item__col--triangle">
                      <div className="timeline-circle-node">
                        <Icon name={theme.icon} size={22} />
                      </div>
                    </div>

                    <div className="zigzag-item__col zigzag-item__col--text">
                      <div className="zigzag-year">{y}</div>
                      <h3 className="zigzag-title">{t}</h3>
                      <p className="zigzag-desc">{d}</p>
                    </div>

                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider from="#ffffff" to="#F7F9FC" />

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <SectionHead kicker="MEET OUR TEAM" title="Senior designers, developers & strategists" />
          </Reveal>
          <div className="team-grid">
            {team.map((m, idx) => (
              <Reveal key={m.name + idx} delay={idx * 80}>
                <div className="card hover-lift team-card card--interactive">
                  <div
                    style={{
                      aspectRatio: "1/1",
                      background: m.photo ? `center/cover url(${cldOptimize(m.photo, "w_600")}) no-repeat, ${m.bg}` : m.bg,
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                  <div style={{ padding: 18 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 18 }}>{m.name}</h3>
                    <div className="t-small" style={{ marginTop: 4 }}>{m.role}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 12, color: "#64748B" }}>
                      {m.linkedin ? (
                        <a href={m.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                          <Icon name="linkedin" size={16} />
                        </a>
                      ) : (
                        <Icon name="linkedin" size={16} />
                      )}
                      <Icon name="mail" size={16} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider from="#F7F9FC" to="#ffffff" flip />

      {/* FAQ Section — Structured with FAQList and SchemaMarkup for SEO / GEO / AEO */}
      <section id="s-faq" className="section">
        <div className="container">
          <Reveal>
            <SectionHead kicker="FAQ" title="Frequently Asked Questions" />
          </Reveal>
          <SchemaMarkup data={faqSchema(ABOUT_FAQ.map(([q, a]) => ({ q, a })))} />
          <FAQList items={ABOUT_FAQ} />
        </div>
      </section>

      <CTABanner
        title="Let's Build Something Great Together."
        sub="Quick chat · No obligation · Reply within 4 hours."
      />
    </>
  );
}
