# SEMRUSH-FIXES.md — Clear the remaining Semrush audit issues

**Site:** webdigitaldevelopment.com (Next.js 14 App Router + MongoDB)
**Goal:** Fix the 3 real issues from the Semrush Site Audit (17 Jun 2026) so the **next audit shows 0 errors and no new warnings/notices** — without breaking anything.

The audit is already very clean (no 4XX/5XX, no missing/duplicate titles, no missing meta/H1/alt, no broken internal links, HTTPS fine, only ONE H1 per page). Only these remain:
- **Error:** 2 invalid structured-data items
- **Warning:** 30 broken external links, 36 low text-HTML ratio, 1 low word count
- **Notice:** 17 orphaned pages in sitemap, 3 pages with one internal link, 2 pages >3 clicks deep

This file covers the 3 worth fixing: **(1) structured data, (2) orphaned pages / internal links, (3) broken external links.** Low text-HTML ratio is inherent to a JS app and is left as-is.

---

## 0. OPERATIONAL RULES (how to work — follow exactly)
1. **Start the work directly. Do NOT ask for permission or confirmation.**
2. **Do NOT run `npm run build` / type-check / lint — the owner verifies the build himself.** Just make the changes correctly in one pass.
3. **Do NOT narrate, explain step-by-step, or summarize at length.** Keep output minimal (it wastes tokens). A short "done + what changed in 2-3 lines" at the end is enough.
4. Work only on the part the current prompt names (Part 1, 2, or 3 — one at a time).

## 0b. GROUND RULES (must not break anything)
- **Do NOT break any feature** — admin, auth/2FA, chatbot, forms, preview, APIs, CMS all keep working.
- **Do NOT change the theme, colors, fonts, layout, spacing, animations, or any existing UI/UX.** Changes must look native to the current design. Internal links you ADD (Part 2) must match existing styles and not restructure any page.
- **Do NOT change existing page content meaning, titles, meta descriptions, or headings.**
- **Do NOT weaken security, and do NOT touch `next.config.mjs` headers/CSP/auth/middleware.**
- **Do NOT touch any `.env*` file or images/media/Cloudinary.**
- **Structured data must reflect only REAL, on-page information** — never invent ratings, reviews, or facts.
- Surgical, additive edits only. Do not refactor unrelated code.

---

## PART 1 — Fix the 2 invalid structured-data items (Error)
**Where:** `src/components/SchemaMarkup.tsx` and every page/component that renders JSON-LD (home, about, services/[slug], blog/[slug], projects, locations/[slug], etc.).

**What:** Semrush found 2 structured-data items that fail Google's requirements. Audit ALL JSON-LD the site emits and make every item valid against Google Rich Results + schema.org requirements, so the count goes to 0 (and stays 0).

**Check each schema type against its required fields — fix any that are missing/malformed:**

- **AggregateRating** (the reviews/rating block): must include `ratingValue`, `reviewCount` OR `ratingCount`, `bestRating` (5), `worstRating` (1), AND must be attached to a parent item that has a `name` (e.g. nested in the Organization/LocalBusiness/ProfessionalService node, or via `itemReviewed`). A bare/floating AggregateRating, or one missing `reviewCount`, is invalid. Use only the REAL numbers shown on the site (e.g. 4.9 / 130+).
- **Review** items (if emitted): each needs `author` (with `name`), `reviewRating` (with `ratingValue` + `bestRating`), and must be attached to an item with a `name` (`itemReviewed` or nested). Missing `author` or `reviewRating` = invalid.
- **Article** (blog posts): needs `headline` (≤110 chars), at least one valid `image` URL, `datePublished`, `dateModified`, `author` (Person/Organization with `name`), and `publisher` (Organization with `name` + `logo` as an `ImageObject` with a `url`). Missing `image` or `publisher.logo` is the most common error.
- **FAQPage**: every `Question` needs a non-empty `name` AND `acceptedAnswer` with non-empty `text`. An empty answer = invalid. The schema Q&A must match the visible FAQ exactly.
- **Service**: needs `name` and `provider` (and ideally `areaServed`).
- **BreadcrumbList**: every `ListItem` needs `position`, `name`, and `item` (absolute URL).
- **Organization / ProfessionalService / WebSite**: ensure `@id`, `name`, `url` and absolute URLs (no relative paths) — these are mostly fine already; just verify.

