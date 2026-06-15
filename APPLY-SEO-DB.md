# APPLY-SEO-DB.md — Push the SEO titles/descriptions into the database

Goal: apply every title/description in `SEO-DB-TODO.md` to the database so the live
pages stop showing the old long titles/descriptions. These values live in the DB
(the `SeoMeta` collection + each service/blog/location entity), **not** in code, so a
code deploy alone does not fix them.

This is a one-time, idempotent data script — no UI/theme/feature changes.

---

## ⚠️ READ FIRST — which database gets changed

The script connects using **`MONGODB_URI` from `.env.local`** (same as the existing
`scripts/*.ts`). It writes to whatever database that URI points to:

- If `.env.local`'s `MONGODB_URI` is the **production** database → running the script
  updates the **live** site's content immediately (no deploy needed).
- If it points to a **local/dev** database → only local changes; the live site is
  unaffected unless production uses the same DB.

Do **not** edit any `.env*` file. Just read `MONGODB_URI` as the existing scripts do.
Before the real run, print (masked) which host/db name is targeted and **stop for the
owner to confirm** it's the intended database.

---

## Ground rules
1. Only touch **SEO fields**: on `SeoMeta` → `title`, `description`, `keywords` (and
   leave `canonical`, `ogImage` empty/unchanged, `noIndex` = false). On service/blog/
   location entities → only `seoTitle` / `seoDescription` (fallback layer).
2. **Never delete** any document or any non-SEO field. Never set `noIndex: true` on a
   public page.
3. **Idempotent upsert by slug** — running it twice must produce the same result.
4. Titles are stored **without** the brand suffix (the site appends
   `| Web Digital Development` automatically via `buildMetadata`). Keep each final
   rendered title ≤ 60 characters and each description 120–155 characters.
5. Reuse the existing DB-connection pattern (see `scripts/check-db-slugs.ts` /
   `scripts/backfill-service-icons.ts`) and the existing `SeoMeta` model /
   `src/server/services/seoMeta.service.ts`. Do not invent a new connection.
6. No changes to env, images, theme, UI/UX, or any feature.

---

## What to build
Create `scripts/apply-seo-meta.ts`:

- Loads `MONGODB_URI` from env, connects via mongoose (same as other scripts).
- A hardcoded array `ENTRIES` of `{ pageSlug, title, description, keywords? }` taken
  **verbatim from `SEO-DB-TODO.md`**, covering:
  - Static pages: `home, about, blog, contact, legal, reviews, services, projects`
    (and `sitemap` if a row exists).
  - Services: `services/website-designing`, `services/website-development`,
    `services/seo-services`, `services/digital-marketing`,
    `services/ecommerce-development`, `services/graphic-designing`,
    `services/wordpress-website`, `services/mobile-first-design`.
  - Locations: `locations/delhi`, `locations/noida`, `locations/gurgaon`,
    `locations/faridabad`, `locations/ghaziabad`.
  - Blog posts: each `blog/<slug>` row listed in `SEO-DB-TODO.md`.
- For each entry: **upsert** a `SeoMeta` doc by `pageSlug` (update title/description/
  keywords; set `noIndex: false`; do not clobber an existing custom `ogImage`/
  `canonical` — only set if empty).
- Before upserting, only include a `pageSlug` if the corresponding public route/entity
  actually exists (skip + log any slug whose service/blog/location is not found in the
  DB, so we don't create orphan SEO rows). Use `scripts/check-db-slugs.ts` logic to
  resolve real slugs.
- Optionally (second pass) also set `seoTitle`/`seoDescription` on the matching
  service/blog/location entity as a fallback, **only if those fields are empty**.
- Flags:
  - `--dry-run` → print a table of every change (slug, old → new title/description)
    and exit **without writing**. This must be the default-safe first step.
  - `--commit` → actually write.
- Print, before writing: the masked DB target (host + db name) and a one-line summary;
  require `--commit` to proceed.
- On finish: print counts (created / updated / skipped) and disconnect.

Add an npm script if helpful: `"apply-seo": "tsx scripts/apply-seo-meta.ts"`.

---

## How the owner runs it
1. `npx tsx scripts/apply-seo-meta.ts --dry-run` → review the printed changes + the DB
   target shown.
2. If the target DB and changes look right: `npx tsx scripts/apply-seo-meta.ts --commit`.
3. Re-crawl `https://webdigitaldevelopment.com` in Screaming Frog and confirm
   "Page Titles > Over 60" and "Meta Description > Over 155" counts drop.

## Verification (the agent must do before handing back)
- `--dry-run` output is correct and changes only SEO fields.
- Type-check/lint pass (`npm run type-check`, `npm run lint`).
- No model/schema/feature/UI files were modified — only the new script (+ optional
  package.json npm-script line).
- Re-state the rendered title length for 3 sample slugs (home, services/seo-services,
  one blog post) is ≤ 60 chars after the brand suffix.

## Rollback
The script prints the previous title/description for every doc it changes during
`--dry-run`; save that output so any value can be restored manually if needed.
(It never deletes documents.)
