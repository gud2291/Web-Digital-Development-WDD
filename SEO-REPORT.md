# SEO Report — webdigitaldevelopment.com

Date: 4 Nov 2026 · Branch: `seo/audit-fixes` · Builds on: `WDD-SEO-Audit-Report.html` (25 Aug 2026)

## Read this first

- **The live site was NOT checked.** This session's network policy blocks
  `webdigitaldevelopment.com`, `www.webdigitaldevelopment.com` and
  `webdigitaldevelopment.in` (the proxy refuses the connection). The PageSpeed
  API answered, but its free daily quota was used up, so no Core Web Vitals
  either. The Vercel connector on your account does not list this site's
  project, so I could not read the domain and redirect setup.
- Everything below comes from **reading the code** and from **a production
  build run locally with no database**. Pages then show their built-in
  fallback text, not your real database content.
- `/seo-audit` (the claude-seo skill) **was not run**. It needs to fetch the
  live site, and it can't reach it from here. I ran the same kinds of checks by
  hand against the local build instead.
- **The code was not the main problem in August, and it still isn't.** The
  fixes below are real but small. Your rankings depend on the things listed
  under "What you must do yourself". Nothing in this branch changes that.

## Score

My own code-only scoring (not the skill's live Health Score, which I could not run):

| Area | Max | Before | After |
|---|---|---|---|
| Crawling and indexing (robots, sitemap, canonicals, status codes) | 25 | 21 | 24 |
| Metadata (title, description, Open Graph) | 20 | 17 | 19 |
| Structured data (schema) | 15 | 13 | 14 |
| Headings and image alt text | 15 | 12 | 14 |
| Performance signals in code | 15 | 11 | 12 |
| Redirects and migration in code | 10 | 7 | 7 |
| **Total** | **100** | **81** | **90** |

- This score covers code only. It leaves out authority (Authority Score 6
  vs 33), the live `.in` duplicate site, and Google Business Profile. Those
  are what hold back your rankings.
- The live-site score is **not checked**.

## What I fixed (8 code commits)

1. **Location pages could return 404 when the database had a hiccup.** Each
   location page fetched your own public URL over the internet on every
   request. Any failure was turned into "page not found". Google treats a 404
   as "page is gone".
   - Now the page reads the database directly (two fewer network calls per
     visit).
   - The page is now cached for 1 hour (ISR), like your service and blog
     pages. If a refresh fails, Next.js keeps serving the last good copy.
   - A database error no longer marks the page `noindex`.
   - Side effect: changes to location pages (made by the seed and keyword
     scripts) show up within 1 hour, not instantly.
   - Not fully tested: I had no database, so I could not test the "serve the
     last good copy" path. That behaviour comes from the Next.js docs.
2. **Schema: removed a broken search action.** The `WebSite` schema said
   `/blog?search=term` runs a search. It doesn't, because `/blog` ignores that
   parameter. Google dropped the sitelinks search box in Nov 2024 anyway.
3. **Open Graph for blog posts.** Posts said `og:type=website`. They now send
   `article`, plus published time, modified time and author.
4. **Open Graph image and locale.** The default share image now states its
   size (1200×630) and alt text. `og:locale=en_IN` was being dropped on every
   page except the root. It is back.
5. **Sitemap.** Added `/legal`. It was a live, indexable page that was missing
   from the sitemap.
6. **404 page.** It said `index, follow` and set its canonical to the homepage.
   It now says `noindex, follow` and has no canonical.
7. **Heading order: cards.** Project, blog and process-step card titles used
   `h4` straight after `h2`. Changed to `h3`.
8. **Heading order: footer.** Footer column titles were `h5` on every page.
   Changed to `h2`. Before and after screenshots match.
Also installed claude-seo v2.5.0 into `.claude/` (not committed; see
"Other notes").

Checks run: `npm run type-check` passed, `npm run lint` passed (0 warnings),
`next build` passed.

### What the local build showed (fallback content, no database)

- Every checked page has exactly one H1 and a correct self-canonical: `/`,
  `/about`, `/services`, `/projects`, `/blog`, `/contact`, `/reviews`,
  `/legal`, `/legal/privacy-policy`, `/sitemap`.
- All JSON-LD blocks parse as valid JSON. Every rendered `<img>` has an alt
  attribute.
- Mobile at 390px wide has no sideways scrolling on the homepage.
- `/about/` redirects with a 308 (permanent) to `/about`. Legacy `.php` URLs
  also 308 to their new pages. Google treats 308 like 301, so this is fine.
- `robots.txt` and `sitemap.xml` are correct.
- Title and description lengths in `scripts/apply-seo-meta.ts` are all fine
  (titles 42–60 characters with the brand, descriptions 136–153). I can't
  confirm the database actually holds these values.

## Proposals waiting for your approval (I did not change these)

Copy, titles, descriptions and keywords. Each one needs your yes or no.

1. **Homepage H1** has no keyword. The August report saw "Get Your Business
   Online in Just 3–5 Days" (from hero slide 1 in the database). Proposal:
   make H1 "Website Design & Development Company in Delhi" and keep the
   current line as the sub-heading.
2. **Service page H1s** show only the service name ("Website Designing").
   Proposal: service + "in Delhi", matching each page title.
3. **Fallback descriptions in code** are only used if the database is empty,
   but two are off:
   - `/about` fallback is 174 characters (too long).
   - Legal pages fallback is 41 characters (too short).
4. **Phone format.** Config and schema use `+91 81302 70050`. The August
   report says some places show it without spaces. Pick one format and use it
   everywhere (site, schema, GBP, directories).
5. **`.in` email on the live site.** The August report saw
   `support@webdigitaldevelopment.in`. It is not in the code, so it is
   database content. Change it in Admin → Site content. Not checked live.
6. **`llms.txt`** lists 5 of your 8 services and no location pages. Add
   Graphic Design, WordPress, Mobile-First and the 5 location pages.
7. **Pages the August report recommended** (still not built): `/pricing`,
   sub-locality pages (Rohini, South Delhi, Dwarka, Janakpuri…), and
   `/services/website-redesign`.
8. **Blog fallback content.** If the database fails, `/blog` shows 6 made-up
   posts linking to pages that don't exist, plus made-up category counts
   (42, 28…). Better to show an empty state.
9. **Bot blocking in `src/middleware.ts`.** Any visitor whose user-agent
   contains `curl`, `wget`, `python-requests` and similar gets a 403 on every
   page, including `/llms.txt`. Googlebot is not affected. But it blocks SEO
   audit tools and some AI fetchers, and anyone can bypass it by changing the
   user-agent. My view: it costs more than it protects. Your call, since it
   is a security choice.
10. **Review stars.** Your `/reviews` schema adds ratings to your own
    business. The schema is valid, but Google does not show stars for
    "self-serving" reviews of your own business, so don't expect stars in
    search results.
11. **Remaining heading skips** (minor):
    - Legal pages go `h1` → `h3` (inside the policy text).
    - `/blog` sidebar goes `h1` → `h3`.
    - The newsletter box uses `h5`.

## What you must do yourself

These matter far more than anything in this branch. Steps are in the August
report. Here is the short version.

1. **301 redirect from `.in`.** Replace the 302 with a path-preserving 301 on
   the `.in` hosting (the `.htaccess` is in the August report). Delete the old
   PHP files and the old `sitemap.xml`. Keep renewing the `.in` domain for at
   least 12 months.
   - I could not check whether this is done yet.
2. **Search Console Change of Address.** Do this only after the 301 is live:
   `.in` property → Settings → Change of Address → `.com`. Then submit
   `https://webdigitaldevelopment.com/sitemap.xml` in the `.com` property.
3. **Google Business Profile.** Claim and verify it. Set categories
   (Website designer, plus secondary ones). Add all 8 services, 20+ real
   photos and weekly posts. Ask past clients for reviews (target 40 in 90
   days). This is how you win the "near me" searches.
4. **Backlinks.** Authority Score 6 vs 33 is the biggest gap. Get a "Designed
   by Web Digital Development" footer link on client sites. Aim for 8–12 new
   referring domains a month.
5. **Directory listings.** JustDial, Sulekha, IndiaMART, Clutch, GoodFirms,
   DesignRush, TradeIndia. Use exactly the same name, address and phone
   everywhere.
6. **www vs non-www, and http vs https.** These are set at your host, not in
   code. Check that `www.` and `http://` both 301 to
   `https://webdigitaldevelopment.com/`. I did **not** add a redirect in code:
   if your host is set the other way round, a code redirect would cause an
   endless redirect loop and take the site down.
7. **Core Web Vitals.** Run pagespeed.web.dev (mobile) on `/`, `/services` and
   `/locations/delhi`. Then watch Search Console → Core Web Vitals.

## What I could not check

| Item | Status |
|---|---|
| Live site loads (apex and www) | Not checked (network blocked) |
| www → non-www, http → https redirects | Not checked (hosting-level, no access) |
| Trailing slashes on live site | Not checked live. Code redirects `/x/` → `/x` (308) |
| Old `.in` domain still live or indexable, 302 vs 301 | Not checked (network blocked) |
| Sitemap URLs returning 200 on live | Not checked. Locally the static URLs return 200; database URLs need the database |
| Real titles and descriptions from the database | Not checked (no database access). Script values look fine |
| Real H1s from the database (hero slides, service titles) | Not checked |
| Blog post page render (article OG tags) | Type-checked only; no database means no posts to render |
| Core Web Vitals / Lighthouse | Not checked (PageSpeed API quota used up, site unreachable) |
| Broken links on live site | Not checked. The Aug report says the 53 "broken" links are WhatsApp 429s, not real breaks |
| Schema in Google's Rich Results Test | Not checked. Locally all JSON-LD parses; the types and fields follow Google's docs |
| `/seo-audit` skill run | Not run (needs the live site) |

To let me check the live site next time, allow these hosts in the
environment's network settings: `webdigitaldevelopment.com`,
`www.webdigitaldevelopment.com` and `webdigitaldevelopment.in`.

## Other notes

- **The claude-seo skill is installed but not committed.** Your `.gitignore`
  ignores `.claude`, and I didn't override that. The files are in `.claude/`
  in this container only and will be lost when it closes.
  - To keep them: `git add -f .claude/skills .claude/agents`, or remove
    `.claude` from `.gitignore`.
  - I installed tag v2.5.0 (not `main`) and skimmed its scripts. They run
    local Python and call Google APIs. I found nothing that sends your data
    anywhere else.
- **`package-lock.json` is out of sync** with `package.json`: `npm ci` fails
  (missing `@emnapi/runtime`, `@emnapi/core`). I used `npm install` locally
  and did not commit the lockfile change. If your host runs `npm ci`, run
  `npm install` and commit the updated lockfile.
- **If the database is down when Google fetches `sitemap.xml`**, the sitemap
  shrinks to the 12 static URLs. That won't de-index anything, but it is worth
  knowing if Search Console ever shows the sitemap count dropping.
