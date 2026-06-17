import Link from "next/link";
import { Badge, Btn, PH, Reveal } from "@/components/ui";
import { CldImage } from "@/components/CldImage";
import { BlogListClient, type BlogCardData } from "@/components/public/BlogListClient";
import { BlogSidebarCta } from "@/components/public/BlogSidebarCta";
import { listBlogs } from "@/server/services/blog.service";
import { metadataFromDb } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

// ISR (A3): cache for 1h; admin edits appear within the window. Safe — this page
// reads no per-request data (no searchParams/preview), only published CMS content.
export const revalidate = 3600;

export async function generateMetadata() {
  return metadataFromDb("blog", {
    path: "/blog",
    title: "Web Design & SEO Blog",
    description:
      "Practical web design, development and SEO tips for Indian businesses — trends, how-tos and guides to help your website rank higher and convert more.",
  });
}

const FALLBACK_POSTS: BlogCardData[] = [
  { slug: "know-your-audience", title: "Know Your Audience First", category: "Marketing", excerpt: "", date: "May 6, 2026", readTime: "6 min", image: "" },
  { slug: "clean-modern-design", title: "Clean and Modern Design", category: "Design", excerpt: "", date: "May 5, 2026", readTime: "4 min", image: "" },
  { slug: "mobile-first-2026", title: "Why Mobile-First Wins in 2026", category: "Design", excerpt: "", date: "May 4, 2026", readTime: "5 min", image: "" },
  { slug: "beginners-seo", title: "A Beginner's Guide to SEO", category: "SEO", excerpt: "", date: "May 3, 2026", readTime: "9 min", image: "" },
  { slug: "speed-conversion", title: "Speed: The Hidden Conversion Killer", category: "Performance", excerpt: "", date: "May 2, 2026", readTime: "6 min", image: "" },
  { slug: "choose-cms", title: "Choosing the Right CMS", category: "Development", excerpt: "", date: "May 1, 2026", readTime: "7 min", image: "" },
];

const FALLBACK_CATEGORIES: [string, number][] = [
  ["Web Design", 42],
  ["Development", 28],
  ["SEO", 22],
  ["E-commerce", 16],
  ["Marketing", 19],
];

const FALLBACK_TAGS = ["#WebDesign", "#SEO", "#WordPress", "#Mobile", "#UI/UX", "#Conversion", "#Speed"];

export default async function BlogListPage() {
  const result = await listBlogs({ page: 1, limit: 9 }).catch(() => ({
    items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
    pages: 0,
  }));

  const featured = result.items?.[0] ?? null;
  const restRaw = featured ? result.items.slice(1) : result.items;

  const posts: BlogCardData[] = restRaw.length
    ? restRaw.map((b) => ({
        slug: b.slug,
        title: b.title,
        category: b.category || "General",
        excerpt: b.excerpt || "",
        date: formatDate(b.createdAt),
        readTime: `${b.readTime ?? 5} min`,
        image: b.featuredImage || "",
        imageAlt: b.featuredImageAlt || "",
      }))
    : FALLBACK_POSTS;

  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  for (const b of result.items) {
    const c = b.category || "General";
    categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
    for (const t of b.tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const categories: [string, number][] = categoryCounts.size
    ? Array.from(categoryCounts.entries()).slice(0, 6)
    : FALLBACK_CATEGORIES;
  const tags = tagCounts.size
    ? Array.from(tagCounts.keys()).slice(0, 10).map((t) => (t.startsWith("#") ? t : `#${t}`))
    : FALLBACK_TAGS;

  return (
    <div className="page-wrapper--wide">
      <section className="page-banner">
        <div className="container" style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
          <Reveal><h1 className="t-h1">Digital Growth Insights</h1></Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 14 }}>
              Tips, trends and how-tos to help your business stand out online.
            </p>
          </Reveal>
        </div>
      </section>

      {featured && (
        <section style={{ padding: "64px 0 64px" }}>
          <div className="container">
            <Reveal>
              <Link href={`/blog/${featured.slug}`}>
                <div className="card hover-lift featured-blog">
                  {featured.featuredImage ? (
                    <div style={{ position: "relative", width: "100%", height: 380, borderRadius: 12, overflow: "hidden" }}>
                      <CldImage
                        src={featured.featuredImage}
                        alt={featured.featuredImageAlt || featured.title}
                        fill
                        priority
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <PH h={380} label="featured article cover" variant="solid" style={{ borderRadius: 12 }} />
                  )}
                  <div className="featured-blog__body">
                    <Badge>FEATURED</Badge>
                    <h2 className="t-h2" style={{ fontSize: 32, marginTop: 14, lineHeight: 1.2 }}>
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="t-lead" style={{ marginTop: 16, fontSize: 17 }}>
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="blog-author">
                      <div className="avatar" style={{ width: 36, height: 36 }}>
                        {featured.author?.[0]?.toUpperCase() ?? "W"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{featured.author || "Web Digital Development Team"}</div>
                        <div className="t-small" style={{ fontSize: 12 }}>
                          {formatDate(featured.createdAt)} · {featured.readTime ?? 5} min read
                        </div>
                      </div>
                    </div>
                    <Btn size="lg" iconRight="arrowRight" style={{ marginTop: 28 }}>Read Article</Btn>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section style={{ paddingBottom: 80 }}>
        <div className="container blog-layout">
          <div>
            <BlogListClient
              initialPosts={posts}
              initialPage={1}
              totalPages={result.pages ?? 1}
            />
          </div>

          <aside className="blog-sidebar">
            <Reveal>
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Categories</h3>
                <div className="sidebar-cats">
                  {categories.map(([c, n]) => (
                    <a key={c} className="sidebar-cat">
                      <span>{c}</span>
                      <span className="t-small">{n}</span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <BlogSidebarCta />
            </Reveal>
            <Reveal delay={120}>
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Popular Tags</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  {tags.map((t) => (
                    <span key={t} className="badge" style={{ background: "#F1F5F9", color: "#475569" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </div>
  );
}
