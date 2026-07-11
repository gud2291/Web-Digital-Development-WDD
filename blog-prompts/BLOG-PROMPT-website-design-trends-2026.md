# BLOG-PROMPT — "Website Design Trends in 2026"

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB/Mongoose)
**Task:** Research, write, and publish ONE new blog post directly into the live MongoDB database. Content-only task.

---

## 0. OPERATIONAL RULES
1. Start directly. Ask no questions.
2. Do NOT modify anything under `src/`, `public/`, config files, or any existing file — the ONLY new file allowed is one seed script under `scripts/`.
3. Do NOT run build/type-check/lint/full tests. Only run the seed script and confirm it completes without errors.
4. No permission gates. Write, publish, confirm, report. One short summary at the very end only.

---

## 1. Content — use the skill
Use your `seo-blog-workflow` skill for this article, end to end (gap analysis → SEO/GEO/AEO content brief → full article → final review — E-E-A-T, humanization rules, on-page SEO checklist, no WDD pricing mentions, all of it, don't skip any part of it). Inputs for the skill:

- **Topic / primary keyword:** Website Design Trends in 2026
- **Top competitor URLs to analyze:**
  1. https://www.figma.com/resource-library/web-design-trends/
  2. https://www.behance.net/gallery/239027109/Design-Trends-2026
  3. https://www.godaddy.com/resources/skills/web-design-trends
  4. https://fireart.studio/blog/the-best-web-design-trends/
  5. https://muz.li/blog/web-design-trends-2026/
- **Extra reference articles** (titles + URLs — pull additional angle/gap ideas from these too):
  - "Top Web Design Trends to Watch in 2026" — https://www.pixlogix.com/web-design-trends-2026/
  - "Web Design in 2026: What to Anticipate and How It May Look" — https://wpmanageninja.com/future-of-web-design/
  - "Website Design Trends That Actually Increase Sales in 2026" — https://www.gozoek.com/post/website-design-trends-that-actually-increase-sales-in-2026
- Suggested slug: `website-design-trends-2026` (confirmed free in the DB — verify again before writing, see Section 4).
- Suggested category: **"Design"** (already an existing category in this DB — keep taxonomy consistent, don't invent a new one).

If the skill isn't loaded in this session for any reason, apply the same methodology anyway before publishing — don't lower the bar.

---

## 2. Internal links INSIDE the article body (critical — do not skip)
Same standing rule as every post on this site: the automated `scripts/fill-internal-links.ts` only fills the end-of-article "Related services / Related posts" fields — it never touches body text. That gap is exactly what trips SEO audits.
- Add **at least 4–5 contextual hyperlinks woven directly into body paragraphs or headings** (`<a href="...">descriptive anchor text</a>` inside the HTML), pointing only to real, relevant, existing pages. For this topic, natural spots include: a trend about performance/speed → `/services/website-development`; a trend about custom visuals/branding → `/services/graphic-designing`; a trend about conversion-focused layouts → a genuinely related existing blog post; a trend about e-commerce UX → `/services/ecommerce-development`.
- Descriptive anchor text only (never "click here"), placed naturally mid-sentence — not dumped at a paragraph's end.
- Query existing `blogs` and `services` slugs first (read-only) so every link target is real — never invent a URL.
- Separately, also fill `relatedServices` (1–2 slugs) and `relatedBlogs` (2–3 slugs) admin fields as usual — in addition to, not instead of, the in-body links.

---

## 3. Fields to fill — nothing left empty except image uploads

**`blogs` collection** (mirrors `src/server/models/Blog.ts`): `title`, `slug`, `excerpt`, `content` (full HTML body), `author` ("Web Digital Development Team"), `category` ("Design"), `tags` (5–7), `readTime` (ceil(word count/200)), `published: true`, `seoTitle` (no brand suffix, ~32–50 chars), `seoDescription` (≤155 chars), `relatedServices`, `relatedBlogs`, `order` (append after current max).
- `featuredImage`: leave `""` — owner uploads manually via admin.
- `featuredImageAlt`: DO write this (it's just text) — descriptive, keyword-included.

**`seometas` collection** (mirrors `src/server/models/SeoMeta.ts`), one new entry: `pageSlug` = `blog/<final-slug>`, `title` (no brand suffix), `description` (≤155 chars), `keywords` (primary + secondary + LSI array), `canonical` = `https://webdigitaldevelopment.com/blog/<final-slug>`, `noIndex: false`.
- Leave `ogImage` empty. Every other field here must be filled, nothing blank.

---

## 4. How to write it — same pattern as every other seed script here
`src/server/models/*` and `src/server/db/mongodb.ts` import `"server-only"` and will throw if imported from a standalone script run via `tsx`. Don't import them. Mirror the exact working pattern in `scripts/seed-new-blogs.ts`, `scripts/apply-seo-meta.ts`, and `scripts/fill-internal-links.ts`:
- Manually load `.env.local` (copy their inline env-loader function), then `mongoose.connect(process.env.MONGODB_URI)`.
- Loose `strict: false` inline schemas for `Blog` and `SeoMeta` — no explicit `collection:` override, let mongoose auto-pluralize exactly like the real app models do.
- Upsert by `slug` (blog) / `pageSlug` (SEO meta) via `updateOne({...}, { $set: doc }, { upsert: true })`. Idempotent — never duplicate or delete.
- Save as `scripts/seed-blog-website-design-trends-2026.ts`, run with `npx tsx scripts/seed-blog-website-design-trends-2026.ts`, then read back (find by slug) to confirm both documents exist.

---

## 5. Acceptance criteria
- One new, `published: true`, fully-complete blog live in `blogs` — every field filled except `featuredImage`.
- Matching `seometas` entry for `blog/<final-slug>` — every field filled except `ogImage`.
- At least 4–5 genuine, contextual internal links inside the article body, real targets only.
- No files changed except the one new script under `scripts/`.
- End with a short summary: title, final slug, category, word count, in-body internal links added (list them), live URL, and a one-line featured-image suggestion.

Make all changes directly now.