**Rules:** every `url`/`image`/`logo`/`item` must be an ABSOLUTE https URL (use the .com domain, not relative). Don't add schema for content that isn't visible on the page. Don't invent data.

**Acceptance:** every JSON-LD block on every page validates clean against Google's requirements; the "invalid structured data items" count is 0 on re-audit; rich results (stars, FAQ, breadcrumb, article) remain eligible.

---

## PART 2 — Fix 17 orphaned pages / weak internal linking (Notice)
**Problem:** 17 pages are in the sitemap but have NO internal links pointing to them, so crawlers only find them via the sitemap (weak signal). These are almost certainly the **location pages** (`/locations/[slug]`) and the **project detail pages** (`/projects/[slug]`). Also: 3 pages have only one incoming internal link, and 2 pages are >3 clicks deep.

**Fix — add internal links in a way that matches the existing design (additive only, no redesign):**

1. **Project detail pages** (`/projects/[slug]`): on the projects list page (`/projects`) and the homepage portfolio section, make each project card link INTERNALLY to its `/projects/[slug]` detail page (e.g. the card title or an existing "View details"/card click → internal route). Keep any existing external "Live Preview" link as-is; just ensure there is ALSO an internal link to the detail page. Match the current card styling exactly.

2. **Location pages** (`/locations/[slug]`): add internal links to all location pages from a sitewide, design-consistent place — e.g. a small "Service Areas" / "Locations" links group in the **footer** (the footer already mentions "Delhi, Noida, Gurgaon, Faridabad" as plain text — turn those into / add them as links to the matching `/locations/[slug]`). Keep the footer's existing look; only add a tidy links row/column consistent with the other footer columns.

**Rules:** additive internal links only, styled like existing links; do not restructure layout, do not remove existing content, do not change the theme. Ensure every location and project page ends up with at least one internal link from a normally-crawlable page (not just the sitemap), and that no important page needs more than 3 clicks from the homepage.

**Acceptance:** on re-audit, "orphaned pages in sitemaps" → 0 (or only legitimately standalone pages), "pages with only one incoming internal link" reduced, crawl depth ≤3 for key pages; design looks unchanged otherwise.

---

## PART 3 — Fix 30 broken external links (Warning)
**Problem:** 30 external (outbound) links are reported broken. Likely sources:
- **About page team LinkedIn URLs are placeholders** (`linkedin.com/in/placeholder-rohit`, `placeholder-priya`, `placeholder-arjun`, `placeholder-neha`) — these are definitely broken.
- **Project "Live Preview" links** to client sites — some client sites may be down or moved.
- Social links in `src/config/site.ts` — verify each resolves.

Note: some "broken" links are **false positives** (the target site blocks Semrush's crawler) — those are fine and should be left alone.

**Fix:**
1. **Code-level / config links:** in `src/config/site.ts`, verify the social URLs; fix any obviously wrong one. Remove or correct any hardcoded broken external link in components.
2. **Placeholder LinkedIn links + project links live in the DATABASE** (team members + projects, edited in the admin panel). Do NOT write to the production DB. Instead:
   - Fix the **seed/default** values where placeholders exist (e.g. seed scripts) so future seeds are clean.
   - Produce a file **`SEMRUSH-DB-LINKS.md`** listing every DB-stored external link that needs the owner's attention (each team member with a placeholder/❌ LinkedIn, each project whose live-preview URL looks dead/empty), with a clear instruction to fix or remove it in the admin panel. For team members, the safe default is: if there's no real LinkedIn, remove the link rather than leave a placeholder.

**Rules:** never invent a real person's profile URL. If a real URL isn't known, the link should be removed (not faked). Don't remove legitimate working links. Don't touch the DB directly.

**Acceptance:** no hardcoded broken external links remain in code/config; placeholder LinkedIn links are removed from seed/defaults; `SEMRUSH-DB-LINKS.md` lists the DB links for the owner; on re-audit (after the owner fixes the DB links) broken-external-links drops to only genuine false positives.

---

## Execution order
Do them one prompt at a time, in this order: **Part 1 → Part 2 → Part 3.** The owner will run the build and re-audit after each.
