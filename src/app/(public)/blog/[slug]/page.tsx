import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Badge, Btn, PH, Reveal, SectionHead } from "@/components/ui";
import { CldImage } from "@/components/CldImage";
import { getBlogBySlug, getRelatedBlogs, listBlogs } from "@/server/services/blog.service";
import { getPreviewDoc } from "@/server/preview/getPreviewDoc";
import { BlogShareButtons } from "@/components/public/BlogShareButtons";
import { NewsletterSignup } from "@/components/public/NewsletterSignup";
import { buildMetadata, metadataFromDb } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  SchemaMarkup,
  articleSchema,
  breadcrumbSchema,
} from "@/components/SchemaMarkup";

// ISR: prerender published posts via generateStaticParams; cache 1h. Admin saves
// call revalidatePath("/blog/[slug]") so edits appear immediately. Drafts render
// via draftMode() for editors only.
export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const { items } = await listBlogs({ limit: 1000 }).catch(() => ({
    items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
  }));
  return items.filter((b) => b.slug).map((b) => ({ slug: b.slug as string }));
}

export async function generateMetadata({ params }: PageProps) {
  const post = await getBlogBySlug(params.slug).catch(() => null);
  if (!post) return buildMetadata({ title: "Article", path: `/blog/${params.slug}` });
  return metadataFromDb(`blog/${params.slug}`, {
    path: `/blog/${params.slug}`,
    title: post.seoTitle || post.title,
    // Fall back to a per-post sentence rather than the global site description,
    // so empty SEO fields don't duplicate the homepage meta.
    description:
      post.seoDescription ||
      post.excerpt ||
      `${post.title} — web design, development and SEO insights from Web Digital Development.`,
    ogImage: post.featuredImage || undefined,
    keywords: post.tags,
  });
}

function authorInitials(name?: string): string {
  if (!name) return "W";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "W";
}

export default async function BlogDetailPage({ params }: PageProps) {
  // §15.6 — render the unsaved draft when the editor is in draft mode.
  const draft = await getPreviewDoc<Record<string, unknown>>("blog");
  const post = draft
    ? ({
        _id: "preview",
        createdAt: new Date(),
        updatedAt: new Date(),
        readTime: 5,
        tags: [],
        author: "Web Digital Development Team",
        category: "General",
        excerpt: "",
        featuredImage: "",
        featuredImageAlt: "",
        seoTitle: "",
        seoDescription: "",
        published: true,
        ...draft,
      } as unknown as NonNullable<Awaited<ReturnType<typeof getBlogBySlug>>>)
    : await getBlogBySlug(params.slug).catch(() => null);
  if (!post) notFound();

  const relatedPosts = await getRelatedBlogs(post.slug, post.category, post.tags, 3).catch(
    () => [] as Awaited<ReturnType<typeof getRelatedBlogs>>
  );

  const author = post.author || "Web Digital Development Team";

  const fullUrl = `${siteConfig.url}/blog/${post.slug}`;

  return (
    <>
      <SchemaMarkup
        data={articleSchema({
          title: post.title,
          description: post.excerpt || undefined,
          url: fullUrl,
          image: post.featuredImage || undefined,
          author,
          datePublished: post.createdAt,
          dateModified: post.updatedAt || post.createdAt,
        })}
      />
      <SchemaMarkup
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])}
      />
      <section style={{ background: "var(--c-bg-section)", padding: "56px 0 32px" }}>
        <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
          <div className="breadcrumb">
            <span>Home</span>
            <Icon name="chevRight" size={12} />
            <Link href="/blog">Blog</Link>
            <Icon name="chevRight" size={12} />
            <b>{post.title.slice(0, 60)}{post.title.length > 60 ? "…" : ""}</b>
          </div>
          <Reveal>
            <Badge>{post.category || "General"}</Badge>
            <h1 className="t-h1" style={{ fontSize: 48, marginTop: 16, lineHeight: 1.15 }}>
              {post.title}
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <div className="blog-detail__meta">
              <div className="blog-author">
                <div className="avatar">{authorInitials(author)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{author}</div>
                  <div className="t-small" style={{ fontSize: 12 }}>Web Digital Development</div>
                </div>
              </div>
              <div className="t-small">📅 {formatDate(post.createdAt)}</div>
              <div className="t-small">🕒 {post.readTime ?? 5} min read</div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="container" style={{ maxWidth: 1040, margin: "-20px auto 0" }}>
        <Reveal>
          {post.featuredImage ? (
            <div style={{ position: "relative", width: "100%", height: 420, borderRadius: 16, overflow: "hidden" }}>
              <CldImage
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1040px) 100vw, 1040px"
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <PH h={420} label="article featured image" variant="solid" style={{ borderRadius: 16 }} />
          )}
        </Reveal>
      </div>

      <section className="section">
        <div className="container blog-detail__body">
          <Reveal>
            <article className="article-content">
              {post.excerpt && (
                <p style={{ fontSize: 18, color: "#475569", marginBottom: 24 }}>{post.excerpt}</p>
              )}
              <div dangerouslySetInnerHTML={{ __html: post.content }} />

              <div className="article-share">
                <div>
                  <Badge>{post.category || "General"}</Badge>{" "}
                  {(post.tags ?? []).slice(0, 3).map((t) => (
                    <Badge key={t} kind="neutral">{t}</Badge>
                  ))}
                </div>
                <BlogShareButtons url={fullUrl} title={post.title} />
              </div>

              <div className="card author-card">
                <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>
                  {authorInitials(author)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{author}</div>
                  <div className="t-small">Web Digital Development team — building websites for Indian SMBs.</div>
                </div>
                <Btn size="sm" variant="outline">Follow</Btn>
              </div>
            </article>
          </Reveal>
          <Reveal delay={60}>
            <div style={{ marginTop: 32 }}>
              <NewsletterSignup variant="card" source="blog" />
            </div>
          </Reveal>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <Reveal>
              <SectionHead kicker="KEEP READING" title="You may also like" align="left" />
            </Reveal>
            <div className="blog-grid blog-grid--3">
              {relatedPosts.map((p, idx) => (
                <Reveal key={p.slug} delay={idx * 80}>
                  <Link href={`/blog/${p.slug}`}>
                    <article className="card card--hover blog-card card--interactive">
                      {p.featuredImage ? (
                        <div style={{ position: "relative", width: "100%", height: 170, borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                          <CldImage
                            src={p.featuredImage}
                            alt={p.featuredImageAlt || p.title}
                            fill
                            sizes="(max-width: 900px) 100vw, 33vw"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <PH h={170} label="cover" variant={idx === 0 ? "solid" : undefined} />
                      )}
                      <div className="blog-card__body">
                        <Badge>{p.category || "General"}</Badge>
                        <h4 style={{ fontWeight: 700, fontSize: 18, marginTop: 10, lineHeight: 1.35 }}>
                          {p.title}
                        </h4>
                        <div className="t-small" style={{ marginTop: 14 }}>{p.readTime ?? 5} min read</div>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
