"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Badge, Reveal } from "@/components/ui";
import { TiltCard } from "@/components/public/TiltCard";
import { cldOptimize } from "@/lib/cloudinary";

export interface ProjectCardData {
  id: string;
  title: string;
  slug?: string;
  category: string;
  description: string;
  image: string;
  liveUrl: string;
  bg: string;
}

interface Props {
  projects: ProjectCardData[];
  categories: string[];
}

export function ProjectsGrid({ projects, categories }: Props) {
  const [active, setActive] = React.useState<string>(categories[0] ?? "All Projects");

  const visible = React.useMemo(() => {
    if (active === categories[0]) return projects;
    return projects.filter((p) => p.category === active);
  }, [active, projects, categories]);

  return (
    <>
      <div className="container filter-pills">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`pill ${c === active ? "pill--active" : ""}`}
            type="button"
          >
            {c}
          </button>
        ))}
      </div>

      <section style={{ paddingBottom: 80 }}>
        <div className="container projects-grid">
          {visible.length === 0 ? (
            <div
              className="card"
              style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48 }}
            >
              <p className="t-lead">No projects in this category yet.</p>
            </div>
          ) : (
            visible.map((p, idx) => {
              const Card = (
                <TiltCard className="card project-card card--interactive">
                  <div className="project-card__img" style={{ position: "relative", overflow: "hidden" }}>
                    <div
                      className="project-card__bg"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: p.image
                          ? `center/cover url(${cldOptimize(p.image, "w_600")}) no-repeat, ${p.bg}`
                          : p.bg,
                      }}
                    />
                    <Badge kind="neutral" style={{ position: "absolute", top: 14, left: 14 }}>
                      {p.category}
                    </Badge>
                  </div>
                  <div className="project-card__body">
                    <h4 className="t-h4" style={{ fontSize: 18 }}>{p.title}</h4>
                    {/* §14.13 — strict 2-line clamp (via .project-card__body p.t-small); never the full case-study body. */}
                    <p className="t-small" style={{ marginTop: 6 }}>{p.description}</p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        marginTop: 12,
                      }}
                    >
                      <span className="project-card__link">
                        View <Icon name="arrowRight" size={12} />
                      </span>
                    </div>
                  </div>
                </TiltCard>
              );

              return (
                <Reveal key={p.id} delay={(idx % 6) * 60}>
                  {p.slug ? (
                    <Link href={`/projects/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {Card}
                    </Link>
                  ) : p.liveUrl ? (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                      {Card}
                    </a>
                  ) : (
                    Card
                  )}
                </Reveal>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
