# KEYWORDS-PLACEMENT.md — Place all 25 target keywords across the site (naturally)

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB)
**Goal:** Weave all 25 Google-Ads keywords into the right pages — in **titles, headings, body, FAQ, image alt, and internal-link anchors** — so each keyword appears **naturally** on a relevant page. **No keyword may be missed, and there must be NO keyword stuffing** (over-stuffing hurts SEO — that counts as "breaking" things). Content is DB-driven, so this updates database content (admin-editable later).

> Reminder: the meta `keywords` tag is ignored by Google — real ranking comes from titles/headings/content/alt/anchors, which is what this does. (Adding a few to the keywords field is optional, no harm, no benefit.)

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** Short summary at the end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.** (You MAY run the data script since it writes content — print masked DB target first.)

## 0b. GROUND RULES (nothing may break)
- **Natural placement only — NO keyword stuffing.** Each keyword goes in ONE sensible spot; keep sentences readable and human. Do not cram multiple keywords into one line or repeat unnaturally. Over-optimization is a fail.
- **Additive/surgical, same theme.** Update copy/titles/FAQ/alt in the DB; do NOT change layout, design, components, features, security, or `.env`. Headings stay one `<h1>` per page; logical structure preserved.
- **Don't change meaning/tone** of existing good copy — adjust/append, don't degrade. Keep titles ≤ ~60 chars and descriptions ~120–155 chars.
- Every keyword from §1 must end up on-page somewhere (title/H1/H2/body/FAQ/alt/anchor). Premium quality.

---

## 1. Keyword → exact placement map (all 25)

### Home (`/`) — SeoMeta + hero/about copy
| Keyword | Where |
|---|---|
| website design company in delhi | Home **title** (already close — keep) |
| website design company | Home title / hero H2 (one of the slides) |
| web design company | Home about/intro line |
| website design | Home hero/about body (natural) |
| web design | Home about body |

### `/services/website-designing` — SeoMeta + content + FAQ
| Keyword | Where |
|---|---|
| web design services | **title** / H2 ("Web design services in Delhi") |
| website design services | description / H2 |
| business website design | a body line / H2 |
| website design for small business | a "Website design for small businesses" section line or FAQ |
| website designers for small business | FAQ answer ("our website designers for small business…") |
| website redesign | a "Website redesign" line/FAQ ("We also do website redesign…") |

### `/services/website-development` — SeoMeta + content + FAQ
| Keyword | Where |
|---|---|
| website development | **title** / H1 area |
| web development company | title ("Web Development Company in Delhi") |
| website development company | description / body |
| website development india | description ("…website development across India") |
| business website | a body line ("your business website…") |
| website management | a "Website management & maintenance" line/FAQ |
| website management services | same maintenance section/FAQ ("our website management services…") |

### Location pages (`/locations/delhi`, noida, …) + Google Business Profile
| Keyword | Where |
|---|---|
| website designing company in delhi | `/locations/delhi` title/H1 + body |
| web design companies near me | location-page body ("…among the web design companies near you") + **Google Business Profile** (note: "near me" mainly ranks via GBP) |
| web development companies near me | location-page body + **Google Business Profile** |

### Homepage + services FAQ (intent / long-tail — perfect for FAQ + AEO)
Add natural FAQ Q&A entries (these capture the buyer-intent keywords without stuffing the main copy):
| Keyword | FAQ question (example) |
|---|---|
| i need a website | "I need a website for my business — where do I start?" |
| need a website | (covered by the same/related FAQ answer) |
| build a website for my business | "How do I build a website for my business?" |
| create a website for my business | (FAQ answer naturally uses "create a website for your business") |
| build a website for business | (FAQ answer variant) |
| creating a website for business | (FAQ answer variant / or a blog) |

(One or two well-written FAQ answers can naturally include several of these "build/create a website for (my) business" variants.)

## 2. How to implement (DB content, natural)
Write/extend a one-off script `scripts/fill-keywords.ts` (reuse env-loading + mongoose; print masked DB target; update the specific fields below; idempotent):
1. **SeoMeta titles + descriptions** for: home, services list, website-designing, website-development, seo-services, and the location pages — set keyword-optimised values per the map (keep ≤60 char titles, 120–155 char descriptions, brand suffix handled by buildMetadata).
2. **Service body copy / headings** (the service `content`/`shortDescription`/`features`): add the mapped natural lines/H2s for website-designing & website-development (small-business, redesign, management, india) — append/adjust, don't degrade existing copy.
3. **FAQ entries:** add the intent-keyword FAQ Q&A to the homepage FAQ and/or the relevant service FAQs (real, helpful 40–60-word answers). These also boost AEO.
4. **Image alt text:** set a few keyword-relevant alts (e.g. the website-designing cover → "website design services in Delhi …"), natural and descriptive.
5. **Location-page body:** add the "near me" + "website designing company in delhi" lines naturally.
Run after showing the DB target. Keep everything human and non-spammy.

## 3. Acceptance criteria
- **Every one of the 25 keywords** appears naturally on a relevant page (title / H1 / H2 / body / FAQ / alt / internal-anchor) — none missed.
- **No keyword stuffing** — copy reads naturally; titles ≤60 chars, descriptions 120–155.
- All changes are DB content (admin-editable); **layout/theme/features/security unchanged**; one `<h1>` per page; nothing breaks.
- "Near me" keywords noted as needing Google Business Profile too (not on-page alone).
```
