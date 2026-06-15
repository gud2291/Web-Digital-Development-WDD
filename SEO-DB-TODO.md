# SEO DB To-Do — title & description fixes for the admin panel

These pages get their **title/description from the database** (the service/blog
`seoTitle`/`seoDescription`, location SEO fields, or the `SeoMeta` collection), so
they can't be fixed in code. Edit each one in the **admin panel** (or wherever that
entity's SEO fields live). The code-side defaults and the seed scripts have already
been shortened (see B1/B2), but the **live DB still holds the old long values** until
you update them here.

## How to apply

- Paste the **Suggested title** into the entity's `seoTitle` field **without** the
  brand — the site automatically appends `| Web Digital Development`. (Final rendered
  title stays ≤ 60 characters.)
- Paste the **Suggested description** into `seoDescription` (already 120–155 chars,
  with a benefit + soft CTA).
- These are starting points — tweak wording freely, just keep the lengths.

> **Note on source:** the crawl export `issues_overview_report.csv` was **not present
> in the repo**, so this list is built from the seeded/known DB entries rather than the
> exact flagged URL list. Cross-check against your Screaming Frog "Page Titles > Over
> 60 Characters" and "Meta Description > Over 155 / Below 70" tabs and apply the same
> pattern to any URL not listed here.

---

## ⚠️ Static pages — `SeoMeta` overrides (HIGHEST PRIORITY)

These core pages call `metadataFromDb("<slug>")`, and a **`SeoMeta` record in the
live DB currently overrides the (now-shortened) code defaults**. Verified live: every
one renders a title **> 60 chars** and a description **> 155 chars** — i.e. the crawl's
flagged values come from `SeoMeta`, not code. Until you update `SeoMeta` (admin → SEO),
the shortened code defaults won't show. Set each `SeoMeta` entry to:

| Page | `SeoMeta` slug | Suggested title (brand auto-added) | Suggested description |
|---|---|---|---|
| Home | home | Website Design Company in Delhi | Delhi web design & development studio building fast, responsive sites that turn visitors into paying customers. 400+ delivered — get a free quote. |
| About | about | About Our Delhi Web Design Studio | Delhi web design & development studio since 2019 — 400+ sites delivered for 250+ clients across India and abroad. Meet the team behind your next site. |
| Blog | blog | Web Design & SEO Blog | Practical web design, development and SEO tips for Indian businesses — trends, how-tos and guides to help your website rank higher and convert more. |
| Contact | contact | Contact Our Delhi Web Design Team | Talk to Web Digital Development about your website, SEO or e-commerce project. We reply within 4 business hours — call, WhatsApp or send the form. |
| Legal | legal | Legal & Policies | Read the Privacy Policy, Terms of Service and Refund Policy for Web Digital Development — how we handle your data, payments and project agreements. |
| Reviews | reviews | Client Reviews & Ratings | Unedited reviews from real clients in Delhi and abroad — each links to the client's live website so you can verify every word. See why 130+ trust us. |
| Services | services | Web Design & Development Services | Website design, development, SEO, e-commerce and digital marketing for Indian businesses — everything to launch, rank and grow. Get a free quote. |
| Projects | projects | Website Design Portfolio | Browse 400+ websites we've shipped — e-commerce, tourism, corporate and automotive — each with a live link you can open and check for yourself. |

(If a page has **no** `SeoMeta` row, the shortened code default already applies — nothing
to do. `/sitemap` already renders correctly.)

---

## Services  (`/services/<slug>`)

