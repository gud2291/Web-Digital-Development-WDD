import Link from "next/link";
import { Badge, Btn, CTABanner, PH, Reveal } from "@/components/ui";
import { CldImage } from "@/components/CldImage";
import { ProjectsGrid, type ProjectCardData } from "@/components/public/ProjectsGrid";
import { listProjects } from "@/server/services/project.service";
import { metadataFromDb } from "@/lib/seo";

// ISR (A3): cache for 1h; admin edits appear within the window. Safe — this page
// reads no per-request data (no searchParams/preview), only published CMS content.
export const revalidate = 3600;

export async function generateMetadata() {
  return metadataFromDb("projects", {
    path: "/projects",
    title: "Website Design Portfolio",
    description:
      "Browse 150+ websites we've shipped — e-commerce, tourism, corporate and automotive — each with a live link you can open and check for yourself.",
  });
}

const FEATURED_STATS: [string, string][] = [
  ["+420%", "Bookings"],
  ["3.1s→0.9s", "Page speed"],
  ["8 weeks", "Delivery"],
];

const PROJECT_BGS = ["#FCE7F3", "#DBE7FE", "#FEF3C7", "#DCFCE7", "#EDE9FE", "#FFE4E6", "#EFF6FF", "#FEE2E2"];

const FALLBACK_PROJECTS: ProjectCardData[] = [
  { id: "f1", title: "Orgway Agritech", category: "Agriculture", description: "Organic farming and agri-tech company website", image: "https://res.cloudinary.com/dt4i2xbs8/image/upload/v1781235883/wdd/projects/orgway_screenshot_1781235874644.gif", liveUrl: "https://orgwayagritech.com", bg: "#FCE7F3" },
  { id: "f2", title: "Sahayog Solar", category: "Solar Energy", description: "Solar energy solutions provider website", image: "", liveUrl: "https://www.sahayogsolar.com", bg: "#DBE7FE" },
  { id: "f3", title: "Ajay Kumar Singhal", category: "Portfolio", description: "Professional personal portfolio website", image: "", liveUrl: "https://ajaykumarsinghal.com", bg: "#FEF3C7" },
  { id: "f4", title: "Expoed", category: "Web", description: "Corporate website for Spain-based company", image: "", liveUrl: "https://expoed.es", bg: "#DCFCE7" },
  { id: "f5", title: "SBM Greens", category: "Web", description: "Plantation and green solutions company", image: "", liveUrl: "https://sbmgreens.com/", bg: "#EDE9FE" },
  { id: "f6", title: "Vishwakarma Tourist Service", category: "Tourism", description: "Tourism service with tour packages", image: "", liveUrl: "https://vishwakarmatouristservice.com/", bg: "#FFE4E6" },
];

export default async function ProjectsPage() {
  const projectsRaw = await listProjects().catch(() => []);

  const all: ProjectCardData[] = projectsRaw.length
    ? projectsRaw.map((p, i) => ({
        id: String(p._id),
        title: p.title,
        slug: p.slug || undefined,
        category: p.category || "Web",
        description: p.description || "",
        image: p.image || "",
        liveUrl: p.liveUrl || "",
        bg: PROJECT_BGS[i % PROJECT_BGS.length],
      }))
    : FALLBACK_PROJECTS;

  const featuredRaw = projectsRaw.find((p) => p.featured);
  const featured = featuredRaw
    ? {
        id: String(featuredRaw._id),
        title: featuredRaw.title,
        slug: featuredRaw.slug || "",
        description: featuredRaw.description || "",
        image: featuredRaw.image || "",
        imageAlt: featuredRaw.imageAlt || "",
        liveUrl: featuredRaw.liveUrl || "",
      }
    : null;

  const nonFeatured = featured ? all.filter((p) => p.id !== featured.id) : all;
  const categories = ["All Projects", ...Array.from(new Set(all.map((p) => p.category))).slice(0, 8)];

  return (
    <>
      <section className="page-banner">
        <div className="container" style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
          <Reveal><h1 className="t-h1">Our Portfolio</h1></Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 14 }}>
              Real businesses with real customers — e-commerce, tourism, corporate and automotive.
              Click any card to read the story and open the live site.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ paddingTop: 64, paddingBottom: 48 }}>
        <div className="container">
          <Reveal>
            <div className="card hover-lift featured-project">
              <div className="featured-project__left">
                <Badge style={{ background: "rgba(255,255,255,.18)", color: "#fff", marginBottom: 18 }}>
                  FEATURED PROJECT
                </Badge>
                <h2 className="t-h2" style={{ color: "#fff" }}>
                  {featured?.title || "MediCare Healthcare Website"}
                </h2>
                <p style={{ marginTop: 14, color: "rgba(255,255,255,.85)", fontSize: 17 }}>
                  {featured?.description ||
                    "Built a doctor-booking platform with online consultation. Bookings up 4.2× in 90 days."}
                </p>
                <div className="featured-project__stats">
                  {FEATURED_STATS.map(([v, l]) => (
                    <div key={l}>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{v}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
                  {featured?.liveUrl ? (
                    <a href={featured.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Btn size="lg" style={{ background: "#fff", color: "#1D4ED8" }} iconRight="arrowRight">
                        Live Preview
                      </Btn>
                    </a>
                  ) : (
                    <Btn size="lg" style={{ background: "#fff", color: "#1D4ED8" }} iconRight="arrowRight">
                      View Case Study
                    </Btn>
                  )}
                  {featured?.slug ? (
                    <Link href={`/projects/${featured.slug}`}>
                      <Btn
                        size="lg"
                        variant="ghost"
                        style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
                        iconRight="arrowRight"
                      >
                        Case Study
                      </Btn>
                    </Link>
                  ) : (
                    <Btn
                      size="lg"
                      variant="ghost"
                      style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
                    >
                      Case Study
                    </Btn>
                  )}
                </div>
              </div>
              <div className="featured-project__right" style={{ position: "relative" }}>
                {featured?.image ? (
                  <CldImage
                    src={featured.image}
                    alt={featured.imageAlt || featured.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 540px"
                    style={{ objectFit: "cover", objectPosition: "top left" }}
                  />
                ) : (
                  <PH h="100%" label={featured?.title ? `${featured.title} hero shot` : "MediCare hero shot"} variant="solid" style={{ minHeight: 300 }} />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ProjectsGrid projects={nonFeatured} categories={categories} />

      <CTABanner
        variant="dark"
        title="Like what you see? Let's build yours."
        sub="A quick chat to scope your project — no obligation."
      />
    </>
  );
}
