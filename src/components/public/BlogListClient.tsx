"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Badge, Btn, PH, Reveal } from "@/components/ui";
import { CldImage } from "@/components/CldImage";

export interface BlogCardData {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt?: string;
}

interface Props {
  initialPosts: BlogCardData[];
  initialPage: number;
  totalPages: number;
}

export function BlogListClient({ initialPosts, initialPage, totalPages }: Props) {
  const [posts, setPosts] = React.useState<BlogCardData[]>(initialPosts);
  const [page, setPage] = React.useState(initialPage);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(initialPage < totalPages);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // "/" keyboard shortcut focuses the search box (like GitHub), unless already
  // typing in a field.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement | null)?.isContentEditable;
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current && debouncedSearch === "") {
      firstRender.current = false;
      setPosts(initialPosts);
      setHasMore(initialPage < totalPages);
      return;
    }
    firstRender.current = false;
    const ac = new AbortController();
    setLoading(true);
    const url = new URL("/api/public/blog", window.location.origin);
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "9");
    if (debouncedSearch) url.searchParams.set("search", debouncedSearch);
    fetch(url.toString(), { signal: ac.signal })
      .then((r) => r.json())
      .then((data: { items: RawBlogItem[]; pages: number }) => {
        setPosts((data.items ?? []).map(toCard));
        setPage(1);
        setHasMore(data.pages > 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [debouncedSearch, initialPosts, initialPage, totalPages]);

  const loadMore = async () => {
    setLoading(true);
    const url = new URL("/api/public/blog", window.location.origin);
    url.searchParams.set("page", String(page + 1));
    url.searchParams.set("limit", "9");
    if (debouncedSearch) url.searchParams.set("search", debouncedSearch);
    try {
      const r = await fetch(url.toString());
      const data: { items: RawBlogItem[]; pages: number } = await r.json();
      setPosts((prev) => [...prev, ...(data.items ?? []).map(toCard)]);
      setPage((p) => p + 1);
      setHasMore(page + 1 < data.pages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="search-box">
        <div className="search-box__icon">
          <Icon name="search" size={18} color="#94A3B8" />
        </div>
        <input
          ref={inputRef}
          className="input"
          placeholder="Search articles…  (press / to focus)"
          style={{ paddingLeft: 44 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="blog-grid" style={{ marginTop: 40 }}>
        {posts.length === 0 && !loading ? (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48 }}>
            <p className="t-lead">
              {debouncedSearch
                ? `No results found for “${debouncedSearch}” — try a different keyword.`
                : "No articles found."}
            </p>
          </div>
        ) : (
          posts.map((b, idx) => (
            <Reveal key={b.slug + idx} delay={(idx % 6) * 50}>
              <Link href={`/blog/${b.slug}`}>
                <article className="card card--hover blog-card card--interactive">
                  {b.image ? (
                    <div style={{ position: "relative", width: "100%", height: 280, borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                      <CldImage
                        src={b.image}
                        alt={b.imageAlt || b.title}
                        fill
                        sizes="(max-width: 768px) 95vw, (max-width: 1024px) 47vw, 380px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <PH h={280} label="cover" />
                  )}
                  <div className="blog-card__body" style={{ padding: "24px" }}>
                    <Badge kind={idx % 2 ? "neutral" : "primary"}>{b.category}</Badge>
                    <h4 style={{ fontWeight: 700, fontSize: 22, marginTop: 12, lineHeight: 1.35 }}>
                      {b.title}
                    </h4>
                    <div className="t-small" style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
                      <span>{b.date}</span>
                      <span>{b.readTime} read</span>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))
        )}
        {hasMore && (
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: 14 }}>
            <Btn variant="outline" iconRight="arrowRight" onClick={loadMore} disabled={loading}>
              {loading ? "Loading…" : "Load More Articles"}
            </Btn>
          </div>
        )}
      </div>
    </>
  );
}

interface RawBlogItem {
  slug: string;
  title: string;
  category?: string;
  excerpt?: string;
  createdAt: string;
  readTime?: number;
  featuredImage?: string;
  featuredImageAlt?: string;
}

function toCard(b: RawBlogItem): BlogCardData {
  return {
    slug: b.slug,
    title: b.title,
    category: b.category || "General",
    excerpt: b.excerpt || "",
    date: new Date(b.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    readTime: `${b.readTime ?? 5} min`,
    image: b.featuredImage || "",
    imageAlt: b.featuredImageAlt || "",
  };
}
