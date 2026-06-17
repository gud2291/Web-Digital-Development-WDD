import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import {
  Badge,
  Btn,
  CTABanner,
  Eyebrow,
  PH,
  Reveal,
  RevealStagger,
  RevealItem,
  SectionHead,
} from "@/components/ui";
import { Counter } from "@/components/public/Counter";
import { MagneticButton } from "@/components/public/MagneticButton";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import { TrustMarquee } from "@/components/public/TrustMarquee";
import { ProjectsCarousel } from "@/components/public/ProjectsCarousel";
import { TestimonialsCarousel } from "@/components/public/TestimonialsCarousel";
import { ProcessSteps } from "@/components/public/ProcessSteps";
import { GradientMesh } from "@/components/public/GradientMesh";
import { SectionDivider } from "@/components/public/SectionDivider";
import { getHomepage } from "@/server/services/homepage.service";
import { getCachedSiteContent } from "@/server/services/siteContent.service";
import { getPreviewDoc } from "@/server/preview/getPreviewDoc";
import { listServices } from "@/server/services/service.service";
import { listProjects } from "@/server/services/project.service";
import { listTestimonials } from "@/server/services/testimonial.service";
import { listBlogs } from "@/server/services/blog.service";
import { safeIcon } from "@/lib/iconMap";
import { formatDate } from "@/lib/utils";
import { metadataFromDb } from "@/lib/seo";
import { HeroSceneWrapper } from "@/components/3d/HeroSceneWrapper";
import { HeroSlider } from "@/components/public/HeroSlider";
import { SafeImage } from "@/components/public/SafeImage";
import { FAQList } from "@/components/FAQList";
import { SchemaMarkup, faqSchema, businessReviewsSchema, speakableSchema } from "@/components/SchemaMarkup";

// ISR: cached HTML for fast loads; admin saves call revalidatePath("/") so edits
// appear immediately. Drafts render via draftMode() (see getPreviewDoc), which
// only bypasses the cache for an editor — never for normal visitors.
export const revalidate = 3600;

export async function generateMetadata() {
  return metadataFromDb("home", { path: "/" });
}

const FALLBACK_STATS: [string, string, string, IconName][] = [
  ["400+", "Websites Delivered", "#4ADE80", "rocket"],
  ["250+", "Happy Clients", "#2563EB", "users"],
  ["6+", "Years in Business", "#F59E0B", "award"],
  ["24×7", "WhatsApp Support", "#8B5CF6", "shield"],
];

// "Who We Are" — services we bring to the table, each linked to its page.
// [title, description, service slug] — slugs verified against seed-content.ts.
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

const CHECKS: [string, string][] = [
  ["Custom design", "No templates. Every site is unique."],
  ["Conversion-first", "Designed to turn visitors into leads."],
  ["SEO-ready", "Built to rank from day one."],
  ["1-month support", "We don't ghost after launch."],
];

const FALLBACK_SERVICES: [IconName, string, string, string, string][] = [
  [
    "monitor",
    "Website Design",
    "Beautiful, conversion-focused websites tailored to your brand.",
    "#2563EB",
    "website-design",
  ],
  [
    "code",
    "Website Development",
    "Fast, secure, scalable websites built with modern tech.",
    "#EC4899",
    "website-development",
  ],
  [
    "search",
    "SEO Optimization",
    "Rank higher on Google and attract qualified leads.",
    "#22C55E",
    "seo",
  ],
  ["cart", "E-commerce", "Online stores that sell, ship and scale.", "#F59E0B", "ecommerce"],
  [
    "megaphone",
    "Digital Marketing",
    "Ads, content and social that drive measurable growth.",
    "#8B5CF6",
    "digital-marketing",
  ],
  [
    "smartphone",
    "Mobile-First UI",
    "Designs that look perfect on every device.",
    "#14B8A6",
    "mobile-ui",
  ],
];

const FALLBACK_PROJECTS: [string, string, string, IconName, string][] = [
  ["Orgway Agritech", "Agriculture", "#EFF6FF", "monitor", "https://orgwayagritech.com"],
  ["Sahayog Solar", "Solar Energy", "#FCE7F3", "monitor", "https://www.sahayogsolar.com"],
  ["Ajay Kumar Singhal", "Portfolio", "#FEF3C7", "monitor", "https://ajaykumarsinghal.com"],
];