| URL | Suggested `seoTitle` (brand auto-added) | Suggested `seoDescription` |
|---|---|---|
| /services/website-designing | Website Design Services in Delhi | Mobile-first, conversion-focused website design in Delhi. 400+ projects since 2019, Figma prototypes before code, and one month of post-launch support. |
| /services/website-development | Web Development Company in Delhi | Hand-coded website development from a Delhi studio — Next.js, React, WordPress and PHP. 6 years, 400+ launches, Lighthouse 90+ on every build. |
| /services/seo-services | SEO Services in Delhi for Page 1 | Professional SEO services in Delhi — keyword-led, white-hat, with transparent monthly reports. Most clients reach page 1 in 3–6 months. Get a free audit. |
| /services/digital-marketing | Digital Marketing Agency in Delhi | Performance-led digital marketing from a Delhi studio. Paid + organic, a flat monthly fee (no % of ad spend), and full transparency. Get a free plan. |
| /services/ecommerce-development | E-commerce Development in Delhi | E-commerce sites that sell — Shopify and WooCommerce experts in Delhi. Razorpay, GST-ready, abandoned-cart recovery. 6 years building online stores. |
| /services/graphic-designing | Graphic Design Services in Delhi | Logos, brand identity, brochures and social design from a Delhi studio. Custom concepts, source files included and a fast turnaround. Get a quote. |
| /services/wordpress-website | WordPress Web Development in Delhi | Custom WordPress development from a Delhi studio — no Elementor bloat. Clean code, Gutenberg blocks, fast hosting and an easy editor for your team. |
| /services/mobile-first-design | Mobile-First Website Design | Mobile-first design from a Delhi studio. We design at 360px first, test on real Android + iPhone, and prioritise touch + speed for India's traffic. |

## Locations  (`/locations/<slug>`)

| URL | Suggested `seoTitle` | Suggested `seoDescription` |
|---|---|---|
| /locations/delhi | Web Design Company in Delhi NCR | Professional website design, SEO and development in Delhi. Serving businesses across NCR with 400+ launches since 2019. Talk to our Delhi team today. |
| /locations/noida | Website Design Services in Noida | Custom website design and SEO for Noida businesses. We serve Noida, Greater Noida and nearby areas with 400+ successful projects. Get a free quote. |
| /locations/gurgaon | Website Design Services in Gurgaon | Professional website design and digital services for Gurgaon startups and businesses — custom-coded, SEO-ready sites built by our Gurgaon team. |
| /locations/faridabad | Website Design in Faridabad | Faridabad businesses deserve great websites. We design and develop custom, SEO-ready sites optimised for Google and local visibility. 400+ projects. |
| /locations/ghaziabad | Web Design Services in Ghaziabad | Modern, fast websites for Ghaziabad manufacturers, traders and service businesses. SEO included. Talk to our team about your online presence. |

## Blog posts  (`/blog/<slug>`)

Article titles are long by nature; set a shorter `seoTitle` per post (the visible
`<h1>` can stay as the full headline).

| URL | Suggested `seoTitle` | Suggested `seoDescription` |
|---|---|---|
| /blog/why-every-business-needs-a-website-2026 | Why Your Business Needs a Website | A founder-written take on why Indian small businesses need a real website in 2026 — not just a Facebook page. What it costs and where to start. |
| /blog/how-a-good-website-pays-for-itself | How a Website Pays For Itself | A founder-written breakdown of how we calculate website ROI for small Indian businesses — lifetime value, conversion rates and the math. |
| /blog/essential-website-features-2026 | Must-Have Website Features (2026) | Practical checklist from a Delhi studio that's shipped 400+ sites — what to insist on, what to skip, and why. Save it before your next quote. |
| /blog/how-to-choose-website-design-company-delhi-2026 | How to Choose a Web Design Company | A practical 2026 checklist for choosing a website design company in Delhi — what to ask, red flags to avoid, and how to compare quotes with confidence. |
| /blog/website-redesign-signs-losing-customers | Signs You Need a Website Redesign | Nine clear signs your business website is costing you customers — slow speed, poor mobile, weak SEO — and what a redesign can fix. Read the checklist. |
| /blog/local-seo-delhi-businesses-step-by-step | Local SEO for Delhi Businesses | A step-by-step local SEO guide for Delhi businesses — Google Business Profile, citations, reviews and on-page tips to rank locally and win leads. |
| /blog/nextjs-vs-wordpress-business-websites | Next.js vs WordPress for Business | Next.js vs WordPress for Indian business websites — speed, cost, SEO and maintenance compared, so you can pick the right platform for your next site. |
| /blog/ecommerce-mistakes-indian-stores | E-commerce Mistakes to Avoid | The most common e-commerce website mistakes Indian online stores make — checkout, mobile, trust and SEO — and how to fix them to boost sales. |

---

## Also check the `SeoMeta` collection (admin → SEO)

Any per-page override stored in `SeoMeta` (home, services, blog, etc.) takes priority
over the code defaults. If a flagged URL still shows a long title/description after the
above, it likely has a `SeoMeta` entry — fix it there too. The shortened code defaults
(B1/B2) only apply when the matching `SeoMeta`/entity field is empty.
