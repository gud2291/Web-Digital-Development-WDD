# IMAGE-OPTIMIZATION.md — Optimize images (no re-uploads, no breakage)

**Site:** webdigitaldevelopment.com (Next.js 14 + Cloudinary)
**Goal:** Fix the audit's image findings — "missing width/height, no lazy-loading, not all modern formats" — purely in code, so Performance/Mobile/CLS improve. No image files are re-uploaded; the existing optimized component (`CldImage` = next/image + Cloudinary `f_auto,q_auto`) is just applied consistently.

---

## 0. OPERATIONAL RULES
1. **Start directly. Do NOT ask permission.**
2. **Do NOT run `npm run build` / type-check / lint — the owner tests it himself.** Make the changes correctly in one pass.
3. **Do NOT narrate or explain.** A 2-3 line summary at the end only.

## 0b. GROUND RULES (nothing may break)
- **Do NOT break any feature, layout, or visual.** Images must render exactly as they look now — same size, position, aspect ratio, rounding, hover effects. This is an optimization pass, not a redesign.
- **HERO SLIDER: do NOT lazy-load it.** The hero is above-the-fold — it must load eagerly/`priority` (lazy-loading it would make it appear late = worse, not better). Same for the site logo and anything visible without scrolling. Only lazy-load images that are BELOW the fold.
- **Match the existing theme** (light/dark, responsive). No new fonts/colors/CSS beyond what's needed for correct sizing.
- **No** changes to: data/schema/SEO metadata, security, `next.config.mjs` (it already has `formats: avif/webp`), `.env`, or any non-image logic.
- Reflect real images only; don't swap or remove any image.

---

## 1. Current state
- `src/components/CldImage.tsx` — the project's optimized image component: wraps `next/image`, serves Cloudinary `f_auto,q_auto` (auto modern format + compression), blur-up, and expects width/height (or `fill`). **This is the component to use.**
- `src/components/public/SafeImage.tsx` — another image wrapper.
- `next.config.mjs` already sets `images.formats = ["image/avif","image/webp"]` and Cloudinary `remotePatterns` — leave it as-is.
- The audit found ~30 images missing width/height and ~28 not lazy-loaded → these are the spots still using raw `<img>` or images without dimensions.

## 2. What to do
1. **Find every raw `<img>` tag** in the public site (and any `next/image`/CldImage/SafeImage usage missing dimensions). Convert raw `<img>` to **CldImage** (for Cloudinary images) or **next/image** (for local/static images) so they get modern formats + lazy-load + srcset automatically.
2. **Add `width` and `height`** (or `fill` with a properly-sized relative container) to **every** image, matching its current rendered size — this fixes "missing dimensions" and eliminates layout shift (CLS).
3. **Lazy-loading:**
   - Below-the-fold images → lazy (next/image default — no extra prop needed).
   - **Above-the-fold images → `priority` / eager**, specifically the **hero slider images, the header logo**, and anything visible before scrolling. **Do NOT lazy-load these.**
4. **Cloudinary images** already get `f_auto,q_auto` via CldImage — just make sure all Cloudinary images go through CldImage (not raw `<img>`), and pass a sensible `sizes` so the right resolution is served per device.
5. **CSS `background-image` cases** (e.g. team photos, any decorative backgrounds): these can't use next/image. Leave their layout untouched, but ensure the Cloudinary URL includes `f_auto,q_auto` and an appropriate width transform so the file is optimized. Do not convert them in a way that changes the visual.
6. Static images in `/public` referenced by raw `<img>` → switch to `next/image` with width/height where it doesn't change the look.

## 3. Acceptance criteria
- Every visible image has explicit `width`/`height` (or `fill` + sized container) → no layout shift.
- Below-the-fold images lazy-load; **the hero slider, logo, and above-the-fold images load eagerly (priority) — NOT lazy**.
- All Cloudinary images render through CldImage (modern format + compression); raw `<img>` removed from the public pages where practical.
- The site looks **pixel-identical** to before (same sizes, positions, aspect ratios, hover/animation), in light and dark mode, on desktop and mobile.
- Nothing else changed; no feature/SEO/security/theme regression.
