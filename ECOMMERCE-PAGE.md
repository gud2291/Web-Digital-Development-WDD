# ECOMMERCE-PAGE.md — Rebuild the E-commerce Development service page (client brief)

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB)
**Page:** `/services/ecommerce-development` ONLY. This is a content/SEO upgrade for this one service. The other 7 service pages and the shared template must stay exactly as they are.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** Short summary at the end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.** (You MAY run the data script since it writes content — print masked DB target first.)

## 0b. GROUND RULES (nothing may break)
- **Scope = the E-commerce service only.** Work via the DB content for that one service. If any new rendering is added (see §3), it must be **OPTIONAL fields that render only when present**, so the other service pages (empty fields) are byte-for-byte unchanged.
- **Additive/surgical, same theme** (light + dark, responsive), reuse existing components/styles. No layout/design/feature/security/`.env`/other-page changes.
- **SEO/GEO/AEO done right:** exactly one `<h1>`, 8–10 `<h2>`, H3s where needed, primary + secondary keywords woven **naturally (no stuffing)**, short paragraphs (3–5 lines), bullets where useful, descriptive image ALT, compelling meta title (≤60) + description (120–155). Keep FAQ schema + breadcrumb schema + Organization schema present on the page (they already exist on service pages — verify, don't remove).
- **Professional + believable copy.** Do NOT use "We are the best…". Replace any existing line like **"We are the best e-commerce development company."** with the client's stronger version:
  > "We build e-commerce websites designed around your business goals—not generic templates. Every project starts with understanding how your customers buy, what your products need, and how your online store can grow over time."
- Word count target 1,800–2,200; write for users first.

---

## 1. Replace the weak sentence (find + fix everywhere)
Search the e-commerce service content (and anywhere it appears) for "We are the best e-commerce development company." (and similar "we are the best" claims on this page) and replace with the client's stronger sentence above. Avoid all "we are the best" phrasing on this page.

## 2. Page content (author into the E-commerce service's DB fields, per the client brief)
Primary keyword: **Ecommerce Website Development**. Secondary: Ecommerce Website Development Company/Services, Custom Ecommerce Development, Online Store Development, Ecommerce Website Design, B2B/B2C Ecommerce Development, Ecommerce Development Company India, Laravel/Next.js Ecommerce Development, Ecommerce Website for Manufacturers/Exporters.

Author this into the service's `content` (rich text) + `features` + `faqs` + meta:
- **H1 (the service title):** "Ecommerce Website Development Services" (only one H1).
- **Intro:** "Build an Online Store That Grows Your Business, Not Just Your Online Presence." + the brief's intro paragraphs (customer expectations; WDD recommends the best platform per business; manufacturer/exporter/retailer/startup; scalable, secure, SEO-ready). Link the phrase **"Website Development services"** to `/services/website-development`.
- **H2 "Why Every Business Needs an Ecommerce Website":** bullets (sell 24/7, reach India + globally, build trust, secure payments, manage inventory, organic SEO traffic, scale without limits) + the closing line: *"An ecommerce website is no longer just an online store—it becomes one of your strongest business assets."*
- **H2 "Ecommerce Solutions Designed Around Your Business":** technology chosen by business goals, not developer preference — Laravel, Next.js, Custom PHP, future-ready architecture, scalable, business-focused.
- **H2 "Ecommerce Features That Help You Sell More":** use the existing **features list** (icon cards) — include: Mobile Responsive Design, Product Catalogue, Secure Payment Gateway, Razorpay Integration, PhonePe Integration, Cash on Delivery, Shipping Integration, Inventory Management, Product Search, Wishlist, Customer Accounts, Order Tracking, Discount Coupons, WhatsApp Integration, Google Analytics, Technical SEO Ready, SSL Security.
- **H2 "Industries We Serve":** Manufacturers, Exporters, Retail Businesses, Interior Designers, Furniture Businesses, Agro Businesses, Fashion Brands, Healthcare Products, Beauty Products, Electronics, Home Decor, Local Businesses, Small & Medium Enterprises.
- **H2 "Why Choose Web Digital Development?":** weave naturally (200+ websites delivered, business-first consultation, technology recommendation, SEO-ready, mobile-first, one year free maintenance, free technical guidance, basic SEO included, long-term support, Google/Meta Ads support, social growth guidance). NO "we are the best".
- **H2 "Our Ecommerce Development Process":** 8 steps — Business Consultation, Requirement Analysis, Technology Selection, UI/UX Design, Development, Testing & QA, Website Launch, Maintenance & Growth Support.
- **H2 "Frequently Asked Questions":** ~15 helpful FAQs into the service `faqs` field (which platform is right, cost, manage products myself, migrate existing site, do you provide SEO, payment gateways, shipping integration, mobile-friendly, how long, sell internationally, etc.). These feed the existing FAQ schema.
- **H2 "Ready to Build Your Online Store?" CTA:** the brief's closing copy + two CTAs ("Get Free Consultation" → /contact, "Request a Quote" → /contact or the quote flow).

## 3. Industries + Process as cards (additive, optional, safe)
If the shared service template doesn't already render "industries" and "process steps" as cards, add them as **OPTIONAL service fields** (e.g. `industries: string[]`, `processSteps: {title}[]`) + zod + the Service admin form, and render a card/steps section **only when those arrays are non-empty** — so the other 7 services (empty) render exactly as before. Match the existing card styling. If the template already has suitable sections, reuse them instead. Either way: other service pages must be unchanged.

## 4. Internal linking (mandatory, natural)
Within the content, add natural internal links to: Website Development (/services/website-development), SEO Services (/services/seo-services), Digital Marketing (/services/digital-marketing), Portfolio (/projects), About Us (/about), Contact Us (/contact), Blog (/blog) — descriptive anchors, not stuffed.

## 5. Meta + schema
- Set a compelling **meta title** (≤60, primary keyword first) + **description** (120–155) for this page (SeoMeta `services/ecommerce-development` or the service seoTitle/seoDescription).
- Ensure **FAQPage + BreadcrumbList + Organization/LocalBusiness** schema are present on the page (already standard on service pages — verify, don't remove). FAQ schema must mirror the visible FAQ.

## 6. Implementation
Write/extend a one-off script `scripts/fill-ecommerce-page.ts` (reuse env-loading + mongoose; print masked DB target; update only the e-commerce service record + its SeoMeta; idempotent) to set the content, features, faqs, industries/process (if used), and meta. Run after showing the DB target.

## Acceptance criteria
- The `/services/ecommerce-development` page matches the brief: one H1, 8–10 H2s, the intro, why-ecommerce, solutions, feature icon-cards, industries, why-choose, 8-step process, ~15 FAQs, CTA — professional, ~1,800–2,200 words, keywords natural (no stuffing), short paras.
- The "we are the best" line is gone (replaced by the client's sentence). Internal links + meta + FAQ/breadcrumb/Organization schema present.
- **Other service pages + the shared template are unchanged**; nothing else breaks; same theme, responsive, one h1.
```
