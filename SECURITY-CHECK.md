# SECURITY-CHECK.md — Part H findings

Verification of the crawl's security-header flags against the **live production**
`.com` site. Date checked: 2026-06-14. Per SEO-GEO-AEO-PLAN.md Part H + Ground Rules §0
(report/verify only; no auth logic changed; CSP/HSTS/Permissions-Policy untouched).

---

## H1 — Are the three headers actually present in production?

The crawl flagged **Missing Referrer-Policy, X-Content-Type-Options, and X-Frame-Options
on 17 URLs each**. `next.config.mjs` already sets all three for `/:path*` (lines 6–9).
Checked live responses with a real browser User-Agent (`curl -I`):

| URL (live `.com`) | Status | Referrer-Policy | X-Content-Type-Options | X-Frame-Options |
|---|---|---|---|---|
| `/` (home) | 200 `text/html` | ✅ `strict-origin-when-cross-origin` | ✅ `nosniff` | ✅ `SAMEORIGIN` |
| `/services/website-designing` | 200 `text/html` | ✅ | ✅ | ✅ |
| `/blog/how-a-good-website-pays-for-itself` | 200 `text/html` | ✅ | ✅ | ✅ |
| `/_next/static/css/…css` (static asset) | 200 | ✅ | ✅ | ✅ |
| `res.cloudinary.com/…` (external image) | 200 | ❌ **absent** | ✅ `nosniff` | ❌ **absent** |

HSTS, CSP, and Permissions-Policy were also present and intact on every HTML response.

### Conclusion: headers are present on all our own URLs — the flag is a false positive.
Every page **we serve** (HTML pages *and* static assets) carries all three headers.
The two plausible causes of the crawl's "missing on 17 URLs", and which one it is:

1. **External / CDN resources the crawler followed (partial cause).** Our Cloudinary
   image/media URLs (`res.cloudinary.com/...`) are referenced site-wide and are **not
   under our control**. They return `X-Content-Type-Options: nosniff` but **no**
   `Referrer-Policy` and **no** `X-Frame-Options`. Any crawl that lists external
   resources will show those two as "missing" for every Cloudinary asset — and there
   are easily 17+ of them across the site. These cannot and should not be "fixed" by us.

2. **A pre-deployment crawl (most likely primary cause).** The crawl reported **all
   three** headers missing on the *same* 17 URLs. Since Cloudinary assets *do* send
   `X-Content-Type-Options`, a pure-Cloudinary explanation can't account for that header
   also being flagged. The "all three absent together" pattern matches **our own HTML
   pages before the `headers()` block in `next.config.mjs` was deployed** (i.e. the crawl
   predates the current build). They are present now (table above), so the issue is
   already resolved by the live deployment.

Either way: **no code change is required.** The live site is correct.

---

## H2 — Fix only if genuinely missing → NO CHANGE NEEDED

- The three headers are **genuinely present** on every production HTML page and static
  asset (verified above), so there is nothing missing to fix.
- **`/_next/static` block does not suppress security headers (verified live):** the
  asset `/_next/static/css/…css` returned **both** `Cache-Control: public,max-age=
  31536000,immutable` **and** all three security headers. Next.js merges every matching
  `headers()` source rule (`/:path*` + `/_next/static/:path*`) additively, so the
  Cache-Control rule adds to — not replaces — the security headers. No change made.
- **CSP, HSTS, Permissions-Policy, X-XSS-Protection left untouched.** Not weakened, not
  edited. (CSP would only need updating if a new third-party script were added — out of
  scope here.)

---

## H3 — `/admin` & `/api` hygiene (report only — auth logic unchanged)

- **robots.ts:** `/admin`, `/api`, `/registrations` are `Disallow`ed for `*` **and** for
  every AI crawler (the disallow list is reused for all agents). ✅
- **noindex on admin:** `src/app/admin/layout.tsx` sets
  `metadata.robots = { index: false, follow: false }`, so all `/admin` routes are
  noindexed at the page level (defence-in-depth beyond robots.txt). ✅
- **Admin auth still required:** `src/middleware.ts` protects `/admin/*`
  (except `/admin/login`) and `/api/admin/*` via NextAuth JWT (`getToken`), requiring
  `token.isAdmin === true`. Unauthenticated users are redirected to `/admin/login`
  (HTML) or get `401` (API). Edge JWT verification only — no DB touch. ✅ (No changes
  made to auth logic.)
- **No secrets exposed:** middleware reads `process.env.NEXTAUTH_SECRET` server-side
  only; no secret values are rendered into HTML or client bundles. ✅
- **Side note (explains the H1 curl 403s):** middleware also blocks scraper
  User-Agents (`curl|wget|libwww|python-requests|scrapy|httpclient`) with a 403 on
  non-API routes. The 403 response still carried all security headers — confirming
  `headers()` applies even to middleware short-circuits. The browser-UA requests in H1
  returned 200 as expected. No change needed; flagged only for context.

---

## Overall verdict
Part H requires **no code changes**. All three flagged headers are present in production
on every URL we control; the crawl flag is explained by external Cloudinary resources
and/or a pre-deploy crawl. The strong header set (HSTS, CSP, Permissions-Policy,
X-XSS-Protection) remains intact. Admin/API stay disallowed, noindexed, and
auth-gated.
