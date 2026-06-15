# PERFORMANCE-PLAN.md — Make the site faster (code-only, zero behaviour change)

**Project:** Web Digital Development (Next.js 14 App Router + MongoDB)
**Goal:** Reduce page load time and input/click lag **without changing how the site looks, behaves, or works in any way.** Faster only — identical otherwise.

This is for the implementation agent (Claude Code). Read the Ground Rules first; they override everything.

---

## 0. GROUND RULES (non-negotiable)

1. **Not a single feature may break.** Every page, button, form, animation, widget, admin panel, auth/2FA, chatbot, preview mode, and API must work exactly as before.
2. **Same to same — no visible change.** The site must look and feel identical: same layout, colors, fonts, spacing, animations, transitions, scroll feel. This is a performance pass, not a redesign. If a change alters anything visible or interactive, do not do it.
3. **No security impact.** Do NOT touch `next.config.mjs` security headers, CSP, HSTS, Permissions-Policy, auth logic, middleware, or anything under `/api/admin` auth. Do not weaken anything.
4. **No SEO / GEO / AEO / content impact.** Rendered HTML, metadata (titles, descriptions, canonical), JSON-LD schema, robots, sitemap, `llms.txt`, headings, and all visible text/content must stay byte-for-byte the same in the output. Caching must serve the *same* HTML, just faster. **Content freshness must not regress** — if you add caching/ISR, wire on-demand revalidation so admin edits still appear immediately (see Task 2 & 4).
5. **Do NOT touch images or video.** The owner will handle all image/video optimization separately. No changes to `next/image` usage, image files, the hero video, Cloudinary params, or media components.
6. **Do NOT touch any `.env*` file.**
7. **Surgical changes only.** Touch only what each task specifies. No refactors, renames, or reformatting.
8. **Verify after every task** (build, type-check, lint, feature smoke test, visual check). If anything regresses, revert that single change and log it in `PERF-BLOCKERS.md`.
9. **Prefer the safest wins first.** Do Tasks 1–3 (zero behaviour risk) before Task 4 (needs care).

---

## 1. What's making it slow (confirmed from code)

- Several pages are `export const dynamic = "force-dynamic"` → server-render + DB query on every request, no CDN cache (slow load).
- `getSettings()` runs in `src/app/(public)/layout.tsx` on **every** public page → a DB call per navigation.
- `SmoothScrollProvider` (Lenis) runs a continuous `requestAnimationFrame` loop → contributes to input/scroll lag.
- Many always-mounted client widgets in the public layout load their JS upfront (ChatWidget, ActivityTicker, StickyQuoteCTA, CookieBanner, ReadingProgressBar, BrandLoader, FloatingActions, MobileBottomBar) → heavy main-thread work on load → delayed interactions.
- `PageTransition` uses framer-motion `mode="wait"` → a brief wait on navigation.

(Images/video are also a factor but are **out of scope** here per Ground Rule 5.)

---

## TASK 1 — Cache `getSettings()` (safest, high impact)
- **Files:** `src/server/services/settings.service.ts` (and/or where `getSettings` is defined), used by `src/app/(public)/layout.tsx`.
- **Problem:** the shared public layout calls `getSettings()` on every page load → a DB round-trip on every navigation.
- **Change:** wrap the settings read in a cache so it isn't re-fetched on every request — e.g. React `cache()` for per-request dedupe **and** Next `unstable_cache` with a tag (e.g. `"settings"`) and a sensible `revalidate`. **To avoid any content-freshness regression:** call `revalidateTag("settings")` (or `revalidatePath`) inside the admin settings update API route (`src/app/api/admin/settings/route.ts`) so a settings change still shows immediately.
- **Must not change:** the returned data shape or any value. Output HTML identical.
- **Acceptance:** settings still update instantly after an admin save; fewer DB calls on navigation; no visual/behaviour change.

## TASK 2 — Cache other globally-shared, rarely-changing reads
- **Scope:** the same pattern as Task 1 for any other read used on most pages (e.g. header/footer/site-content/nav data). Only data that is identical across pages and changes rarely.
- **Change:** `unstable_cache` + tag + on-demand `revalidateTag` from the matching admin save route, so freshness is preserved.
- **Acceptance:** no content delay after admin edits; fewer repeat DB calls; identical output.

## TASK 3 — Defer non-critical client widgets (keep them, load later)
- **File:** `src/app/(public)/layout.tsx` and the widget components.
- **Problem:** non-critical widgets ship + run JS on initial load, hurting load time and first interaction.
- **Change:** load these via `next/dynamic` with `{ ssr: false }` and trigger them on idle or first user interaction/scroll, so they still appear and work but don't block the initial render/interaction:
  - `ChatWidget`, `ActivityTicker`, `StickyQuoteCTA`, `CookieBanner`, `FloatingActions`, `MobileBottomBar`, `ReadingProgressBar`.
