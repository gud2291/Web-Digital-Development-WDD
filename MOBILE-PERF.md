# MOBILE-PERF.md — Mobile performance: hero slider lazy, responsive sizes, legacy JS

**Site:** webdigitaldevelopment.com (Next.js 14 + Cloudinary)
**Goal:** Improve mobile PageSpeed (LCP/FCP/load weight) with 3 code-only changes. **No images/videos are resized by hand** — this is delivery + loading config only. The site must look and behave exactly as it does now.

---

## 0. OPERATIONAL RULES
1. **Start directly. Do NOT ask any questions.**
2. **Do NOT explain or narrate.** A 2-3 line summary at the very end only.
3. **Do NOT run build / type-check / lint / tests — the owner tests himself.** Just make the changes correctly in one pass.

## 0b. GROUND RULES (nothing may break)
- **Do NOT break any feature or function** — slider, carousels, forms, admin, chatbot, navigation, everything keeps working exactly as now.
- **Do NOT change the UI/visuals** — every image must render at the same size, position, aspect ratio, crop, and quality it does now. No layout/theme/animation change.
- **No** changes to data/schema/SEO metadata/security/`.env`. Surgical edits only.

---

## PART 1 — Hero slider: first slide eager, the rest lazy
**File:** `src/components/public/HeroSlider.tsx`
- Currently the first slide image is `priority`/eager and the **other slides are also eager** — so all slide images load upfront, which slows mobile.
- **Change:** keep **slide 0 (the visible first slide) `priority`/eager** (it's the LCP — do NOT make it lazy), and make **slides 1, 2, … `loading="lazy"`** (they're off-screen until the carousel advances, so lazy is invisible to the user and lightens the initial mobile load).
- Do **not** change the slider's behaviour, autoplay, animation, heading tags (h1 on slide 0 / h2 on the rest), or anything else — only the image `loading`/`priority` attribute per slide index.

## PART 2 — Accurate responsive `sizes` on images (smaller image on mobile)
**Scope:** `next/image` / `CldImage` usages across the public pages and components.
- The goal is that **mobile downloads an appropriately small image** instead of a desktop-sized one. `next/image` + Cloudinary already auto-generate multiple widths; we just need each image's **`sizes`** attribute to reflect how wide it actually displays at mobile/tablet/desktop.
- **For each image, set an accurate `sizes`** using `max-width` conditions that match its real rendered width, e.g.:
  - Full-bleed/hero images → `sizes="100vw"`.
  - Cards in a multi-column grid (projects, services, blog) → e.g. `sizes="(max-width: 600px) 90vw, (max-width: 1024px) 45vw, 360px"` (tune to the actual column width).
  - Small avatars/logos → a fixed small size, e.g. `sizes="48px"` / `sizes="300px"` for logos.
- **Rules:** do NOT change `width`/`height`/`fill` or any styling — only add/correct the `sizes` attribute so it matches the layout. Be accurate, not aggressive: if unsure, err slightly larger so images never look soft on high-DPI phones. The visible rendering must be identical.

## PART 3 — Drop legacy-JS polyfills (modern browser target) — OPTIONAL, conservative
**Goal:** stop shipping polyfills for ancient browsers (the ~12 KiB "Legacy JavaScript" — Array.prototype.at/flat/flatMap, Object.fromEntries/hasOwn, String.trimStart/End).
- Add/adjust a **browserslist** config (a `.browserslistrc` file or the `browserslist` key in `package.json`) to a **modern but safe** target so the build stops transpiling/polyfilling for very old browsers. Drop IE11 and dead browsers; keep reasonable modern support (recent 2-3 years of Chrome/Edge/Firefox/Safari + modern mobile).
- **Caveat / safety:** this only affects very old browsers (negligible audience). If this change would risk the build or break modern-browser support in any way, **skip Part 3 entirely** and note it — Parts 1 & 2 are the priority. Do not over-tighten the target.

---

## Acceptance criteria
- Hero: first slide loads instantly (eager/priority); slides 2+ lazy. Slider looks and behaves identically.
- Images: each has an accurate `sizes` so mobile pulls a smaller file; **every image renders visually identical** (same size/crop/quality) on mobile, tablet, desktop.
- (If done) Legacy-JS target modernised without breaking the build or modern browsers; else skipped + noted.
- Nothing else changed: no feature/function/UI/SEO/security regression. Make the changes directly.
