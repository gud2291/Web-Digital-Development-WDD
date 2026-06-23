import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Badge, Reveal, SectionHead } from "@/components/ui";

/**
 * §INTERNAL-LINKING (Part C) — a tasteful, on-brand "Related" section for the
 * public detail pages. Renders descriptive-anchor internal links (the target's
 * real title) as small cards in a responsive grid, reusing the existing
 * card / SectionHead / Badge components (light + dark via theme tokens).
 *
 * Renders nothing when there are no items, so no empty section ever appears.
 */
export interface RelatedItem {
  href: string;
  title: string;
  /** Small label shown above the title, e.g. "Service" / "Reading". */
  label?: string;
  desc?: string;
}

export function RelatedSection({
  kicker,
  title,
  sub,
  items,
  alt = false,
}: {
  kicker: string;
  title: string;
  sub?: string;
  items: RelatedItem[];
  /** Use the alternate (tinted) section background. */
  alt?: boolean;
}) {
  if (!items.length) return null;

  return (
    <section className={`section${alt ? " section--alt" : ""}`}>
      <div className="container">
        <Reveal>
          <SectionHead kicker={kicker} title={title} sub={sub} align="left" />
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 28,
          }}
        >
          {items.map((item, idx) => (
            <Reveal key={item.href} delay={idx * 60}>
              <Link
                href={item.href}
                style={{ color: "inherit", textDecoration: "none", display: "block", height: "100%" }}
              >
                <article
                  className="card card--hover card--interactive"
                  style={{ padding: 22, height: "100%", display: "flex", flexDirection: "column" }}
                >
                  {item.label && (
                    <Badge kind="neutral" style={{ alignSelf: "flex-start" }}>
                      {item.label}
                    </Badge>
                  )}
                  <h3
                    className="t-h4"
                    style={{ fontSize: 18, marginTop: item.label ? 12 : 0, lineHeight: 1.35 }}
                  >
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className="t-small" style={{ marginTop: 8 }}>
                      {item.desc}
                    </p>
                  )}
                  <span
                    style={{
                      color: "#2563EB",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: "auto",
                      paddingTop: 14,
                    }}
                  >
                    Explore <Icon name="arrowRight" size={12} />
                  </span>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
