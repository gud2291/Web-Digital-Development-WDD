import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Badge, Btn, CTABanner, PH, Reveal, SectionHead } from "@/components/ui";
import { CldImage } from "@/components/CldImage";
import { BeforeAfter } from "@/components/public/BeforeAfter";
import { cldOptimize } from "@/lib/cloudinary";
import {
  getProjectBySlug,
  listProjects,
} from "@/server/services/project.service";
import { getServicesBySlugs } from "@/server/services/service.service";
import { RelatedSection, type RelatedItem } from "@/components/public/RelatedSection";
import { metadataFromDb, buildMetadata } from "@/lib/seo";
import { SchemaMarkup, breadcrumbSchema } from "@/components/SchemaMarkup";

// ISR (A3): cache for 1h. Safe — no per-request data (no searchParams/preview);
// uses generateStaticParams to prerender known projects and on-demand ISR for the
// rest. Missing slugs still 404 via notFound().
export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug).catch(() => null);
  if (!project)
    return buildMetadata({ title: "Project", path: `/projects/${params.slug}` });
  return metadataFromDb(`projects/${params.slug}`, {
    path: `/projects/${params.slug}`,
    title: project.title,
    description:
      project.description?.slice(0, 160) ||
      `${project.title} — a project by Web Digital Development.`,
    ogImage: project.image || undefined,
  });
}

export async function generateStaticParams() {
  const projects = await listProjects().catch(() => []);
  return projects
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug as string }));
}

