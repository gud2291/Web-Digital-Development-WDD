# BLOG-PROMPT — "Website Audit Checklist for Business Owners"

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
Use your `seo-blog-workflow` skill for this article end to end (gap analysis → SEO/GEO/AEO content brief → full article → final review — E-E-A-T, humanization rules, on-page SEO checklist, no WDD pricing mentions). No existing post on this site covers "website audit" specifically — closest neighbors are the maintenance posts (see Section 2), not a duplicate. Inputs:

- **Topic / primary keyword:** Website Audit Checklist for Business Owners
- **Top competitor URLs to analyze:**
  1. https://www.wix.com/blog/website-audit-checklist
  2. https://www.linkedin.com/posts/jitendra-kumar-web-designer_simple-website-audit-checklist-10-points-activity-7445288902476689408-_lX6
  3. https://theloopmarketing.com/annual-website-audit-checklist/
  4. https://www.wordstream.com/blog/ws/2022/01/24/website-audit-checklist
  5. https://authenticstyle.co.uk/website-audit-checklist/
- **Extra reference articles** (use for angle/gap ideas too):
  - "Website Audit Checklist for Small Businesses" — https://stackra.app/blog/website-audit-checklist-small-business/
  - "Small Business Website Audit: A 10-Point Checklist for 2026" — https://www.sequentcreative.com/small-business-website-audit-2026/
  - "The Ultimate Website Audit Checklist" — https://medium.com/@digitalmarketing_65618/the-ultimate-website-audit-checklist-8485e081087e
- Suggested slug: `website-audit-checklist` (confirmed free in the DB — verify again before writing).
- Suggested category: **"Maintenance"** (matches this DB's existing taxonomy and its own internal-linking topic-detection bucket, which already treats "audit" as a maintenance-topic keyword).

If the skill isn't loaded in this session, apply the same methodology anyway before publishing — don't lower the bar.

---

## 2. Internal links INSIDE the article body (critical — do not skip)
Same standing rule as every post on this site: `scripts/fill-internal-links.ts` only fills the end-of-article "Related services / Related posts" fields — it never touches body text. That gap is what trips SEO audits.

This topic is a natural linking hub — several genuinely relevant posts/services already exist on this site. Verify each still exists (read-only slug query first) and weave in naturally, don't force all of them:
- `/blog/website-maintenance-cost-india` — once the audit finds problems, readers will want to know what fixing/maintaining them costs.
- `/blog/website-maintenance-after-launch` — the ongoing-task checklist this audit feeds into.
- `/blog/website-redesign-signs-losing-customers` — for when the audit reveals the site needs more than small fixes.
- `/services/seo-services` — for the technical/SEO-audit section.
- `/services/website-development` — for when the audit points to a rebuild, not a patch.

- At least **4–5 contextual hyperlinks woven directly into body paragraphs/headings** (`<a href="...">descriptive anchor text</a>`), real targets only — never invent a URL.
- Descriptive anchor text only (never "click here"), placed naturally mid-sentence — not dumped at a paragraph's end.
- Separately, also fill `relatedServices` (1–2 slugs) and `relatedBlogs` (2–3 slugs) admin fields as usual — in addition to, not instead of, the in-body links.

---

## 3. Fields to fill — nothing left empty except image uploads

**`blogs` collection** (mirrors `src/server/models/Blog.ts`): `title`, `slug`, `excerpt`, `content` (full HTML body), `author` ("Web Digital Development Team"), `category` ("Maintenance"), `tags` (5–7), `readTime` (ceil(word count/200)), `published: true`, `seoTitle` (no brand suffix, ~32–50 chars), `seoDescription` (≤155 chars), `relatedServices`, `relatedBlogs`, `order` (append after current max).
- `featuredImage`: leave `""` — owner uploads manually via admin.
- `featuredImageAlt`: DO write this (it's just text) — descriptive, keyword-included.

**`seometas` collection** (mirrors `src/server/models/SeoMeta.ts`), one new entry: `pageSlug` = `blog/<final-slug>`, `title` (no brand suffix), `description` (≤155 chars), `keywords` (primary + secondary + LSI array), `canonical` = `https://webdigitaldevelopment.com/blog/<final-slug>`, `noIndex: false`.
- Leave `ogImage` empty. Every other field here must be filled, nothing blank.

---

## 4. How to write it — same pattern as every other seed script here
`src/server/models/*` and `src/server/db/mongodb.ts` import `"server-only"` and will throw if imported from a standalone script run via `tsx`. Don't import them. Mirror `scripts/seed-new-blogs.ts` / `scripts/apply-seo-meta.ts` / `scripts/fill-internal-links.ts`:
- Manually load `.env.local` (copy their inline env-loader function), then `mongoose.connect(process.env.MONGODB_URI)`.
- Loose `strict: false` inline schemas for `Blog` and `SeoMeta` — no explicit `collection:` override, let mongoose auto-pluralize exactly like the real app models do.
- Upsert by `slug` (blog) / `pageSlug` (SEO meta) via `updateOne({...}, { $set: doc }, { upsert: true })`. Idempotent — never duplicate or delete.
- Save as `scripts/seed-blog-website-audit-checklist.ts`, run with `npx tsx scripts/seed-blog-website-audit-checklist.ts`, then read back (find by slug) to confirm both documents exist.

---

## 5. Acceptance criteria
- One new, `published: true`, fully-complete blog live in `blogs` — every field filled except `featuredImage`.
- Matching `seometas` entry for `blog/<final-slug>` — every field filled except `ogImage`.
- At least 4–5 genuine, contextual internal links inside the article body, real targets only.
- No files changed except the one new script under `scripts/`.
- End with a short summary: title, final slug, category, word count, in-body internal links added (list them), live URL, one-line featured-image suggestion.

Make all changes directly now.
