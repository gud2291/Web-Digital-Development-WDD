# SEO + GEO + AEO Implementation Plan — Web Digital Development

**Project:** WDD website (Next.js 14 App Router + MongoDB + Tailwind)
**Canonical live site:** https://webdigitaldevelopment.com
**Goal:** Maximize organic visibility and rank as high as possible for "website design / development / SEO company in Delhi" and related terms across **SEO** (Google/Bing), **GEO** (Generative Engine Optimization — ChatGPT, Perplexity, Google AI Overviews, Gemini, Copilot) and **AEO** (Answer Engine Optimization — featured snippets, "People Also Ask", voice answers).

This document is the single source of truth for the implementation agent (Claude Code). Work top-to-bottom. Do **not** skip the Ground Rules.

---

## 0. GROUND RULES (read first — non-negotiable)

1. **Do not break any existing feature.** The admin CMS, auth/2FA, chatbot, forms, media, blog, projects, services, locations, preview mode, and all API routes must keep working exactly as before. If a change could affect behaviour, verify it still works before moving on.
2. **Do not change the theme, design, colors, fonts, spacing, animations, or any UI/UX.** These are SEO/markup/metadata changes only. Visible layout and styling must look identical to before. The only acceptable visual change is if a task explicitly says so (none here do).
3. **Surgical edits only.** Touch only what is needed to fix the SEO/GEO/AEO issue described. Do not refactor unrelated code, rename things, reformat files, or "clean up" while you're in there.
4. **Do NOT touch any environment file** (`.env`, `.env.local`, `.env.example`) and do not read or print secret values. Anything that needs an env variable is marked **[ENV — SKIP]** and is out of scope for you.
5. **Do not touch images / media optimization** in this pass. Anything image-related is marked **[IMAGES — LATER]** and is out of scope for now.
6. **Do not do Priority-1 hosting tasks** (domain redirects, DNS, Search Console). Those are handled outside the repo.
7. **Preserve accessibility and semantics.** When changing headings, keep them meaningful and visible; never hide content from users just to satisfy a crawler.
8. **After each Part, run a build/type/lint check** (see §11 Verification). If a change breaks the build or type-check, fix it or revert that single change — never leave the repo broken.
9. **Keep one brand suffix only.** Titles must end in exactly one `| Web Digital Development`. The existing `buildMetadata()` in `src/lib/seo.ts` already handles this — reuse it, don't reinvent.
10. **Commit in small, labelled steps** (the owner pushes to GitHub). One logical fix per commit so anything can be reverted safely.

### Working method for every task
For each task below: (a) open the listed file(s), (b) confirm the "Current state" matches reality before editing, (c) make the minimal change, (d) check the "Acceptance criteria", (e) run the relevant verification.

---

## 1. Codebase map (where things live)

| Concern | File |
|---|---|
| Site-wide config / single source of truth | `src/config/site.ts` |
| Metadata builder (titles, OG, canonical) | `src/lib/seo.ts` (`buildMetadata`, `metadataFromDb`) |
| Root metadata + global JSON-LD | `src/app/layout.tsx` |
| Public layout | `src/app/(public)/layout.tsx` |
| Homepage | `src/app/(public)/page.tsx` |
| Hero slider (H1 logic already correct) | `src/components/public/HeroSlider.tsx` |
| Structured data helpers | `src/components/SchemaMarkup.tsx` |
| Robots | `src/app/robots.ts` |
| Sitemap | `src/app/sitemap.ts` |
| FAQ UI component | `src/components/FAQList.tsx` |
| Per-entity data | `src/server/services/*.service.ts` (e.g. `testimonial.service.ts`, `service.service.ts`, `blog.service.ts`) |
| Security headers | `next.config.mjs` |

> Note: `src/config/site.ts` is **not** an env file — it is normal code and **is** in scope. Editing it deploys with a normal git push, so the owner never has to edit Vercel for these public values.

---

## PART A — Technical SEO (foundation)

