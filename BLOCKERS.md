# BLOCKERS / Deferred items

Log of plan tasks that were verified-as-already-correct, intentionally skipped, or
deferred to the owner — with the reason. (Per SEO-GEO-AEO-PLAN.md §11 "Revert rule".)

## A3 — ISR conversion: which pages stayed dynamic and why
**Converted to ISR (`export const revalidate = 3600`):** `/blog`, `/projects`,
`/services`, `/reviews`, `/legal`, `/sitemap` (now `○` Static+ISR) and
`/projects/[slug]` (now `●` SSG+ISR via generateStaticParams). All read no
per-request data and pull only published CMS content; verified to render 200 with
real DB content baked in.

**Left `force-dynamic` ON PURPOSE (not converted):**
- `/` (home), `/about`, `/contact`, `/blog/[slug]`, `/legal/[slug]`,
  `/services/[slug]` — these read `searchParams.preview/token` for live admin
  draft preview (`getPreviewDoc`). Per §A3, pages depending on per-request data
  must stay dynamic so unsaved drafts show immediately. Verified: they render 200
  normally AND fall back to DB (200, no crash) when given an invalid preview token.
- `/locations/[slug]` — its `generateMetadata` and page body call
  `fetch(<own .com API>, { cache: "no-store" })`. `no-store` forces dynamic
  rendering regardless of `revalidate` (so ISR would be ineffective), and a
  build-time prerender would make an external HTTP call to the live domain
  (fragile). Kept dynamic; revisit only if that page is refactored to read the DB
  directly instead of fetching its own API.

## A2 — observation: soft-404 on unknown /projects/[slug] (pre-existing, OUT OF SCOPE)
While verifying A2, a non-existent project slug (e.g. `/projects/does-not-exist`)
returns **HTTP 200** instead of 404, even though `projects/[slug]/page.tsx` calls
`notFound()` for a missing project. This is a pre-existing soft-404 — A2 did not
introduce it and is unaffected by it (the sitemap only emits real `visible:true`
project slugs, all of which return genuine 200 pages). Flagging for the owner as a
separate SEO hygiene item (soft 404s can waste crawl budget); fixing it is outside
A2's scope.

## B3 — "Multiple H1" on homepage — NO CHANGE NEEDED (verified correct)
The current codebase renders **exactly one `<h1>`** on the homepage.
- The two hero variants in `src/app/(public)/page.tsx` (slider branch vs. no-slides
  fallback at line 330) are mutually exclusive via `hasSlides ? … : …`, each with a
  single `<h1>`.
- `HeroSlider.tsx` correctly emits `<h1>` for slide 0 and `<h2>` for the rest
  (`HeadingTag = i === 0 ? "h1" : "h2"`) and does **not** clone slides.
- Every other homepage section uses `h2`/`h3`/`h4` (verified across `SectionHead`,
  carousels, `ProcessSteps`, `CTABanner`, `TrustMarquee`).
- `SiteHeader` / `SiteFooter` contain no `<h1>`.

Conclusion: the crawl's "H1: Multiple" flag predates the current code (it was run on the
old `.in` site). No second `<h1>` exists to demote, so no edit was made.

## B4 — over-long headings (>70 chars) — DEFERRED to DB checklist
No **static/code** `<h1>`/`<h2>` over 70 characters was found. The long headings flagged
by the crawl are **DB-driven** (blog post titles, service `seoTitle`, location titles).
These cannot be fixed in code without writing to the production DB. They belong in
`SEO-DB-TODO.md` (Part B note) for the owner to edit in the admin panel.

## B4 — reviews page: ReviewsList block has no section heading
On `/reviews`, the list of testimonials (`ReviewsList`) renders cards with no heading.
We promoted the existing "Write a review" label to `<h2>` (tag-only) so the page has a
real `h2`, but did **not** add a brand-new visible "Client Reviews" heading above the
list, because that would introduce new on-screen UI (forbidden by Ground Rule §0.2).
If the owner wants a visible section title there, it's a one-line addition — flagging for
their decision rather than changing the design unilaterally.
