# DRAFTMODE-ISR-PLAN.md — Make the dynamic pages cacheable (the big loading win)

**Goal:** Convert the public pages that are currently `force-dynamic` to **static/ISR**
so normal visitors get fast, CDN-cached pages — while keeping the admin **draft
preview** feature working exactly as today. This is done by migrating preview from
URL params (`?preview=&token=`) to Next.js's official **`draftMode()`** (cookie-based),
which is the supported way to have cached public pages + on-demand drafts.

> Why this wasn't done in the earlier perf pass: the earlier plan deliberately
> forbade touching the preview system to guarantee zero risk. This task does that
> refactor on purpose, carefully and on its own branch.

---

## 0. GROUND RULES
1. **Do this on a NEW git branch** (e.g. `perf/draftmode-isr`) so it's trivially revertible.
2. **The live public site must stay byte-identical in output** — same HTML, content, metadata, JSON-LD schema, headings, robots, sitemap. Only the *rendering mode* (cached vs per-request) changes. No SEO/GEO/AEO/content impact.
3. **Draft preview must keep working** — an editor opening a preview link must still see the unsaved draft; normal visitors must never see drafts.
4. **Content freshness must not regress** — publishing/saving in admin must still make the change appear immediately on the live page (wire on-demand `revalidatePath`/`revalidateTag`).
5. **No security impact** — keep the existing preview-token verification (`verifyPreviewToken`) and its checks intact. Don't touch `next.config.mjs` headers/CSP, auth, or middleware beyond what preview requires. The draft cookie must be httpOnly + secure.
6. **Do NOT touch** `.env*`, images/video/Cloudinary, or any unrelated feature.
7. **Verify with the build output**: after the change, `next build` must show each converted page as `○ (Static)` / `●/ISR`, **not** `ƒ (Dynamic)`. If a page still shows `ƒ`, the refactor didn't take — fix or leave that page dynamic and log it.
8. If preview can't be made to work cleanly for a page, **leave that page `force-dynamic`** and log it in `PERF-BLOCKERS.md`. Never ship broken preview.

---

## 1. Current mechanism (read first)
- `src/server/preview/getPreviewDoc.ts` — reads `searchParams.preview` (draftId) + `searchParams.token`, verifies via `verifyPreviewToken`, returns the draft from `src/server/preview/draft-store`. Reading `searchParams` is what forces these pages dynamic.
- Pages using it: `src/app/(public)/page.tsx`, `about/page.tsx`, `contact/page.tsx`, `services/[slug]/page.tsx`, `blog/[slug]/page.tsx`, `legal/[slug]/page.tsx`.
- `src/components/admin/LivePreview.tsx` — builds the `?preview=&token=` URL.
- `src/app/api/admin/preview/[resource]/route.ts` — issues the preview token / stores the draft.

## 2. Target mechanism (draftMode)
- Editor clicks "preview" → hits a route handler that **validates the token**, calls
  `draftMode().enable()`, stores the draft identity (the signed token) in an httpOnly
  cookie, and redirects to the target page.
- Pages call `draftMode()` instead of reading `searchParams`. When draft mode is OFF
  (normal visitors, and at build/ISR time) the page renders the published, cached
  version. When ON (editor) it renders the draft. `draftMode()` does not force dynamic
  when disabled, so the page is statically generated / ISR for everyone else.

---

## 3. Implementation steps

### Step A — Preview enable/disable route handlers
- Add `src/app/api/preview/enable/route.ts`:
  - Accept the existing preview token (+ resource/draftId) as query/body, **validate
    with `verifyPreviewToken`** (reuse the exact existing checks — do not weaken).
  - On success: `draftMode().enable()`, set an **httpOnly, secure, sameSite** cookie
    holding the validated token (so the page can re-verify it server-side), then
    `redirect()` to the target public path (no `?preview=` needed anymore).
  - On failure: return 401, do not enable.
- Add `src/app/api/preview/disable/route.ts`: `draftMode().disable()` + clear the cookie + redirect (gives editors a way to exit preview).

### Step B — Refactor `getPreviewDoc`
- Change signature to stop taking `searchParams`. Instead:
  - `const { isEnabled } = draftMode(); if (!isEnabled) return null;`
  - Read the preview token from the httpOnly cookie, `verifyPreviewToken` it, confirm
    `claims.resource === resource`, then return `getDraft(...)` exactly as today.
- Keep all existing token/claims validation identical (security parity).

### Step C — Convert the 6 pages
For each of `page.tsx` (home), `about`, `contact`, `services/[slug]`, `blog/[slug]`, `legal/[slug]`:
- Remove `export const dynamic = "force-dynamic"`.
- Add `export const revalidate = 3600;` (or a per-page sensible window).
- Stop reading `searchParams` for preview; call the new `getPreviewDoc(resource)` (no args from URL). If a page uses `searchParams` for nothing else, remove that prop so nothing forces dynamic.
- For `services/[slug]` and `blog/[slug]`, add/confirm `generateStaticParams` so published slugs are pre-rendered (optional but ideal).
- Leave the rendered output otherwise identical.

### Step D — Update admin preview link builder
- `src/components/admin/LivePreview.tsx` (and `api/admin/preview/[resource]` if it builds URLs): point the "preview" action at `/api/preview/enable?...` instead of appending `?preview=&token=` to the public URL. Keep the token issuance/validation logic the same.

### Step E — On-demand revalidation (freshness)
- In the admin save/publish API routes for the affected resources (homepage, site-content, services, blog, legal, settings), call `revalidatePath(...)` / `revalidateTag(...)` for the matching public path/tag after a successful save, so published edits appear immediately on the cached pages. (Tasks 1/2 already established this pattern — extend it.)

### Step F — locations/[slug] (separate)
- It self-fetches its own `.com` API with `cache:"no-store"`. Either (optional) refactor it to read the DB directly so it can be ISR, **or** leave it `force-dynamic` and log it. Don't half-convert it.

---

## 4. VERIFICATION (must pass before handing back)
1. `npm run build` — converted pages show `○`/`●`/ISR in the route table, **not `ƒ`**. Paste the route table in the report.
2. `npm run type-check`, `npm run lint` — clean.
3. **Preview test (the critical one):**
   - From admin, open a preview for a service/blog/home draft → the unsaved draft renders.
   - Open the same public URL in a normal/incognito window (no draft cookie) → the **published** version renders (not the draft).
   - Exit preview (disable route) → normal view returns.
4. **Freshness test:** edit + publish something in admin → it appears on the live cached page immediately (via revalidate).
5. **Output parity:** the published HTML/metadata/schema for each converted page is identical to before (diff the rendered head + JSON-LD).
6. Full feature smoke test (forms, chat, admin, etc.) — nothing else affected.
7. Anything that can't be proven safe → revert that page to `force-dynamic`, log in `PERF-BLOCKERS.md`.

## 5. Rollback
Everything is on the `perf/draftmode-isr` branch. If preview misbehaves, revert the branch — the live `main` is unaffected.

---

## Risk summary (honest)
- **Live public site:** low risk — output identical, just cached → faster. Biggest loading win available.
- **Preview feature (admin-only):** this is what's being refactored, so it carries the real risk. It's the official Next.js pattern and fully testable; the test checklist above must pass. If it doesn't, leave the page dynamic — no harm done to the live site.