### A1. Fix default domain in site config
- **File:** `src/config/site.ts`
- **Current state:** `url: process.env.NEXT_PUBLIC_SITE_URL || "https://webdigitaldevelopment.in"`
- **Change:** Change the fallback default from `https://webdigitaldevelopment.in` to `https://webdigitaldevelopment.com`. Keep the `process.env.NEXT_PUBLIC_SITE_URL ||` part exactly as-is (do not remove the env read, do not touch env files).
- **Why:** If a build ever runs without the env var, every canonical, OG URL, and sitemap entry currently points to the **old** domain (`.in`), which actively undermines the new site. The default must be the real canonical domain.
- **Acceptance:** `siteConfig.url` resolves to `.com` when no env var is set. Canonicals, OG `url`, robots `host`, and sitemap all show `.com`.
- **Don't break:** Don't change any other field while here (email stays `@webdigitaldevelopment.in` if that's the real inbox — confirm with owner; do not auto-change).

### A2. Add project detail pages + real lastmod to sitemap
- **File:** `src/app/sitemap.ts`
- **Current state:** `void projects;` — project detail URLs are intentionally skipped, but a `/projects/[slug]` route now exists. Also all `STATIC_PATHS` use `lastModified: now`.
- **Change 1:** Emit `/projects/${p.slug}` URLs from the already-fetched `projects` array (mirror the existing `serviceUrls` block: `changeFrequency: "weekly"`, `priority: 0.7`, `lastModified` = `p.updatedAt` if present else `now`). Remove the `void projects;` line.
- **Change 2:** For `STATIC_PATHS`, where a meaningful last-modified date is available (e.g. homepage tied to homepage settings `updatedAt`), use it. For purely static pages with no real date, it's acceptable to keep `now` but do **not** fabricate frequently-changing dates for pages that don't change — prefer a stable build date over `new Date()` per request if no real signal exists.
- **Why:** Project detail pages are currently invisible to crawlers. Always-"now" lastmod is a weak/ignored signal; accurate dates help crawl prioritization.
- **Acceptance:** `/sitemap.xml` includes every published project slug and returns valid XML. No 404s when visiting the emitted project URLs.
- **Don't break:** Keep the existing `try/catch (() => [])` resilience so a DB failure can't crash the sitemap.

### A3. Make public pages cacheable (ISR) instead of fully dynamic
- **Files:** all `export const dynamic = "force-dynamic"` pages under `src/app/(public)/` (home, services, services/[slug], blog, blog/[slug], projects, projects/[slug], about, contact, reviews, legal, legal/[slug], locations/[slug], sitemap page).
- **Current state:** Every public page is `force-dynamic` → server-rendered fresh on every request and crawl, hurting TTFB and Core Web Vitals.
- **Change:** Convert content pages to **ISR**: replace `export const dynamic = "force-dynamic"` with a revalidation window, e.g. `export const revalidate = 3600;` (1 hour) for list/detail pages, and a shorter window (e.g. `300`) only if the owner needs near-real-time updates. **Important caveat:** any page that depends on per-request data (preview mode via `searchParams`, auth, or live admin previews) must stay dynamic — do NOT convert those. Specifically, keep preview behaviour intact: pages reading `searchParams.preview`/`token` must continue to render drafts correctly. If ISR conflicts with preview, gate it (e.g. keep `force-dynamic` only when preview params are present) rather than removing preview.
- **Why:** Faster pages = better rankings + better GEO/AEO crawlability and lower bounce. ISR keeps content fresh without per-request cost.
- **Acceptance:** Pages still show current CMS content within the revalidate window; preview links still show unsaved drafts immediately; build succeeds; no hydration errors.
- **Risk:** This is the highest-risk task in the doc. Do it page-type by page-type, verify preview + dynamic data after each, and if any page misbehaves, revert just that page to `force-dynamic`. **Do not** sacrifice a working feature for caching.

### A4. Verify robots + canonical correctness (no code change unless wrong)
- **Files:** `src/app/robots.ts`, `src/lib/seo.ts`, `src/app/layout.tsx`
- **Check:** robots already blocks `/admin`, `/api`, `/registrations` and points sitemap to the site URL — confirm it now resolves to `.com` after A1. Confirm every public page sets its own canonical via `buildMetadata`/`metadataFromDb` (root layout's blanket `alternates.canonical = siteConfig.url` should be overridden per-page; any page using a raw string title without `buildMetadata` will wrongly inherit the homepage canonical — find those and route them through `buildMetadata`).
- **Acceptance:** Each public route's rendered `<link rel="canonical">` matches its own URL, not the homepage.

---

## PART B — On-page SEO (titles, descriptions, headings)

> Source of truth for the specific offending URLs: the Screaming Frog crawl (`issues_overview_report.csv`). Use it to know **which** pages to fix. Titles/descriptions come from two places: (1) **code defaults** in `siteConfig` and each page's `generateMetadata`, and (2) **DB content** (service/blog/location SEO fields, and the `SeoMeta` collection) edited in the admin panel. Fix the code defaults here; for DB-driven entries, see the note at the end of Part B.

### B1. Page titles too long (21 pages > 60 chars, 18 > pixel limit)
- **Files:** `src/config/site.ts` (`title`, `keywords`), each `generateMetadata` in `src/app/(public)/**`.
- **Target:** ≤ ~60 characters / ≤ ~561 px, primary keyword first, exactly one brand suffix. Pattern: `Primary Keyword in Delhi | Web Digital Development` only if it fits; otherwise drop the location or brand-shorten. `buildMetadata()` already strips/re-adds the single brand suffix — keep using it.
- **Change:** Shorten the static default titles (home, about, contact, services list, projects, blog, reviews) to fit. Keep target keywords natural — **no keyword stuffing**.
- **Why:** Over-long titles get truncated in SERPs and AI answer citations, lowering CTR and keyword weight.
- **Acceptance:** Each fixed page's `<title>` is ≤ 60 chars including the brand suffix, keyword-first, one suffix only.

### B2. Meta descriptions (18 > 155 chars, plus a few too short)
- **Files:** `src/config/site.ts` (`description`), each page `generateMetadata`.
- **Target:** 120–155 characters, includes a benefit/USP + a soft CTA, unique per page. Lengthen the 2 that are too short; trim the 18 that are too long.
- **Why:** Truncated or generic descriptions hurt CTR and give AI engines a weaker summary to quote.
- **Acceptance:** Each description is unique, 120–155 chars, reads naturally, includes location/intent where relevant.

### B3. Resolve "Multiple H1" on the homepage
- **Files:** `src/app/(public)/page.tsx` and any homepage section components it renders. **Do NOT change `HeroSlider.tsx`** — it already correctly emits one `<h1>` (slide 0) and `<h2>` for the rest (`const HeadingTag = i === 0 ? "h1" : "h2"`).
- **Current state:** The crawl flags the homepage as having multiple `<h1>`. Since the slider is correct, a **second** `<h1>` is coming from another homepage section (e.g. a section heading, a hidden/SR heading, or the non-slider hero variant in `page.tsx` around the `t-h1` usage).
- **Change:** Find every `<h1>`/`t-h1` that renders on the homepage. Keep exactly one `<h1>` (the primary hero headline). Demote any additional `<h1>` to `<h2>` (or the correct level) **without changing its visible styling** — keep the `t-h1`/CSS class if needed for appearance, only change the tag.
- **Why:** One H1 per page is the clean, recommended structure for SEO and assistive tech.
- **Acceptance:** Homepage renders exactly one `<h1>`; visual appearance unchanged; crawl no longer flags "H1: Multiple".

### B4. Heading hierarchy cleanup
Fix the heading-structure issues from the crawl **without altering visible text or styling** (change tag levels / add missing headings only):
- **H1 Non-Sequential (8 pages):** ensure the `<h1>` is the first heading in the document order on each flagged page.
- **H2 Non-Sequential (5 pages):** ensure the heading directly under the H1 is an `<h2>` (not jumping to h3/h4).
- **H2 Missing (3 pages):** add a meaningful, visible `<h2>` to the main content section (use existing section labels/eyebrows if present — promote a styled label to a real `<h2>` rather than inventing copy).
- **H2 Duplicate (13 pages):** make section `<h2>`s unique/descriptive per page where they're currently identical boilerplate.
- **H2 Multiple (17 pages) & H1/H2 over 70 chars (3 pages):** Multiple H2s are fine — only verify hierarchy is logical. Shorten the 3 over-long headings to be concise.
- **Why:** Clean heading trees help search + AI engines extract structure and answers (direct AEO benefit).
- **Acceptance:** Logical h1→h2→h3 order on every flagged page; no duplicate boilerplate H2s on key pages; visual design unchanged.

### Note on DB-driven titles/descriptions
Many flagged service/blog/location pages get their title/description from the database (the service `seoTitle`/`seoDescription`, blog fields, or the `SeoMeta` collection), not from code. For those, Claude Code should:
- Improve the **fallback/default** logic and any seed defaults (`scripts/seed.ts`) so new/empty entries are well-formed, **and**
- Produce a short checklist (file: `SEO-DB-TODO.md`) listing each DB-driven URL from the crawl that needs its title/description shortened in the **admin panel**, so the owner can fix those entries. (Claude Code should not write directly to the production database.)

---

## PART C — Structured data / Schema (powers SEO + GEO + AEO)

The site already has helpers in `src/components/SchemaMarkup.tsx`: `localBusinessSchema` (ProfessionalService), `websiteSchema`, `breadcrumbSchema`, `articleSchema`, `faqSchema`, `serviceSchema`. Extend, don't rebuild.

### C1. Add Review / AggregateRating schema
- **Files:** `src/components/SchemaMarkup.tsx` (new helper), consume on homepage + reviews page; data from `src/server/services/testimonial.service.ts`.
- **Change:** Add an `aggregateRating` (and optional `review` array) to the `localBusinessSchema`/`ProfessionalService` node, sourced from real testimonials (count + average). Only use **genuine** ratings that are actually shown on the page (the site already displays "4.9/5, 130+ clients" and real testimonials). Do not invent numbers.
- **Why:** Star rich results in Google + strong trust signal that AI engines cite.
- **Acceptance:** Valid `AggregateRating` in JSON-LD that matches the visible rating; passes Google Rich Results Test; numbers come from the DB/visible content.
- **Compliance:** Rating must reflect real, on-page reviews (Google policy). If a verifiable aggregate isn't available, add per-testimonial `Review` items only and skip `aggregateRating`.

### C2. Use FAQPage schema on the homepage and key pages
- **Files:** `src/components/FAQList.tsx`, `src/components/SchemaMarkup.tsx` (`faqSchema` already exists), homepage + services pages.
- **Current state:** `faqSchema` and `FAQList` already exist and are used on several pages (services, blog, locations, projects).
- **Change:** Ensure every page that shows a **visible** FAQ block also emits matching `FAQPage` JSON-LD (the schema must mirror the on-screen Q&A exactly). Add a short, genuinely useful FAQ section to the **homepage** and the main **services** list page if not present (visible + schema). Keep styling consistent with existing `FAQList`.
- **Why:** FAQ schema is the single biggest AEO lever — it feeds "People Also Ask", voice answers, and AI summaries.
- **Acceptance:** Visible FAQ === JSON-LD FAQ on each page; passes Rich Results Test; no schema for hidden content.

### C3. Breadcrumbs everywhere
- **Files:** `breadcrumbSchema` (exists), all detail routes (`services/[slug]`, `blog/[slug]`, `projects/[slug]`, `locations/[slug]`, `legal/[slug]`).
- **Change:** Confirm every detail page emits `BreadcrumbList` JSON-LD with the correct trail (Home › Section › Page). Add where missing. Optionally render a matching visible breadcrumb only if it fits the existing design — **if it changes the UI, skip the visible part and keep JSON-LD only.**
- **Acceptance:** Each detail page has a valid breadcrumb trail in JSON-LD.

### C4. Strengthen Organization / entity schema
- **Files:** `src/components/SchemaMarkup.tsx`, `src/app/layout.tsx`.
- **Change:** Ensure the business node includes: `name`, `url`, `logo`, `image`, `telephone`, `email`, full `address`, `geo`, `areaServed`, `sameAs` (all real social profiles — fix the inconsistent Instagram handle, see G-section), `founder`, `foundingDate`, `priceRange` (add, e.g. "₹₹"), and `openingHoursSpecification`. Add an `@id` so all nodes reference one canonical entity (already partially done with `#business`).
- **Why:** A complete, self-consistent entity graph is how GEO engines (and Google's Knowledge Graph) understand and trust the brand.
- **Acceptance:** One coherent linked entity graph; all URLs absolute and `.com`; passes Schema validation.

---

## PART D — GEO (Generative Engine Optimization)

Goal: be the source AI engines (ChatGPT, Perplexity, Gemini, Google AI Overviews, Copilot) quote when someone asks "best website design company in Delhi", "who can build me a website in Delhi", etc.

### D1. Add `llms.txt`
- **File:** create `public/llms.txt` (and optionally `public/llms-full.txt`).
- **Change:** Add a concise, structured Markdown file describing the business, key services (with URLs), service areas, contact, and most important pages — the emerging convention for AI crawlers. Keep it factual and current.
- **Acceptance:** `https://webdigitaldevelopment.com/llms.txt` returns the file; content matches the site.

### D2. Decide and configure AI crawler access in robots
- **File:** `src/app/robots.ts`
- **Change:** Explicitly allow the major AI crawlers so the brand can be cited (recommended for a business that *wants* AI visibility): `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Claude-Web`, `Google-Extended`, `Applebot-Extended`, `Bingbot`. Keep the existing `/admin`, `/api`, `/registrations` disallows applied to these agents too. **Confirm with owner** before allowing (default recommendation: allow, since the goal is AI visibility).
- **Acceptance:** `/robots.txt` lists the AI agents with `Allow: /` and the same disallow paths; still valid.

### D3. Answer-first, extractable content structure
- **Files:** content components on home/services/about (markup/copy structure only — keep the design).
- **Change:** Where content already exists, structure it so an AI can extract a clean answer: lead each key section with a 1–2 sentence direct answer, then detail. Use real `<h2>`/`<h3>` questions where natural ("How much does a website cost in Delhi?", "How long does it take?"). Prefer short paragraphs, definition sentences ("X is …"), and comparison/spec lists where they already fit the design.
- **Why:** GEO/AEO engines lift concise, self-contained answers. This is mostly a markup/copy-structure pass, **not** a redesign.
- **Acceptance:** Key pages open sections with a direct answer sentence; question-style subheadings where appropriate; no visual redesign.

### D4. E-E-A-T / authorship signals
- **Files:** blog article pages, `articleSchema`, about page.
- **Change:** Ensure every blog post has a real `author` (Person) in both visible byline and `articleSchema`, `datePublished` + `dateModified`, and links to an author/about page. Strengthen the About page with founder credentials, founding year, location, and verifiable specifics (already partly present — "Gudia Yadav, since 2019").
- **Why:** AI engines and Google weight experience/authoritativeness heavily for "who should I hire" queries.
- **Acceptance:** Articles show author + dates in UI and schema; about page conveys clear expertise/entity signals.

### D5. Speakable schema (voice/assistant answers)
- **Files:** `src/components/SchemaMarkup.tsx`, homepage + FAQ pages.
- **Change:** Add `speakable` (`SpeakableSpecification` with CSS selectors) to the homepage/FAQ where a concise spoken answer exists.
- **Acceptance:** Valid `speakable` JSON-LD pointing at real on-page answer elements.

---

## PART E — AEO (Answer Engine Optimization)

Overlaps with C2 (FAQ schema) and D3 (answer-first). Additional specifics:

### E1. Target "People Also Ask" questions
- **Change:** For each core service, add 3–6 real customer questions as visible Q&A (with FAQ schema). Examples: cost, timeline, "do you do SEO too", "WordPress vs custom", "do you work with businesses outside Delhi". Answers: 40–60 words, direct, factual.
- **Acceptance:** Each main service page has a visible, schema-backed FAQ targeting realistic queries.

### E2. Snippet-friendly formatting
- **Change:** Where content already lists steps/features, ensure they use real `<ol>`/`<ul>` and a preceding question/`<h2>` so Google can lift them as featured snippets. Don't restyle — just use semantic list elements if currently divs.
- **Acceptance:** Process/feature lists use semantic list markup with a clear preceding heading.

### E3. Concise definitions & key facts near the top
- **Change:** Each key page should state, early and plainly, what the service is, who it's for, where it's offered, and a price/timeline signal if available — the facts AI answer boxes need.
- **Acceptance:** Above-the-fold or first content block answers what/who/where succinctly.

---

## PART F — Content quality (from crawl)

### F1. Low-content page (1 page < 200 words)
- **Change:** Identify the flagged URL from the crawl and expand it with genuinely useful, unique descriptive content (target 300+ words) that fits the page's purpose. If it's a thin service/location page, add scope, deliverables, FAQs, and local relevance.
- **Acceptance:** Flagged page has substantive, unique content; no thin-content flag.

### F2. Readability (1 page flagged "difficult")
- **Change:** Simplify long/complex sentences on the flagged page — shorter sentences, plainer words — without changing meaning or design.
- **Acceptance:** Easier reading level; meaning preserved.

### F3. Blog depth & freshness
- **Change:** The blog has very few posts, all dated the same day. Plan/add more posts targeting Delhi + service keywords and AI-style questions. (Content creation may be owner-driven via admin; Claude Code can scaffold post structure, internal links, and schema, and create a `CONTENT-PLAN.md` with 10–15 prioritized article ideas + target keywords.)
- **Acceptance:** A content plan exists; new posts (when added) have author, dates, internal links, and Article schema.

---

## PART G — Consistency / minor (from crawl + audit)

### G1. Fix inconsistent social links
- **File:** `src/config/site.ts` (`social`)
- **Change:** Make the Instagram (and any other) handle consistent and correct across the site, footer, and `sameAs` schema. Verify each social URL actually resolves.
- **Acceptance:** All social URLs valid and identical wherever referenced.

### G2. High external outlinks (3 pages)
- **Change:** Review the 3 flagged pages; ensure external links are relevant, trusted, and use appropriate `rel` (e.g. `rel="noopener"`; add `nofollow`/`sponsored` only where appropriate, e.g. client/portfolio links if they shouldn't pass equity per owner's call). Don't strip legitimate, useful links.
- **Acceptance:** External links reviewed and correctly attributed.

### G3. Meta keywords (optional)
- The `keywords` meta is ignored by Google and can stay or be trimmed — **no priority**, do not spend effort here.

---

## PART H — Security (verify; mostly already correct)

The crawl flagged **Missing Referrer-Policy, X-Content-Type-Options, and X-Frame-Options** on 17 URLs each. But `next.config.mjs` **already sets all three** for `/:path*`.

### H1. Verify why the crawl flagged them
- **Steps:** (1) Check the live response headers of several `.com` HTML pages (home, a service, blog) — confirm `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` are actually present in production. (2) If present, the crawl likely ran **before** the headers were deployed, OR the flagged 17 URLs are **external/CDN resources** (e.g. `res.cloudinary.com` images) the crawler followed — those are not under our control and can be ignored.
- **Acceptance:** Confirmed in writing (in a `SECURITY-CHECK.md`) which case it is.

### H2. Fix only if genuinely missing
- If production HTML pages truly lack any of the three headers, ensure the `headers()` rules in `next.config.mjs` apply to all routes (note: the `/_next/static/:path*` block adds Cache-Control; confirm it doesn't suppress the security headers — Next.js applies multiple matching header rules additively, so both should be present). Add `Referrer-Policy` to the static block too if needed.
- **Also confirm** the existing strong headers stay intact: HSTS, CSP, Permissions-Policy, X-XSS-Protection. **Do not weaken the CSP.** If you add any new third-party script (analytics, schema tools) later, the CSP must be updated to match — but that's out of scope here.
- **Acceptance:** All HTML responses carry the three headers; no existing security header removed or weakened; CSP unchanged unless explicitly required.

### H3. Quick security hygiene (no behaviour change)
- Confirm `/admin` and `/api` remain `Disallow`ed in robots and `noindex` where appropriate; confirm no secret values are exposed in client bundles or rendered HTML; confirm the admin routes still require auth. **Report only** — do not change auth logic.

---

## 11. VERIFICATION PROTOCOL (run after each Part)

1. **Build & types:** `npm run build` and `npm run type-check` must pass with no new errors.
2. **Lint:** `npm run lint` — no new errors.
3. **Feature smoke test (manual/local):** homepage, a service detail, a blog post, projects list + detail, contact form render; admin login + one CMS edit works; preview link still shows drafts; chatbot loads.
4. **Visual check:** the page looks identical to before the change (no theme/UX drift).
5. **SEO/schema validation:** run changed pages through Google Rich Results Test + a schema validator; confirm titles ≤ 60 chars, one H1, canonical correct, sitemap valid XML, robots valid.
6. **Revert rule:** if any feature breaks and can't be fixed quickly, revert that single change and note it in `BLOCKERS.md`.

Deliverable files Claude Code should also produce while working:
- `SEO-DB-TODO.md` — DB/admin title & description fixes for the owner.
- `CONTENT-PLAN.md` — 10–15 article ideas with target keywords (SEO + AEO questions).
- `SECURITY-CHECK.md` — findings from Part H.
- `BLOCKERS.md` — anything skipped/reverted and why.

---

## 12. OUT OF SCOPE (do not do)
- ❌ Priority-1 hosting work: `.in → .com` redirects, DNS, Google/Bing Search Console setup & verification.
- ❌ Any `.env*` file edits or reading secrets. **[ENV — SKIP]**
- ❌ Image compression / `width`+`height` on images / media optimization. **[IMAGES — LATER]**
- ❌ Theme, colors, fonts, layout, animation, or any UI/UX redesign.
- ❌ Writing to the production database directly.
- ❌ Adding new third-party scripts/analytics (would need CSP + env changes).

---

## 13. Realistic expectation note (for the owner, not a task)
Technical SEO + GEO + AEO fixes remove the blockers and make the site *eligible* to rank and to be cited by AI engines. They do **not** produce #1 rankings within days on their own — Google needs to re-crawl and re-index (days to weeks), and competitive Delhi keywords also depend on content depth, reviews, backlinks, and the domain-authority migration from the old `.in` site (the Priority-1 hosting work). The fastest real wins here are: clean titles/descriptions, FAQ + Review schema (rich results), `llms.txt` + AI-crawler access (GEO), and the speed gains from ISR. Pair this with the Priority-1 redirect + Search Console submission for the biggest, quickest impact.

---

### Suggested execution order
A1 → A4 → B3 → B4 → C1 → C2 → C3 → C4 → D1 → D2 → D5 → A2 → A3 (careful) → B1 → B2 → D3 → D4 → E1 → E2 → E3 → F1 → F2 → G1 → G2 → H1 → H2 → H3 → F3 (content, ongoing).
Start with low-risk, code-only schema/markup wins; do the ISR change (A3) carefully with full feature testing.