- **Critical caveats (do not break behaviour):**
  - Each widget must still appear and function exactly as now (chat opens, cookie consent still works and still gates analytics, floating/mobile bars still show, etc.). A ~split-second later mount is acceptable; *missing* or *broken* is not.
  - `CookieBanner` gates analytics consent — it must still load early enough to capture consent before analytics fire. Defer it minimally (e.g. on idle), not behind a click.
  - Do **not** defer `SiteHeader`/`SiteFooter`/`PageTransition`/main content — those are above-the-fold/critical.
  - Keep `BrandLoader` behaviour as-is unless it can be deferred with zero visual change.
- **Acceptance:** every widget still works identically; initial JS/main-thread load is lighter; no layout shift introduced.

## TASK 4 — ISR for currently-dynamic pages (do carefully, only if freshness preserved)
- **Files:** the public pages still marked `force-dynamic` (e.g. home, about, contact, `blog/[slug]`, `legal/[slug]`, `services/[slug]`, `locations/[slug]` — confirm current state first; some list pages were already moved to ISR).
- **Problem:** `force-dynamic` = no caching = slow per-request render.
- **Change (only if BOTH conditions are met for a page):**
  1. **Preview still works:** pages that read `searchParams.preview/token` must keep showing unsaved admin drafts instantly. Keep them dynamic **when preview params are present**, and cache otherwise (e.g. branch the route, or use `revalidate` + ensure the preview path bypasses cache). If you cannot guarantee preview keeps working, **leave the page `force-dynamic`** and log it in `PERF-BLOCKERS.md`.
  2. **Content stays fresh:** wire on-demand revalidation (`revalidatePath`/`revalidateTag`) from the relevant admin save APIs so published edits appear immediately. If that can't be wired safely for a page, leave it dynamic.
- **Special case — `locations/[slug]`:** it fetches its own `.com` API with `cache: "no-store"` (see `PERF`/`BLOCKERS` notes). Do not force ISR on it unless it's refactored to read the DB directly; otherwise leave dynamic.
- **Must not change:** rendered HTML, metadata, schema, or content for any page.
- **Acceptance:** converted pages serve cached HTML (faster) AND still show fresh content after admin edits AND preview links still show drafts immediately. Anything uncertain → stay dynamic.

## TASK 5 — Lenis smooth-scroll: optimise WITHOUT changing the scroll feel
- **File:** `src/components/public/SmoothScrollProvider.tsx`
- **Constraint:** the smooth-scroll *feel* is part of the site's UX — **do not remove it or change its settings** (duration/easing/multipliers stay the same).
- **Allowed change (only if it changes nothing perceptible):** defer Lenis initialization until after first paint / idle (e.g. start the rAF loop on `requestIdleCallback`/after mount tick) so it doesn't compete with initial load. Keep the existing reduced-motion skip and mobile behaviour.
- **If unsure it's imperceptible, do nothing here** and log it. (Removing/altering Lenis would change feel = forbidden.)
- **Acceptance:** scroll feel identical; Lenis no longer part of the initial blocking work.

## TASK 6 — Verify Link prefetch is on (no code change unless broken)
- **Check:** internal navigation uses Next `<Link>` (default prefetch). Confirm prefetch isn't disabled anywhere (`prefetch={false}`). If it is and there's no reason, note it — don't change behaviour without confirming.
- **Acceptance:** report only.

---

## DO NOT DO (out of scope)
- ❌ Images / video / Cloudinary / `next/image` changes (owner handles).
- ❌ `next.config.mjs` security headers, CSP, auth, middleware.
- ❌ Removing or restyling any animation, transition, or the smooth-scroll feel.
- ❌ Changing metadata, schema, robots, sitemap, llms.txt, headings, or any visible content.
- ❌ `.env*` edits.
- ❌ Removing any widget/feature.

---

## VERIFICATION PROTOCOL (after each task)
1. `npm run build`, `npm run type-check`, `npm run lint` — all pass, no new errors.
2. Feature smoke test: home, a service detail, a blog post, projects, contact form submit, admin login + edit one item + see it reflect, **preview link still shows drafts**, chatbot opens, cookie banner + consent works, floating/mobile bars show.
3. Visual/behaviour check: identical look, identical animations, identical scroll feel.
4. Content-freshness check: edit something in admin → confirm it appears on the live page as before (no new delay).
5. If any regression → revert that single change, log in `PERF-BLOCKERS.md`.
6. (Optional) Compare before/after with Lighthouse to confirm improvement.

Deliverable: `PERF-BLOCKERS.md` listing anything left dynamic / not done and why.

### Suggested order
Task 1 → Task 2 → Task 3 → Task 6 → Task 5 → Task 4 (most caution last).
Stop and leave a page/feature as-is rather than risk breaking it.
