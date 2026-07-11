# BLOG-DETAIL-IMAGE-FIX.md — Fix blog ARTICLE (detail) featured image on mobile

**Site:** webdigitaldevelopment.com (Next.js 14 + Cloudinary/CldImage)
**Problem:** On the blog LISTING page (/blog) images look fine, but inside a single ARTICLE (e.g. `/blog/how-to-get-website-to-show-up-on-google-search-results`) the big featured/hero image looks broken/over-cropped on MOBILE — it's zoomed in and cut off.

**Root cause:** In `src/app/(public)/blog/[slug]/page.tsx` (around line 165) the hero image wrapper uses a **fixed `height: 420`** with `object-fit: cover`. On desktop (1040px wide) that ratio is fine, but on a ~360px-wide phone the box stays 420px tall → a tall/portrait frame → `cover` crops a wide image heavily → looks cut off. The fix is to make the wrapper height **responsive via `aspect-ratio`** instead of a fixed pixel height.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** One short summary at the very end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.**

## 0b. GROUND RULES (nothing may break)
- **Additive/surgical.** Only fix the blog detail hero image sizing. Do NOT change the listing page, the article body, other pages, features, or `.env`.
- **Keep the desktop look identical** (hero stays ~420px tall on desktop). Only mobile/tablet get a correct, non-cropped ratio.
- Same theme (light + dark), keep CldImage `priority`, `fill`, and the existing `sizes`. Keep border-radius.

---

## 1. Add a responsive CSS class (globals.css)
In `src/app/globals.css`, near the other `.blog-detail__*` / blog rules, add:

```css
/* Blog article hero image — responsive height so it doesn't over-crop on mobile.
   Mobile-first uses aspect-ratio (scales with width); desktop keeps the fixed 420px look. */
.blog-hero-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
}
@media (min-width: 768px) {
  .blog-hero-media { aspect-ratio: auto; height: 420px; }
}
@media (max-width: 480px) {
  .blog-hero-media { border-radius: 12px; }
}
```

(If a `.blog-hero-media` class already exists, adjust it to match the above instead of duplicating.)

## 2. Use the class in the detail page (remove the fixed height)
In `src/app/(public)/blog/[slug]/page.tsx`, replace the featured-image wrapper (the `<div>` with inline `height: 420`) so it uses the new class and no longer hardcodes the height. Change:

```jsx
{post.featuredImage ? (
  <div style={{ position: "relative", width: "100%", height: 420, borderRadius: 16, overflow: "hidden" }}>
    <CldImage
      src={post.featuredImage}
      alt={post.featuredImageAlt || post.title}
      fill
      priority
      sizes="(max-width: 1040px) 100vw, 1040px"
      style={{ objectFit: "cover" }}
    />
  </div>
) : (
  <PH h={420} label="article featured image" variant="solid" style={{ borderRadius: 16 }} />
)}
```

to:

```jsx
{post.featuredImage ? (
  <div className="blog-hero-media">
    <CldImage
      src={post.featuredImage}
      alt={post.featuredImageAlt || post.title}
      fill
      priority
      sizes="(max-width: 1040px) 100vw, 1040px"
      style={{ objectFit: "cover" }}
    />
  </div>
) : (
  <PH h={420} label="article featured image" variant="solid" style={{ borderRadius: 16 }} />
)}
```

(Keep the `PH` fallback as-is; only the image branch changes.)

## Acceptance criteria
- On mobile, the article hero image is no longer over-cropped/cut off — it shows a clean 16:9 frame that scales with screen width.
- On desktop the hero looks exactly as before (~420px tall, rounded).
- Listing page, article body, and everything else unchanged. Nothing breaks; same theme, light + dark.

Make the changes directly now.
