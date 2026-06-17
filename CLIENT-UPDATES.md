# CLIENT-UPDATES.md — Two client requests

**Site:** webdigitaldevelopment.com (Next.js 14 App Router + MongoDB)
Two independent tasks. Do them **one prompt at a time** (Part 1, then Part 2).

---

## 0. OPERATIONAL RULES (how to work)
1. **Start directly. Do NOT ask permission.**
2. **Do NOT run `npm run build` / type-check / lint — the owner verifies the build.** Make the change correctly in one pass.
3. **Do NOT narrate or explain step-by-step.** A 2-3 line summary at the end is enough.

## 0b. GROUND RULES (must not break anything)
- **Do NOT break any existing feature, page, or content.** Additive/surgical edits only.
- **Match the existing design exactly** — reuse existing components/classes/typography (container, Eyebrow/SectionHead, Reveal, `t-h2`/`t-h3`/`t-lead`, existing `Btn`, existing form fields). **No new font family/size/color/custom CSS** beyond what existing classes give. Must look native in **light AND dark** mode and be fully **responsive**.
- **Headings/SEO:** never add a second `<h1>` to any page; keep logical h1→h2→h3 order. Do not change existing titles, meta descriptions, canonicals, or schema. No SEO/GEO/AEO regression — content must be real server-rendered text.
- **No changes** to security, `next.config.mjs`, auth, or `.env*`. (Part 2 changes image markup/data, not image files themselves.)

---

## PART 1 — Keep a CONDENSED "Who We Are" on the homepage (+ optional on About)
**Why:** The homepage felt overloaded. Decision: **keep the "Who We Are" section ON the homepage, but trimmed to only the important content** (concise + premium, not heavy). Optionally also add a fuller version on the About page **only if it fits naturally**.

**Do:**
1. **Homepage (`src/app/(public)/page.tsx`):** keep/ensure a "Who We Are" section, but **CONDENSE it to the important parts only** so it doesn't overload the page. Keep roughly: one short intro line, a tight **"What We Bring to the Table"** list (semantic `<ul>`, each service linked to its `/services/[slug]` page), and one short trust/credibility line. **Drop the long paragraphs** ("Why It Matters", the full "Built for Businesses" prose) from the homepage version. Place it where it reads naturally (e.g. near/above the existing "About Us" summary). Section title = **`<h2>`**, any sub-heading = **`<h3>`**; **keep exactly one `<h1>`** on the page. Use "since 2019" (not "4+ years"). Match the theme (light + dark) and be responsive.
2. **About page (`src/app/(public)/about/page.tsx`) — OPTIONAL (your judgment):** if it integrates cleanly **without duplicating** the existing founder story, add a fuller "Who We Are" block below the existing About content (h2 + h3s: "What We Bring to the Table" with service links, "Why It Matters", "Built for Businesses That Mean Business", plus a short 2-3 sentence Gudia Yadav note that doesn't repeat the existing story). If it would clutter or duplicate, **skip the About page** entirely.
3. Do **not** touch any other homepage/About section (hero, stats, existing About summary, services, portfolio, reviews, blog, FAQ, CTA stay exactly as they are).

**Acceptance:** the homepage has a **concise** Who We Are that does not overload the page and matches the theme (light+dark, responsive); exactly one `<h1>` per page; if added to /about it's complementary (not duplicate); nothing else changed.

---

## PART 2 — Admin option to add ALT text to images
**Why:** The client wants to set image **alt text** from the admin panel (for SEO + accessibility), for the images across the site.

**Do (additively — every alt field is optional, with safe fallback to current behaviour):**
1. **Media library:** add an editable **`alt`** field to the Media model/record. In the admin **Media** UI (`MediaClient`), show an input to set/edit the alt text per image (and allow setting it on upload). The media admin API (`/api/admin/media`, `/upload`, `/[id]`) should accept and persist `alt`. Validate with the existing zod pattern.
2. **Entity images:** add an optional **alt** field for the images attached to content the admin manages, and surface it in those admin forms:
   - Projects (`coverImage` → add `coverImageAlt`), Services (`coverImage` → alt), Team members (photo → alt), Blog posts (cover → alt), and the Homepage hero slides if they carry images.
   - Add the field to each entity's schema/validation + its admin form input.
3. **Rendering:** wherever these images render (CldImage/SafeImage and the public pages), use the stored alt as the `alt` attribute. **Fallback** (when alt is empty) to the current behaviour (e.g. the existing title/name-based alt) so nothing regresses and no image ends up with a broken/empty render.
4. Do **not** auto-generate fake alt text or change any image file. Existing images simply get an editable, initially-empty alt that the owner can fill in.

**Acceptance:** in the admin panel, the owner can add/edit alt text for media-library images and for project/service/team/blog/hero images; the chosen alt renders as the image's `alt` attribute on the live site; empty alt falls back to current behaviour; existing media/upload/display features still work unchanged; build/types stay valid.

---

## Order
Part 1 first (content move), then Part 2 (alt-text feature). The owner deploys and verifies after each.
