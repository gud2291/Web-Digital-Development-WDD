import { Icon, type IconName } from "@/components/Icon";
import { CTABanner, Eyebrow, Reveal, SectionHead } from "@/components/ui";
import { Counter } from "@/components/public/Counter";
import { SectionDivider } from "@/components/public/SectionDivider";
import { getSiteContent } from "@/server/services/siteContent.service";
import { getPreviewDoc } from "@/server/preview/getPreviewDoc";
import { listTeam } from "@/server/services/team.service";
import { metadataFromDb } from "@/lib/seo";
import { SafeImage } from "@/components/public/SafeImage";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return metadataFromDb("about", {
    path: "/about",
    title: "About Us",
    description:
      "Delhi-based website design and development studio. 400+ websites delivered for 250+ clients across India and abroad since 2019.",
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

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: { preview?: string; token?: string };
}) {
  const [siteContentDb, teamRaw, draft] = await Promise.all([
    getSiteContent().catch(() => null),
    listTeam().catch(() => []),
    getPreviewDoc<Record<string, unknown>>("site-content", searchParams),
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

  return (
    <>
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
          <div style={{ position: "relative", height: "100%", minHeight: 400, width: "100%", borderRadius: 16, overflow: "hidden" }}>
            <SafeImage src={about?.heroImage || "https://res.cloudinary.com/dt4i2xbs8/image/upload/f_auto,q_auto/wdd/about/our-story"} alt="Web Digital Development studio workspace in Delhi" fallbackLabel="WDD Studio, Delhi" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
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
                    Founded in 2018 in Delhi, Web Digital Development started as a two-person
                    studio with a simple belief: small and mid-sized Indian businesses deserve
                    websites as good as the ones global brands enjoy.
                  </p>
                  <p style={{ marginTop: 14, color: "#475569" }}>
                    Today we&apos;re a 24-person team delivering websites, e-commerce stores and
                    full digital growth services to clients across 6 cities — and we&apos;re just
                    getting started.
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
                  <h4 className="t-h4">{t}</h4>
                  <p className="t-small" style={{ marginTop: 6 }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider from="#F7F9FC" to="#ffffff" flip />

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
                      background: m.photo ? `center/cover url(${m.photo}) no-repeat, ${m.bg}` : m.bg,
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                  <div style={{ padding: 18 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 18 }}>{m.name}</h4>
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

      <CTABanner
        title="Let's Build Something Great Together."
        sub="Quick chat · No obligation · Reply within 4 hours."
      />
    </>
  );
}
