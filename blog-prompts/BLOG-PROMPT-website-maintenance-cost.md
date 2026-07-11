# BLOG-PROMPT — "How Much Does Website Maintenance Cost?"

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB/Mongoose)
**Task:** Research, write, and publish ONE new SEO/GEO/AEO-optimized blog post directly into the live MongoDB database. This is a **content-only** task.

---

## 0. OPERATIONAL RULES
1. Start directly. Ask no questions.
2. Do NOT modify anything under `src/`, `public/`, config files, or any existing file — the ONLY new file allowed is one seed script under `scripts/`. Nothing else changes.
3. Do NOT run build/type-check/lint/full tests. Only run the seed script itself and confirm it completes without errors.
4. No permission gates, no "should I proceed" — write the article, insert it into the DB, confirm it's there, and report. One short summary at the very end only.

---

## 1. Inputs

- **Target keyword / topic:** How Much Does Website Maintenance Cost
- **Top-ranking competitor URLs to analyze (5 unique — a 6th given was a duplicate of #4 and was dropped):**
  1. https://itrobes.com/website-maintenance-cost-india/
  2. https://www.areinfotech.com/website-maintenance-cost-in-india
  3. https://upgrowth.in/website-maintenance-cost-in-india-and-global/
  4. https://www.krishangtechnolab.com/blog/website-maintenance-cost-guide/
  5. https://www.encodedots.com/blog/website-maintenance-cost
- Secondary phrasing to weave in naturally (H2/H3/FAQ, NOT separate posts): "how much do website services cost", "website maintenance cost in 2026".
- Suggested slug: `website-maintenance-cost-india` (confirm it doesn't collide — see Step 5 — adjust only if needed).

---

## 2. Content workflow — follow in order, do not skip steps

### Step 1 — Competitor gap analysis
Analyze the 5 URLs above: what they cover, what they miss (outdated numbers, no India-specific breakdown, no comparison table, thin FAQs, no real maintenance-plan examples, no mention of what happens if you skip maintenance), and what will make this article more useful than all five combined.

### Step 2 — SEO + GEO + AEO brief
Work out (then use): H1, meta description, search intent, primary keyword, secondary/LSI keywords, H2/H3 outline, FAQ questions, internal + external linking opportunities, schema plan (Article + FAQPage).
- SEO title: no brand suffix (site auto-appends " | Web Digital Development"), ~32–50 characters, primary keyword front-loaded.
- Meta description: ≤155 characters.
- Slug: short, lowercase, hyphenated (see suggestion above).

### Step 3 — Full article
- Human-first, conversational, professional. No AI-cliché words (delve, elevate, unlock, leverage, robust, seamless, navigate the landscape, moreover, furthermore, tapestry, realm, game-changer, "it's worth noting", "harness the power of").
- Opening: 2–4 short paragraphs; first 1–2 sentences = a direct, snippet-ready answer to "how much does website maintenance cost".
- A short **Key Takeaways** bullet list near the top.
- Main H2 sections, each opening with a one-line direct answer, then detail/examples. H3 for sub-points. Include **at least one comparison table** (e.g. cost by plan/tier or by site complexity — basic/standard/e-commerce).
- **FAQ section:** 5–8 H3 questions, 40–60 word answers (must include a question covering "how much do website services cost").
- Conclusion + CTA inviting contact — **never state Web Digital Development's own prices/fees.** General industry cost ranges/factors are fine and expected — that's the article's whole point.
- E-E-A-T: write like someone who has actually managed client sites post-launch — concrete numbers, realistic scenarios, named examples where plausible. Attribute to "Web Digital Development Team". Reference the real track record (Delhi-based, since 2019, 400+ sites, 250+ clients) once, naturally.
- On-page SEO: primary keyword in H1, first 100 words, ≥1 H2, SEO title, meta description, slug, one image alt text; ~0.8–1.5% density, never stuffed. Exactly one H1. 1–2 external links to authoritative non-competitor sources.

### Step 4 — Internal links INSIDE the article body (critical — do not skip)
This is the most important part of this task. The site's existing automation (`scripts/fill-internal-links.ts`) only fills the **end-of-article "Related services / Related posts" fields** — it does not touch the body text. That gap is exactly what keeps triggering the "no in-content internal links" warning in SEO audits.
- Add **at least 4–5 contextual hyperlinks woven directly into body paragraphs or sub-headings** (real `<a href="...">descriptive anchor text</a>` inside the HTML content) — not a bare link dropped at the end of a paragraph, and never "click here" as anchor text.
- Only link to real, relevant, existing pages — query them first (Step 5). Examples of the kind of natural placement to aim for: a paragraph about ongoing SEO upkeep links to `/services/seo-services`; a mention of redesigning an aging site links to an existing related blog post; a line about e-commerce upkeep links to `/services/ecommerce-development`; a mention of picking the right team links to an existing "how to choose a developer" post.
- Separately (in addition to the above, not instead of it), also fill the `relatedServices` (1–2 slugs) and `relatedBlogs` (2–3 slugs) admin fields as usual.

### Step 5 — Before writing anything
Connect read-only first and list existing `blogs` and `services` slugs (same idea as `scripts/check-db-slugs.ts`) so you can: (a) confirm the new slug is free, (b) pick real, genuinely relevant internal-link targets for Step 4.

### Step 6 — Final SEO/GEO/AEO self-review before publishing
Check: primary keyword placement, 3+ LSI keywords used naturally, all in-body internal links present and pointing to real slugs, E-E-A-T signals present, on-page checklist satisfied, zero WDD price/fee mentions, meta description ≤155 chars, SEO title ≤50 chars without brand suffix.

---

## 3. Fields to fill — nothing left empty except image uploads

**`blogs` collection** (mirrors `src/server/models/Blog.ts`):
`title`, `slug`, `excerpt`, `content` (full HTML body), `author` ("Web Digital Development Team"), `category` = **"Maintenance"** (already an existing category in this DB — keep taxonomy consistent, don't invent a new one), `tags` (5–7), `readTime` (ceil(word count / 200)), `published: true`, `seoTitle`, `seoDescription`, `relatedServices`, `relatedBlogs`, `order` (append after current max `order`).
- `featuredImage`: leave `""` — owner uploads manually via admin.
- `featuredImageAlt`: DO write this (it's just text) — descriptive, includes the keyword naturally.
- `authorFollowUrl`: leave `""` unless an existing post already sets a standard value worth reusing.

**`seometas` collection** (mirrors `src/server/models/SeoMeta.ts`), one new entry:
`pageSlug`: `blog/<final-slug>`, `title` (no brand suffix), `description` (≤155 chars), `keywords` (primary + secondary + LSI array), `canonical`: `https://webdigitaldevelopment.com/blog/<final-slug>`, `noIndex: false`.
- Leave `ogImage` empty — owner adds it manually. Every other field here must be filled, nothing blank.

---

## 4. How to write it — follow the codebase's own established pattern

`src/server/models/*` and `src/server/db/mongodb.ts` import `"server-only"` and will throw if imported from a standalone script run via `tsx`. Do NOT try to import them. Instead, mirror the exact working pattern already used in `scripts/seed-new-blogs.ts`, `scripts/apply-seo-meta.ts`, and `scripts/fill-internal-links.ts`:

- Manually load `.env.local` (copy the same inline env-loader function those scripts use).
- `mongoose.connect(process.env.MONGODB_URI)`.
- Define loose `strict: false` inline schemas for `Blog` and `SeoMeta` — do NOT pass an explicit `collection:` name, let mongoose auto-pluralize exactly like the real app models do, so writes land in the same collections the site reads from.
- Upsert by `slug` (blog) / `pageSlug` (SEO meta) using `updateOne({...}, { $set: doc }, { upsert: true })`. Never delete or duplicate. Never overwrite a field that's already non-empty if you ever re-run this (idempotent).
- Save the script as `scripts/seed-blog-website-maintenance-cost.ts`. Run with `npx tsx scripts/seed-blog-website-maintenance-cost.ts`. Confirm both upserts print success.
- After running, do a quick read-back (find by slug) to confirm both documents exist, then report the live URL.

---

## 5. Acceptance criteria
- One new, `published: true`, fully-complete blog post live in `blogs` — every field filled except `featuredImage`.
- Matching `seometas` entry for `blog/<final-slug>` — every field filled except `ogImage`.
- At least 4–5 genuine, contextual internal links inside the article body (not just the end-of-article related fields), pointing only to real existing slugs.
- Article satisfies the on-page SEO checklist, E-E-A-T signals, humanization rules, and never states WDD's own prices.
- No files changed except the one new script under `scripts/`.
- End with a short summary: title, final slug, category, word count, list of in-body internal links added, live URL, and a one-line suggestion for what photo the owner should upload as the featured image.

Make all changes directly now.
