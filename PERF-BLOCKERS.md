# PERF-BLOCKERS.md — what was left as-is (and why)

Companion to `PERFORMANCE-PLAN.md`. Records anything deliberately **not** changed
or reverted during the performance pass, with the reason. Following Ground Rule 8
("if anything regresses, revert and log it") and the per-task "if unsure, leave it
and log it" instructions. Nothing here represents a broken feature — these are
optimizations that were *declined* because they couldn't be proven safe under the
"same to same, zero behaviour change" constraint.

---

## Task 5 — Lenis smooth-scroll: **left unchanged** (idle-deferral declined)

**File:** `src/components/public/SmoothScrollProvider.tsx` — not modified.

**What was allowed:** defer Lenis init to `requestIdleCallback`/idle *only if
imperceptible*; do not touch duration/easing/multipliers; if unsure, do nothing.

**Why it was declined (concrete, not a guess):**
- `src/app/globals.css:7` sets a global `html { scroll-behavior: smooth; }`.
- Lenis only overrides that to `scroll-behavior: auto !important` **after** it adds
  the `.lenis .lenis-smooth` classes (`globals.css:26`).
- So before Lenis initialises, the page scrolls via **native CSS smooth-scroll**;
  after init it switches to the **Lenis engine** (with native smooth disabled).
- Deferring init to idle lengthens the window in which native CSS smooth-scroll is
  the active engine. Any scroll or anchor-jump performed in that window would feel
  different and then visibly switch engines mid-session — a perceptible change in
  scroll feel, which Ground Rule 2 forbids.
- The marginal upside is small: Lenis already initialises in a `useEffect` (after
  first paint, never during SSR/initial HTML), and the continuous `requestAnimationFrame`
  loop — the actual ongoing cost — is intrinsic to Lenis and cannot be paused/altered
  without changing the feel. Idle-deferral would only delay the *start*, not reduce
  the steady-state cost.

**Decision:** leave `SmoothScrollProvider` exactly as-is. The plan explicitly says
"If unsure it's imperceptible, do nothing here and log it."

---

## Task 4 — ISR for force-dynamic pages: **all left `force-dynamic`** (none converted)

The remaining `force-dynamic` public pages are:
`/` (home), `/about`, `/contact`, `/blog/[slug]`, `/legal/[slug]`,
`/services/[slug]`, `/locations/[slug]`.

### `/`, `/about`, `/contact`, `/blog/[slug]`, `/legal/[slug]`, `/services/[slug]`
**Blocker: searchParams-based preview forces dynamic rendering.**
- Each page reads `searchParams.preview` + `searchParams.token` and calls
  `getPreviewDoc(...)` (`src/server/preview/getPreviewDoc.ts`) so a valid preview
  link renders the unsaved admin draft (`§15.6`).
- In the Next.js 14 App Router, **accessing `searchParams` is a Dynamic API**: it
  opts the route into per-request dynamic rendering. `export const revalidate = N`
  cannot produce a cached/ISR page while `searchParams` is read — the framework
  still renders dynamically.
- To get real ISR we'd have to move preview off `searchParams` (e.g. to Next
  `draftMode()` cookies, or split each page into a static shell + a separate
  dynamic preview route). That is a non-surgical refactor of the **preview system
  itself** — the exact feature Task 4 must protect — and would require changing how
  the admin generates preview links. High risk, out of scope (Ground Rule 7).
- Per the plan: "If you cannot guarantee preview keeps working, leave the page
  `force-dynamic` and log it." → left dynamic.

> Note on freshness: content-freshness is **not** the blocker here (Tasks 1 & 2
> already wire `revalidateTag("settings")` / `revalidateTag("site-content")` from
> the admin save routes, and shared reads use `unstable_cache` with matching tags).
> The sole blocker is the searchParams-preview requirement.

### `/locations/[slug]`
**Blocker (per plan special-case): self-fetches its own API with `cache: "no-store"`.**
- The page fetches `${siteConfig.url}/api/public/locations/${slug}` with
  `cache: "no-store"` (`src/app/(public)/locations/[slug]/page.tsx:17,38`).
- The plan explicitly says: do not force ISR on it unless it's refactored to read
  the DB directly. That refactor is out of scope. → left dynamic (as instructed).

**Decision:** no page converted. All stay `force-dynamic`. ("Anything uncertain →
stay dynamic.")

---

## Tasks completed with no blockers (for the record)

- **Task 1 / Task 2 — done previously.** `getCachedSettings` + `getCachedSiteContent`
  use React `cache()` + `unstable_cache` with `"settings"` / `"site-content"` tags;
  admin save routes call the matching `revalidateTag(...)`. Freshness preserved.
- **Task 3 — done this pass.** The 7 non-critical fixed-overlay widgets
  (ChatWidget, ActivityTicker, StickyQuoteCTA, CookieBanner, FloatingActions,
  MobileBottomBar, ReadingProgressBar) now load via `next/dynamic({ ssr: false })`
  through `src/components/public/DeferredPublicWidgets.tsx`, mounted on idle OR first
  interaction. All are `position: fixed` (no layout shift); CookieBanner still mounts
  on idle (never behind a click) so it gates analytics as before. Footer still
  server-renders phone/email, so no indexable content left the SSR HTML. Header,
  footer, PageTransition, BrandLoader, ToastProvider and main content unchanged.
- **Task 6 — verified, no change.** No `prefetch={false}` anywhere in `src`; 41
  files use `next/link`; default `<Link>` prefetch is fully active.

---

## DRAFTMODE-ISR-PLAN — Task 4 blocker RESOLVED (branch `perf/draftmode-isr`)

The Task 4 "searchParams-preview forces dynamic" blocker above has now been
**resolved on its own branch** by migrating draft preview from `?preview=&token=`
to Next.js **`draftMode()`** (cookie-based). The 6 pages are now static/ISR
(build verified `○`/`●`, not `ƒ`):

| Page | Before | After |
|------|--------|-------|
| `/` (home) | `ƒ` | `○` Static/ISR |
| `/about` | `ƒ` | `○` Static/ISR |
| `/contact` | `ƒ` | `○` Static/ISR |
| `/services/[slug]` | `ƒ` | `●` SSG (generateStaticParams) |
| `/blog/[slug]` | `ƒ` | `●` SSG (generateStaticParams) |
| `/legal/[slug]` | `ƒ` | `●` SSG (3 fixed slugs) |

Preview still works (editor-only, via the `/api/preview/enable` route +
httpOnly cookie + `draftMode()`); normal visitors get the cached published HTML.
Freshness is preserved by on-demand `revalidatePath` wired into every admin save
route that feeds these pages (homepage, site-content, settings, services, blog,
legal, projects, testimonials, team) — see `src/server/utils/revalidatePublic.ts`.

### Still left dynamic: `/locations/[slug]` (Step F — logged)
- It has **no preview** (not part of the draftMode migration) and is `ƒ` because
  `generateMetadata` + the page both `fetch(".../api/public/locations/[slug]", { cache: "no-store" })`.
- Converting it cleanly needs a separate refactor: read the `locationpages`
  collection directly in the page (like the API route does) **and** add
  `generateStaticParams` for the location slugs. That's an independent change with
  its own risk, on a page that isn't part of the preview system.
- Per DRAFTMODE-ISR-PLAN Step F ("refactor to DB-direct OR leave dynamic + log;
  don't half-convert"), it is **left `force-dynamic`** for a future follow-up.