const PROJECT_BGS = [
  "#FCE7F3",
  "#DBE7FE",
  "#FEF3C7",
  "#DCFCE7",
  "#EDE9FE",
  "#FFE4E6",
];

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug).catch(() => null);
  if (!project) notFound();

  // Fetch related projects (same category, excluding this one)
  const allProjects = await listProjects({ category: project.category }).catch(
    () => []
  );
  const related = allProjects
    .filter((p) => String(p._id) !== String(project._id))
    .slice(0, 3);

  // §INTERNAL-LINKING — the service(s) this project used ("Service used").
  const serviceUsedDocs = await getServicesBySlugs(
    (project.relatedServices as string[] | undefined) ?? []
  ).catch(() => []);
  const serviceUsedItems: RelatedItem[] = serviceUsedDocs.map((s) => ({
    href: `/services/${s.slug}`,
    title: s.title as string,
    label: "Service used",
    desc: (s.shortDescription as string) || undefined,
  }));

  return (
    <>
      <SchemaMarkup
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Portfolio", url: "/projects" },
          { name: project.title, url: `/projects/${project.slug}` },
        ])}
      />

      {/* ── Hero banner ── */}
      <section className="page-banner" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="breadcrumb">
            <span>Home</span>
            <Icon name="chevRight" size={12} />
            <Link href="/projects">Portfolio</Link>
            <Icon name="chevRight" size={12} />
            <b>{project.title}</b>
          </div>
          <div className="two-col" style={{ paddingTop: 24, paddingBottom: 64 }}>
            <div>
              <Reveal>
                <Badge>
                  <Icon name="layers" size={12} />
                  &nbsp;{project.category || "Web"}
                </Badge>
              </Reveal>
              <Reveal delay={60}>
                <h1 className="t-h1" style={{ marginTop: 14 }}>
                  {project.title}
                </h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="t-lead" style={{ marginTop: 18 }}>
                  {project.description ||
                    "A custom-built digital solution designed to deliver results."}
                </p>
              </Reveal>
              <Reveal delay={180}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 28,
                    flexWrap: "wrap",
                  }}
                >
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Btn size="lg" iconRight="arrowRight">
                        Visit Live Site
                      </Btn>
                    </a>
                  )}
                  <Link href="/contact">
                    <Btn
                      size="lg"
                      variant={project.liveUrl ? "secondary" : "primary"}
                      iconRight="arrowRight"
                    >
                      Start Your Project
                    </Btn>
                  </Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}>
              {project.image ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 380,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <CldImage
                    src={project.image}
                    alt={project.imageAlt || project.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 580px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <PH
                  h={380}
                  variant="solid"
                  label={`${project.title} hero shot`}
                  style={{ borderRadius: 16 }}
                />
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── §13.2 Before/After (Expoed only) ── */}
      {project.slug === "expoed" && project.image && (
        <section className="section section--alt">
          <div className="container" style={{ maxWidth: 980, margin: "0 auto" }}>
            <Reveal>
              <SectionHead kicker="THE TRANSFORMATION" title="Before / after — drag to compare" />
            </Reveal>
            <Reveal delay={60}>
              <BeforeAfter
                before={cldOptimize(project.image, "e_grayscale,e_blur:300,e_brightness:-15")}
                after={cldOptimize(project.image)}
                beforeLabel="Old site"
                afterLabel="Our redesign"
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Overview / About the client ── */}
      {project.clientBackground && (
        <section className="section">
          <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
            <Reveal>
              <SectionHead
                kicker="OVERVIEW"
                title="About the client"
                align="left"
              />
            </Reveal>
            <Reveal delay={60}>
              <p className="t-lead" style={{ whiteSpace: "pre-line" }}>
                {project.clientBackground}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── The Challenge ── */}
      {project.objective && (
        <section className="section section--alt">
          <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
            <Reveal>
              <SectionHead
                kicker="THE CHALLENGE"
                title="The problem we set out to solve"
                align="left"
              />
            </Reveal>
            <Reveal delay={60}>
              <p className="t-lead" style={{ whiteSpace: "pre-line" }}>
                {project.objective}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Our Solution ── */}
      {project.solution && (
        <section className="section">
          <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
            <Reveal>
              <SectionHead
                kicker="OUR SOLUTION"
                title="What we built"
                align="left"
              />
            </Reveal>
            <Reveal delay={60}>
              <p className="t-lead" style={{ whiteSpace: "pre-line" }}>
                {project.solution}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Key Features ── */}
      {project.features && project.features.length > 0 && (
        <section className="section section--alt">
          <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
            <Reveal>
              <SectionHead
                kicker="KEY FEATURES"
                title="What's inside"
                align="left"
              />
            </Reveal>
            <Reveal delay={60}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 16,
                  marginTop: 8,
                }}
              >
                {project.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "#EFF6FF",
                        color: "#1E40AF",
                        marginTop: 2,
                      }}
                    >
                      <Icon name="check" size={15} />
                    </span>
                    <span className="t-small" style={{ color: "var(--c-text)" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Tech stack ── */}
      {project.tech && project.tech.length > 0 && (
        <section className="section">
          <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
            <Reveal>
              <SectionHead
                kicker="TECHNOLOGY STACK"
                title="Built with modern tools"
              />
            </Reveal>
            <Reveal delay={60}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="pill"
                    style={{
                      background: "#EFF6FF",
                      color: "#1E40AF",
                      fontWeight: 600,
                      fontSize: 14,
                      padding: "8px 18px",
                      borderRadius: 40,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Timeline ── */}
      {project.timeline && (
        <section className="section section--alt">
          <div
            className="container"
            style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}
          >
            <Reveal>
              <Badge>
                <Icon name="clock" size={12} />
                &nbsp;TIMELINE
              </Badge>
            </Reveal>
            <Reveal delay={60}>
              <p className="t-lead" style={{ marginTop: 14 }}>
                {project.timeline}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── §INTERNAL-LINKING: Service(s) used ── */}
      <RelatedSection
        kicker="SERVICE USED"
        title="How we built this"
        sub="The service behind this project — explore what we can do for you."
        items={serviceUsedItems}
      />

      {/* ── Related Projects ── */}
      {related.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <Reveal>
              <SectionHead
                kicker="MORE PROJECTS"
                title="Related Work"
                sub={`More ${project.category || "web"} projects we've delivered.`}
              />
            </Reveal>
            <div className="projects-grid" style={{ marginTop: 32 }}>
              {related.map((r, idx) => (
                <Reveal key={String(r._id)} delay={idx * 60}>
                  <Link
                    href={r.slug ? `/projects/${r.slug}` : "/projects"}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <article className="card card--hover project-card card--interactive">
                      <div
                        className="project-card__img"
                        style={{
                          background: r.image
                            ? `center/cover url(${cldOptimize(r.image, "w_600")}) no-repeat, ${PROJECT_BGS[idx % PROJECT_BGS.length]}`
                            : PROJECT_BGS[idx % PROJECT_BGS.length],
                        }}
                      >
                        <Badge
                          kind="neutral"
                          style={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                          }}
                        >
                          {r.category || "Web"}
                        </Badge>
                      </div>
                      <div className="project-card__body">
                        <h3 className="t-h4" style={{ fontSize: 18 }}>
                          {r.title}
                        </h3>
                        {/* §14.13 — strict 2-line clamp; never the full case-study body. */}
                        <p className="t-small" style={{ marginTop: 6 }}>
                          {r.description || ""}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            marginTop: 12,
                          }}
                        >
                          <span
                            style={{
                              color: "#2563EB",
                              fontSize: 13,
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            View <Icon name="arrowRight" size={12} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/projects">
                <Btn variant="secondary" iconRight="arrowRight">
                  View All Projects
                </Btn>
              </Link>
            </div>
          </div>
        </section>
      )}

      <CTABanner
        variant="dark"
        title="Impressed? Let's build yours."
        sub="A quick chat to scope your project — no obligation."
      />
    </>
  );
}