const FALLBACK_TESTIMONIALS: [string, string, string, string, string][] = [
  [
    "Rohit Sharma",
    "CEO, UrbanSpace",
    "Our web traffic doubled in three months. Highly professional team — every milestone hit on time.",
    "RS",
    "#1B4DA8",
  ],
  [
    "Priya Verma",
    "Founder, Bloom Café",
    "Beautiful site, very easy to update ourselves. Bookings increased by 60% within weeks.",
    "PV",
    "#EC4899",
  ],
  [
    "Amit Gupta",
    "Director, FinPro",
    "They built our complete e-commerce platform. Sales up 3.2× in 6 months. Best agency we've worked with.",
    "AG",
    "#22C55E",
  ],
];

const FALLBACK_BLOGS: [string, string, string, string, string][] = [
  ["10 Web Design Best Practices to Follow in 2026", "Web Design", "6 min", "May 6, 2026", ""],
  ["Why Your Business Needs a Modern Website Today", "Business", "4 min", "May 4, 2026", ""],
  ["SEO Trends That Will Dominate 2026", "SEO", "8 min", "May 2, 2026", ""],
];

const FALLBACK_TRUST_LOGOS = ["Expoed", "SBM Greens", "Vishwakarma Tour", "Shree Namo Motar"];

// Homepage FAQ (C2 / AEO). Answers are factual and consistent with the rest of
// the site (Palam, New Delhi · since 2019 · 400+ sites · 3–5 week delivery ·
// 1-month support). The visible FAQList below and the FAQPage JSON-LD are built
// from this same array, so the schema mirrors exactly what users see.
const HOME_FAQ: [string, string][] = [
  [
    "How much does a website cost in Delhi?",
    "It depends on the scope. We share a clear, fixed quote after a short discovery call — no hidden charges. Book a free consultation and we'll give you an exact figure for your project.",
  ],
  [
    "How long does it take to build a website?",
    "Most websites go live in 3–5 weeks. Larger e-commerce or fully custom builds can take 6–8 weeks, depending on content readiness and how quickly feedback comes back.",
  ],
  [
    "Do you provide SEO along with website design?",
    "Yes. Every website we build is SEO-ready from day one, and we offer dedicated SEO packages for businesses that want to rank higher and grow traffic faster.",
  ],
  [
    "Will my website work well on mobile phones?",
    "Absolutely. Every site is mobile-first and fully responsive, so it looks and works perfectly across phones, tablets and desktops.",
  ],
  [
    "Do you work with businesses outside Delhi?",
    "Yes. We're based in Palam, New Delhi, but we've delivered 400+ websites for clients across India and abroad. The entire process can be handled online.",
  ],
  [
    "What happens after my website launches?",
    "Every project includes one month of free support. After that, optional maintenance plans cover updates, security, backups and content edits.",
  ],
];

const ACCENT_COLORS = ["#22C55E", "#2563EB", "#F59E0B", "#8B5CF6"];
const PROJECT_BGS = ["#EFF6FF", "#FCE7F3", "#FEF3C7", "#DCFCE7", "#FEE2E2", "#E0E7FF"];
const TESTIMONIAL_AVATAR_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#8B5CF6"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

