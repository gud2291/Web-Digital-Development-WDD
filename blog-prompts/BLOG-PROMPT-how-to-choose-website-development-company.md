# BLOG-PROMPT — "How to Choose the Best Website Development Company"

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB/Mongoose)
**Task:** Research, write, and publish ONE new blog post directly into the live MongoDB database. Content-only task.

---

## 0. OPERATIONAL RULES
1. Start directly. Ask no questions.
2. Do NOT modify anything under `src/`, `public/`, config files, or any existing file — the ONLY new file allowed is one seed script under `scripts/`.
3. Do NOT run build/type-check/lint/full tests. Only run the seed script and confirm it completes without errors.
4. No permission gates. Write, publish, confirm, report. One short summary at the very end only.

---

## 1. Read before writing — this overlaps with an existing live post
This site already has a live post on an adjacent topic: **"Website Development Company Near Me: How to Choose the Right Partner"** (`/blog/website-development-company-near-me`, category How-To). That post is written for **local / "near me" search intent**. To avoid this new post cannibalizing it in search, angle this one differently:

- Position this NEW post as the **complete evaluation-criteria / checklist guide** — portfolio quality, tech stack, communication, transparent scope & pricing structure, post-launch support, reviews, red flags / green flags. NOT location-based, no "near me" framing or overlapping examples.
- Naturally cross-link to the near-me post for readers with local intent — e.g. a sentence like "if you specifically want a local team, see our guide on finding a website development company near you" linking to `/blog/website-development-company-near-me`. This doubles as one of the required in-body internal links (Section 3).
- Also naturally mention/link the sibling post `/blog/how-to-choose-website-design-company-delhi-2026` ("How to Choose a Website Design Company in Delhi") to clarify the development-vs-design distinction for readers — another genuine in-body link, not forced.

---

## 2. Content — use the skill
Use your `seo-blog-workflow` skill for this article end to end (gap analysis → SEO/GEO/AEO content brief → full article → final review — E-E-A-T, humanization rules, on-page SEO checklist, no WDD pricing mentions, all of it). Inputs:

- **Topic / primary keyword:** How to Choose the Best Website Development Company
- **Top competitor URLs to analyze:**
  1. https://www.w2ssolutions.com/faq/choose-the-right-web-development-company
  2. https://www.linkedin.com/pulse/how-choose-perfect-web-development-company-2024-zorbis-inc--z6wic
  3. https://www.iqradigitalsolutions.in/blog/how-to-pick-the-best-website-development-company-in-india/
  4. https://www.bcwebwise.com/blog/how-to-choose-right-website-development-company/
  5. https://www.aress.com/blog/read/10-tips-for-choosing-the-right-web-development-company
- **Extra reference article:** "How To Choose The Best Website Development Company..." — https://www.zookti.com/best-website-development-company-in-nepal/
- **Secondary search queries to cover naturally (FAQ / body — no URL given, these are queries not pages, don't treat as competitor pages to analyze):** "How to choose the right website development company?", "How to find a good web development company?"
- Suggested slug: `how-to-choose-website-development-company` (confirmed free in the DB — verify again before writing).
- Suggested category: **"How-To"** (matches the sibling design-company post — keep taxonomy consistent).

If the skill isn't loaded in this session, apply the same methodology anyway before publishing — don't lower the bar.

---

## 3. Internal links INSIDE the article body (critical — do not skip)
Same standing rule as every post on this site: `scripts/fill-internal-links.ts` only fills the end-of-article "Related services / Related posts" fields — it never touches body text. That gap is what trips SEO audits.
- At least **4–5 contextual hyperlinks woven directly into body paragraphs/headings** (`<a href="...">descriptive anchor text</a>`), real targets only — query existing `blogs`/`services` slugs first, never invent a URL.
- Must include the two cross-links from Section 1 (near-me post + design-company post), plus 2–3 more to relevant services (e.g. `/services/website-development`) or other genuinely related posts.
- Descriptive anchor text only (never "click here"), placed naturally mid-sentence.
- Separately, also fill `relatedServices` (1–2 slugs) and `relatedBlogs` (2–3 slugs, should include the near-me post) admin fields as usual — in addition to, not instead of, the in-body links.

---

## 4. Fields to fill — nothing left empty except image uploads

**`blogs` collection** (mirrors `src/server/models/Blog.ts`): `title`, `slug`, `excerpt`, `content` (full HTML body), `author` ("Web Digital Development Team"), `category` ("How-To"), `tags` (5–7), `readTime` (ceil(word count/200)), `published: true`, `seoTitle` (no brand suffix, ~32–50 chars), `seoDescription` (≤155 chars), `relatedServices`, `relatedBlogs`, `order` (append after current max).
- `featuredImage`: leave `""` — owner uploads manually via admin.
- `featuredImageAlt`: DO write this (it's just text) — descriptive, keyword-included.

**`seometas` collection** (mirrors `src/server/models/SeoMeta.ts`), one new entry: `pageSlug` = `blog/<final-slug>`, `title` (no brand suffix), `description` (≤155 chars), `keywords` (primary + secondary + LSI array), `canonical` = `https://webdigitaldevelopment.com/blog/<final-slug>`, `noIndex: false`.
- Leave `ogImage` empty. Every other field here must be filled, nothing blank.

---

## 5. How to write it — same pattern as every other seed script here
`src/server/models/*` and `src/server/db/mongodb.ts` import `"server-only"` and will throw if imported from a standalone script run via `tsx`. Don't import them. Mirror `scripts/seed-new-blogs.ts` / `scripts/apply-seo-meta.ts` / `scripts/fill-internal-links.ts`:
- Manually load `.env.local` (copy their inline env-loader function), then `mongoose.connect(process.env.MONGODB_URI)`.
- Loose `strict: false` inline schemas for `Blog` and `SeoMeta` — no explicit `collection:` override, let mongoose auto-pluralize exactly like the real app models do.
- Upsert by `slug` (blog) / `pageSlug` (SEO meta) via `updateOne({...}, { $set: doc }, { upsert: true })`. Idempotent — never duplicate or delete.
- Save as `scripts/seed-blog-how-to-choose-website-development-company.ts`, run with `npx tsx scripts/seed-blog-how-to-choose-website-development-company.ts`, then read back (find by slug) to confirm both documents exist.

---

## 6. Acceptance criteria
- One new, `published: true`, fully-complete blog live in `blogs` — every field filled except `featuredImage`.
- Matching `seometas` entry for `blog/<final-slug>` — every field filled except `ogImage`.
- Clearly angled away from the existing "near me" post (no duplicate framing), with genuine cross-links to both related existing posts.
- At least 4–5 genuine, contextual internal links inside the article body, real targets only.
- No files changed except the one new script under `scripts/`.
- End with a short summary: title, final slug, category, word count, in-body internal links added (list them), live URL, one-line featured-image suggestion.

Make all changes directly now.
