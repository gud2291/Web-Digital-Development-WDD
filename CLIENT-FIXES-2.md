# CLIENT-FIXES-2.md — Author follow button, lazy-load audit, accessibility & perf polish

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB + Cloudinary)
Four small, independent fixes. Do them in the order given. **Fix only the actual problems — do not "improve" anything else.**

---

## 0. OPERATIONAL RULES
1. **Start directly. Do NOT ask permission.**
2. **Do NOT run `npm run build` / type-check / lint — the owner tests it himself.** One clean pass.
3. **Do NOT narrate.** 2-3 line summary at the end only.

## 0b. GROUND RULES (nothing may break)
- **Do NOT break any feature, layout, or visual.** Surgical, additive edits only.
- **Match the existing theme** (light/dark, responsive). No new fonts/colors/CSS beyond what a fix needs.
- **Do NOT harm SEO / GEO / AEO** — don't change metadata, JSON-LD schema, headings, robots, sitemap, llms.txt, or visible content meaning.
- **No** `.env`, security, or unrelated changes.

---

## PART 1 — Author "Follow" button (make it work, link set from admin)
**Problem:** On blog detail pages (`src/app/(public)/blog/[slug]/page.tsx`, the author card ~line 178-186), the `Follow` button is a placeholder `<Btn>` with no link — clicking does nothing. The author is a free-text field on the Blog model (`author`, default "Web Digital Development Team").

**Do:**
1. Add an **optional `authorFollowUrl`** field to the Blog model (`src/server/models/Blog.ts`), its zod validation, and the **admin Blog form** (`BlogForm.tsx` + the `[id]` edit loader + new page) — a simple text input labelled e.g. "Author follow link (Instagram/LinkedIn/etc.)". So the link is set from the admin panel where blog content is added.
2. On the blog detail page, make the **Follow button a real link** to `authorFollowUrl` when set — open in a new tab with `target="_blank" rel="noopener noreferrer"`. Keep the exact same button styling/look.
3. **Fallback:** if `authorFollowUrl` is empty, fall back to the site's Instagram (`siteConfig.social.instagram`). If that's also empty, **hide the Follow button** (don't render a dead button).
4. Reflect real URLs only; don't invent any.

**Acceptance:** Follow button links to the admin-set URL (new tab); empty → falls back to Instagram → else hidden; button looks identical; saving/editing the URL in admin round-trips.

---

## PART 2 — Lazy-load audit: above-the-fold images must NOT be lazy
**Problem:** The image-optimization pass set some images to `loading="lazy"`. Above-the-fold / LCP images must load eagerly, not lazy (lazy makes them appear late).

**Do:**
1. **Fix confirmed:** `src/app/(public)/about/page.tsx` (~line 199) — the About hero image (studio workspace `SafeImage`) is above-the-fold but set to `loading="lazy"`. Change it to **eager/priority** (not lazy).
2. **Audit every page type's first/LCP image** and ensure the above-the-fold one is eager/priority, below-the-fold stays lazy:
   - Home hero slider → already eager/priority (leave as-is).
   - Blog cover (`blog/[slug]` ~line 148) → already `priority` ✓.
   - Service cover (`services/[slug]` ~192), Projects list (`projects` ~147), Project detail (`projects/[slug]` ~152) → already `priority` ✓.
   - Check the homepage `SafeImage` at `page.tsx` ~line 523 and the contact image (`contact` ~153): these are **below-the-fold** → `lazy` is correct, leave them.
3. Rule of thumb: the **one main image visible without scrolling on each page = eager/priority**; everything else = lazy. Don't change correctly-lazy images.

**Acceptance:** About hero loads immediately (not lazy); each page's first visible image is eager; below-fold images remain lazy; no layout shift; visuals unchanged.

---

## PART 3 — Accessibility quick wins (lifts the low a11y score, safe)
**Do (each is additive, no visual change unless noted):**
1. **Skip-to-content link:** add a visually-hidden "Skip to content" link as the **first focusable element** in the public layout, that becomes visible on keyboard focus and jumps to the `<main>` content. Standard a11y pattern; invisible until tabbed to.
2. **Button without accessible text:** find the 1 button that has no text/aria-label/title (likely an icon-only button — e.g. a carousel arrow, close, or social icon) and add a descriptive `aria-label`. Do this for any icon-only button missing a label.
3. **Small tap targets:** ensure interactive elements (buttons/links, especially icon buttons and the floating/mobile action buttons) have a **minimum 48×48px** touch target on mobile — increase padding/min-size via the existing styles without changing the visible icon size noticeably.
4. **Contrast:** check the ~8 elements flagged for light-text-on-light-background (likely inline-styled). Where text is genuinely hard to read, darken it slightly to meet ~4.5:1 (3:1 for large text). If a flag is a false positive (text is actually on a dark/colored bg), leave it. Do not restyle anything that already reads fine.

**Acceptance:** keyboard users get a working skip link; no icon-only button missing an aria-label; tap targets ≥48px on mobile; genuinely low-contrast text fixed; design otherwise unchanged.

---

## PART 4 — Minor perf & keyword polish (low priority, be conservative)
1. **Scripts/JS:** ensure any third-party scripts (analytics/GTM/Clarity) load with `afterInteractive`/`lazyOnload` and nothing render-blocking is added. Most non-critical widgets are already deferred — only make safe, additive tweaks; do NOT remove framework chunks or break anything. If nothing can be improved safely, skip.
2. **Keyword density ("website" ~3.3%):** lightly vary a few repeated "website" mentions on the homepage/services copy with natural synonyms ("site", "web presence") **only where it reads naturally** — keep the primary keyword in titles/H1/first paragraph intact. This is minor; if it risks changing meaning or SEO, **skip it**.

**Acceptance:** no render-blocking additions; minor natural keyword variation where safe; no SEO regression.

---

## Order
Part 1 → Part 2 → Part 3 → Part 4. The owner tests + deploys.