export default async function HomePage() {
  const previewHomepage = await getPreviewDoc<Record<string, unknown>>("homepage");
  const [homepageRaw, siteContentDb, servicesRaw, projectsRaw, testimonialsRaw, blogResult] = await Promise.all([
    getHomepage().catch(() => null),
    getCachedSiteContent().catch(() => null),
    listServices().catch(() => []),
    listProjects().catch(() => []),
    listTestimonials().catch(() => []),
    listBlogs({ page: 1, limit: 3 }).catch(() => ({
      items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
    })),
  ]);

  const homepage = (previewHomepage as unknown as typeof homepageRaw) ?? homepageRaw;
  const siteContent = siteContentDb;
  const aboutHeroImage = siteContent?.about?.heroImage || "https://res.cloudinary.com/dt4i2xbs8/image/upload/f_auto,q_auto/wdd/about/our-story";

  const stats: [string, string, string, IconName][] = homepage?.stats?.length
    ? homepage.stats
        .slice(0, 4)
        .map((s, i): [string, string, string, IconName] => [
          s.value,
          s.label,
          FALLBACK_STATS[i % FALLBACK_STATS.length][2],
          FALLBACK_STATS[i % FALLBACK_STATS.length][3],
        ])
    : FALLBACK_STATS;

  const services = servicesRaw.length
    ? servicesRaw.slice(0, 6).map((s, i) => ({
        icon: safeIcon(s.icon, FALLBACK_SERVICES[i % FALLBACK_SERVICES.length][0]),
        iconName: s.iconName || "Globe",
        accentColor: s.accentColor || (["blue", "green", "orange", "purple"] as const)[i % 4],
        title: s.title,
        desc: s.shortDescription || "",
        color: ACCENT_COLORS[i % ACCENT_COLORS.length],
        slug: s.slug,
      }))
    : FALLBACK_SERVICES.map(([icon, title, desc, color, slug]) => ({
        icon,
        iconName: "Globe",
        accentColor: "blue",
        title,
        desc,
        color,
        slug,
      }));

  // §4 — ALL visible projects (admin order), deduped by slug/_id. No cap.
  const seenProjects = new Set<string>();
  const projects = projectsRaw.length
    ? projectsRaw
        .filter((p) => {
          const key = String((p as { slug?: string }).slug || p._id);
          if (seenProjects.has(key)) return false;
          seenProjects.add(key);
          return true;
        })
        .map((p, i) => ({
          title: p.title,
          slug: (p as { slug?: string }).slug || "",
          category: p.category || "Project",
          bg: PROJECT_BGS[i % PROJECT_BGS.length],
          icon: "monitor" as IconName,
          liveUrl: p.liveUrl || "",
          description: p.description || "Conversion-focused redesign that lifted leads.",
          image: p.image || "",
        }))
    : FALLBACK_PROJECTS.map(([title, category, bg, icon, liveUrl]) => ({
        title,
        slug: "",
        category,
        bg,
        icon,
        liveUrl,
        description: "Conversion-focused redesign that lifted leads by 2.4×.",
        image: "",
      }));

  const testimonials = testimonialsRaw.length
    ? testimonialsRaw.slice(0, 4).map((t, i) => ({
        name: t.clientName,
        role: t.clientCompany || "",
        quote: t.message,
        initials: initialsOf(t.clientName),
        color: TESTIMONIAL_AVATAR_COLORS[i % TESTIMONIAL_AVATAR_COLORS.length],
        rating: t.rating ?? 5,
        photo: t.clientPhoto || "",
      }))
    : FALLBACK_TESTIMONIALS.map(([name, role, quote, initials, color]) => ({
        name,
        role,
        quote,
        initials,
        color,
        rating: 5,
        photo: "",
      }));

  const blogs = blogResult.items?.length
    ? blogResult.items.slice(0, 3).map((b) => ({
        title: b.title,
        category: b.category || "General",
        readTime: `${b.readTime ?? 5} min`,
        date: formatDate(b.createdAt),
        slug: b.slug,
        image: b.featuredImage || "",
      }))
    : FALLBACK_BLOGS.map(([title, category, readTime, date, slug]) => ({
        title,
        category,
        readTime,
        date,
        slug,
        image: "",
      }));

  const trustLogos = homepage?.clientLogos?.length
    ? homepage.clientLogos.filter((l) => l.visible).map((l) => l.name)
    : FALLBACK_TRUST_LOGOS;

  const sectionTitles = homepage?.sectionTitles ?? null;
  const ctaBanner = homepage?.ctaBanner ?? null;

  // Prepare all hero slides for the slider component
  const heroSlides = (homepage?.heroSlides ?? []).map((s) => ({
    type: (s.type as string) || "image",
    image: (s.image as string) || "",
    video: (s.video as string) || "",
    title: (s.title as string) || "",
    subtitle: (s.subtitle as string) || "",
    ctaText: (s.ctaText as string) || "",
    ctaUrl: (s.ctaUrl as string) || "",
  }));
  const hasSlides = heroSlides.length > 0;

  return (
    <>
      {/* D5 — Speakable: voice assistants read the hero headline + lead, which
          are always server-rendered (the primary spoken answer for this page). */}
      <SchemaMarkup data={speakableSchema(["#s-hero h1", "#s-hero .t-lead"])} />
      {/* Hero */}
      <section
        id="s-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          background: hasSlides ? "#0B1B3B" : undefined,
          minHeight: 600,
        }}
        className={hasSlides ? undefined : "hero"}
      >
        <GradientMesh />
        {hasSlides ? (
          <HeroSlider slides={heroSlides} badgeText={sectionTitles?.badge} interval={6000} />
        ) : (
          <>
            <HeroSceneWrapper />
            <div
              className="container"
              style={{
                position: "relative",
                zIndex: 10,
                padding: "100px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
              }}
            >
              <div
                className="hero__text"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  maxWidth: 800,
                }}
              >
                <Reveal>
                  <div className="hero__pill">
                    <span className="hero__dot" />
                    {sectionTitles?.badge || "Available for new projects — May 2026"}
                  </div>
                </Reveal>
                <Reveal delay={80}>
                  <h1 className="t-h1">
                    Build a Website That <span style={{ color: "#4ADE80" }}>Brings Real</span>
                    <br />
                    Business Leads.
                  </h1>
                </Reveal>
                <Reveal delay={160}>
                  <p
                    className="t-lead"
                    style={{
                      marginTop: 22,
                      maxWidth: 540,
                    }}
                  >
                    We design and develop modern, responsive websites that attract qualified
                    visitors and turn them into paying customers. Delhi-based, results-obsessed.
                  </p>
                </Reveal>
                <Reveal delay={220}>
                  <div className="hero__btns" style={{ justifyContent: "flex-start" }}>
                    <MagneticButton>
                      <Link href="/contact">
                        <Btn size="lg" iconRight="arrowRight">
                          Book a Consultation
                        </Btn>
                      </Link>
                    </MagneticButton>
                    <MagneticButton>
                      <Link href="/projects">
                        <Btn size="lg" variant="secondary" iconRight="arrowRight">
                          See Our Work
                        </Btn>
                      </Link>
                    </MagneticButton>
                  </div>
                </Reveal>
                <Reveal delay={300}>
                  <div className="hero__trust">
                    {/* §14.13 — single text-only trust badge (no avatar strip). */}
                    <span className="hero-trust-badge">⭐ 4.9 / 5 — 130+ clients</span>
                  </div>
                </Reveal>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Trust Bar — §12.10 infinite marquee */}
      <div id="s-trust">
        <TrustMarquee logos={trustLogos} label="Trusted by 400+ businesses across India and abroad" />
      </div>

      {/* Stats */}
      <section id="s-stats" className="section section--sm">
        <RevealStagger className="stats-grid container">
          {stats.map(([v, l, c, ic]) => (
            <RevealItem key={l}>
              <div className="card stat-card">
                <div className="stat-card__icon" style={{ background: c + "1F", color: c }}>
                  <Icon name={ic} size={24} />
                </div>
                <div>
                  <div className="stat-card__val" style={{ color: c }}>
                    <Counter value={v} />
                  </div>
                  <div className="t-small">{l}</div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      {/* Who We Are — additive section, sits directly above the About Us section.
          Server-rendered, keyword-rich text; main title is an h2, sub-headings h3. */}
      <section id="s-who-we-are" className="section">
        <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
          <Reveal>
            <Eyebrow>WHO WE ARE</Eyebrow>
            <h2 className="t-h2" style={{ marginTop: 14 }}>
              Who We Are
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="t-lead" style={{ marginTop: 16 }}>
              Since 2019, we&apos;ve been doing what we love — helping businesses show up online the
              right way.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="t-small" style={{ marginTop: 16 }}>
              Web Digital Development is an Indian web design and development company built on one
              simple belief: your website should work as hard as you do. From the moment a visitor
              lands on your page, we want them to feel confident about your brand — and that takes
              more than just good looks.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <p className="t-small" style={{ marginTop: 16 }}>
              Over the past few years, we&apos;ve partnered with businesses across industries to build
              websites that don&apos;t just exist online, but actually perform. Whether you&apos;re
              starting from scratch or ready for a fresh redesign, our team brings together research,
              strategy, creative design, and technical development to deliver something you&apos;ll be
              genuinely proud of.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="t-h3" style={{ marginTop: 40 }}>
              What We Bring to the Table
            </h3>
            <p className="t-small" style={{ marginTop: 12 }}>
              We&apos;re not a one-size-fits-all agency. Every project we take on starts with
              understanding your business — your goals, your audience, and what makes you different.
              From there, we put our expertise to work across:
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
              Think about the last time you visited a website that felt clunky, slow, or just plain
              confusing. Chances are, you left — and didn&apos;t come back.
            </p>
            <p className="t-small" style={{ marginTop: 16 }}>
              That&apos;s the reality of doing business online today. Your website is often the very
              first interaction someone has with your brand. It&apos;s your digital storefront, your
              business card, and your most accessible point of contact — all rolled into one.
            </p>
            <p className="t-small" style={{ marginTop: 16 }}>
              A well-designed website builds trust instantly. A poorly designed one can cost you
              customers before they even read a single word. That&apos;s why we take every project
              seriously, no matter the size.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="t-h3" style={{ marginTop: 40 }}>
              Built for Businesses That Mean Business
            </h3>
            <p className="t-small" style={{ marginTop: 12 }}>
              At Web Digital Development, we&apos;ve spent years (since 2019) refining our process so
              that what you get isn&apos;t just a beautiful website — it&apos;s a reliable digital
              asset that supports your growth.
            </p>
            <p className="t-small" style={{ marginTop: 16 }}>
              Our team of experienced designers and developers stays up to date with the latest web
              standards, design trends, and search engine best practices. So when we hand over your
              website, it&apos;s not just ready to launch — it&apos;s ready to perform.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="t-h3" style={{ marginTop: 40 }}>
              Let&apos;s Build Something Great Together
            </h3>
            <p className="t-small" style={{ marginTop: 12 }}>
              Whether you&apos;re a startup finding your footing or an established business ready to
              level up your online presence, we&apos;re here to help. Tell us about your project and
              let&apos;s talk about what we can build for you.
            </p>
            <Link href="/contact">
              <Btn variant="outline" iconRight="arrowRight" style={{ marginTop: 22 }}>
                Start a Conversation
              </Btn>
            </Link>
          </Reveal>
        </div>
      </section>

      <SectionDivider from="#ffffff" to="#F7F9FC" />

      {/* About Preview */}
      <section id="s-about" className="section section--alt">
        <div className="about-preview container">
          <div>
            <Reveal>
              <Eyebrow>ABOUT US</Eyebrow>
              <h2 className="t-h2" style={{ marginTop: 14 }}>
                Built in Delhi. Trusted across India and abroad. Since 2019.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="t-lead" style={{ marginTop: 16 }}>
                I&apos;m Gudia Yadav. I started Web Digital Development in Palam, New Delhi, in 2019 —
                with one laptop and one belief. A small business deserves a website as good as a big
                company gets, without the big-company invoice. Six years on, there are six of us in
                one office. We&apos;ve shipped 400+ websites for clients across India and abroad. And I
                still review every design before it goes live.
              </p>
            </Reveal>
            <Reveal delay={150}>
              {/* §E2 — semantic list (was divs). Inline reset keeps the exact grid
                  look from .about-preview__checks (no <ul> default margin/padding/marker). */}
              <ul className="about-preview__checks" style={{ listStyle: "none", margin: 0, marginTop: 22, padding: 0 }}>
                {CHECKS.map(([t, d]) => (
                  <li key={t} className="check-item" style={{ listStyle: "none" }}>
                    <div className="check-item__icon">
                      <Icon name="check" size={12} stroke={3} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t}</div>
                      <div className="t-small">{d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={200}>
              <Link href="/about">
                <Btn size="lg" iconRight="arrowRight" style={{ marginTop: 28 }}>
                  About the Studio
                </Btn>
              </Link>
            </Reveal>
          </div>
          <div
            style={{
              position: "relative",
              height: "100%",
              minHeight: 400,
              width: "100%",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <SafeImage
              src={aboutHeroImage}
              alt="Web Digital Development studio workspace in Delhi"
              fallbackLabel="Web Digital Development Studio, Delhi"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        </div>
      </section>

      <SectionDivider from="#F7F9FC" to="#ffffff" flip />

      {/* Services Grid */}
      <section id="s-services" className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              kicker="WHAT WE DO"
              title={sectionTitles?.services || "Our Digital Services"}
              sub="Everything you need to launch, grow and rank online — under one roof."
            />
          </Reveal>
          <RevealStagger className="services-grid">
            {services.map((s) => (
              <RevealItem key={s.title}>
                <div className="card card--interactive">
                  <ServiceIcon iconName={s.iconName} accentColor={s.accentColor} />
                  <h3 className="t-h4">{s.title}</h3>
                  <p className="t-small" style={{ marginTop: 8 }}>
                    {s.desc}
                  </p>
                  <Link href={s.slug ? `/services/${s.slug}` : "/services"} className="svc-link">
                    View Details <Icon name="arrowRight" size={14} />
                  </Link>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <SectionDivider from="#ffffff" to="#F7F9FC" />

      {/* Projects — §12.11 swipeable carousel */}
      <div id="s-portfolio">
        <ProjectsCarousel projects={projects} title={sectionTitles?.portfolio || "Recent Projects"} />
      </div>

      <SectionDivider from="#F7F9FC" to="#ffffff" flip />

      {/* Process — §12.14 animated step icons */}
      <div id="s-process">
        <ProcessSteps />
      </div>

      <SectionDivider from="#ffffff" to="#F7F9FC" />

      {/* Testimonials — §12.12 carousel */}
      <div id="s-reviews">
        <TestimonialsCarousel
          testimonials={testimonials}
          title={sectionTitles?.testimonials || "What Our Clients Say"}
        />
        {/* C1 — Review items for the testimonials shown above. No aggregateRating
            here: the homepage shows individual reviews but not a computed on-page
            average (see /reviews for the AggregateRating). */}
        <SchemaMarkup
          data={businessReviewsSchema({
            reviews: testimonials.map((t) => ({
              author: t.name,
              rating: t.rating,
              body: t.quote,
            })),
          })}
        />
      </div>

      <SectionDivider from="#F7F9FC" to="#ffffff" flip />

      {/* Blog Preview */}
      <section id="s-blog" className="section">
        <div className="container">
          <Reveal>
            <div className="section-header-row">
              <div>
                <Eyebrow>BLOG</Eyebrow>
                <h2 className="t-h2" style={{ marginTop: 14 }}>
                  Latest Insights
                </h2>
              </div>
              <Link href="/blog">
                <Btn variant="outline" iconRight="arrowRight">
                  All Articles
                </Btn>
              </Link>
            </div>
          </Reveal>
          <div className="blog-grid">
            {blogs.map((b, idx) => (
              <Reveal key={b.title + idx} delay={idx * 80}>
                <Link href={b.slug ? `/blog/${b.slug}` : "/blog"}>
                  <article className="card card--hover blog-card card--interactive">
                    {b.image ? (
                      <div
                        style={{
                          position: "relative",
                          height: 190,
                          width: "100%",
                          borderRadius: "8px 8px 0 0",
                          overflow: "hidden",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.image}
                          alt={b.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <PH h={190} label="article cover" variant={idx === 0 ? "solid" : undefined} />
                    )}
                    <div className="blog-card__body">
                      <Badge>{b.category}</Badge>
                      <h4
                        className="t-h4"
                        style={{ marginTop: 10, fontSize: 18, lineHeight: 1.35 }}
                      >
                        {b.title}
                      </h4>
                      <div
                        className="t-small"
                        style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}
                      >
                        <span>{b.date}</span>
                        <span>{b.readTime} read</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — §C2/AEO. Visible Q&A + matching FAQPage JSON-LD (mirrors HOME_FAQ). */}
      <section id="s-faq" className="section section--alt">
        <div className="container" style={{ maxWidth: 820, margin: "0 auto" }}>
          <Reveal>
            <SectionHead kicker="FAQ" title="Frequently Asked Questions" />
          </Reveal>
          <SchemaMarkup data={faqSchema(HOME_FAQ.map(([q, a]) => ({ q, a })))} />
          <FAQList items={HOME_FAQ} />
        </div>
      </section>

      <div id="s-cta">
        <CTABanner title={ctaBanner?.title || undefined} sub={ctaBanner?.sub || undefined} />
      </div>
    </>
  );
}
