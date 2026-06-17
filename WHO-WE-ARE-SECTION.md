# WHO-WE-ARE-SECTION.md — Add a "Who We Are" section to the homepage

**Site:** webdigitaldevelopment.com (Next.js 14 App Router)
**Goal:** Add a new **"Who We Are"** section on the **homepage**, placed **directly ABOVE the existing "About Us" section**, using the content provided below — styled to match the current theme exactly, fully responsive, with no harm to SEO/GEO/AEO and nothing else changed.

---

## 0. OPERATIONAL RULES (how to work)
1. **Start directly. Do NOT ask permission.**
2. **Do NOT run `npm run build` / type-check / lint — the owner verifies the build.** Make the change correctly in one pass.
3. **Do NOT narrate or explain step-by-step.** A 2-3 line summary at the end is enough.

## 0b. GROUND RULES (must not break anything)
- **Additive only** — add ONE new section; do not change, move, or remove any existing section/content on the homepage or elsewhere.
- **Same theme, exactly** — reuse the site's existing components/classes for layout, headings, body text, eyebrow labels, buttons, spacing, and animations (e.g. `container`, `Eyebrow`, `SectionHead`, `Reveal`, `t-h2`, `t-h3`, `t-lead`, the existing `Btn`/link styles). **Do NOT introduce any new font family, font size, color, or custom CSS** beyond what the existing classes provide. It must look like it was always part of the page, in both **light and dark** mode.
- **Responsive** — use the same container/responsive patterns as the other homepage sections so it looks right on mobile and desktop.
- **Headings / SEO** — the homepage already has exactly **one `<h1>`** ("Custom websites, built in Delhi."). **Do NOT add another `<h1>`.** The new section's main title must be an **`<h2>`** and its sub-headings **`<h3>`**, keeping a logical h1 → h2 → h3 order. Do not change the page title, meta description, canonical, or any existing heading.
- **No SEO/GEO/AEO regression** — render the content as real, server-side text (it's keyword-rich and answer-style, which helps). Do not add `noindex`, do not touch metadata or schema.
- **No changes** to other pages, security, `next.config.mjs`, `.env*`, or images.

---

## 1. Where
- File: `src/app/(public)/page.tsx`.
- Insert the new section **immediately before the existing About Us section** (the block that starts with the `ABOUT US` eyebrow / the `<h2>` "Built in Delhi. Trusted across India and abroad. Since 2019."). So the homepage order becomes: … hero/stats → **Who We Are (new)** → About Us (existing) → Services → …

## 2. Structure & headings
- Eyebrow/kicker: `WHO WE ARE` (use the existing `Eyebrow`/`SectionHead` style used by other sections).
- Section title: **`<h2>`** — e.g. "Who We Are" (or use the lead line as the title; keep it an h2).
- Sub-sections, each an **`<h3>`**: "What We Bring to the Table", "Why It Matters", "Built for Businesses That Mean Business", "Let's Build Something Great Together".
- Body text in the existing paragraph/lead styles. Keep paragraphs short and readable.
- "What We Bring to the Table" list → use a **semantic `<ul>`** styled like the site. **Recommended (good for SEO + internal linking):** link each service name to its page:
  - Website Design & Development → `/services/website-development` (or `/services/website-designing`)
  - Website Redesign → `/services/website-designing`
  - Graphic Design → `/services/graphic-designing`
  - SEO & Content Strategy → `/services/seo-services`
  - Online Marketing & SMO → `/services/digital-marketing`
- Closing ("Let's Build Something Great Together"): end with a link/button to **`/contact`** using the existing button style. Do **not** duplicate the big final CTA that's already at the bottom of the homepage — keep this one subtle/inline.

## 3. Content (use this text)
> **Important consistency fix:** the draft says "4+ years", but the rest of the site says **"since 2019" / "6+ years"**. To avoid an on-page contradiction, change "4+ years" to **"since 2019"** (or "6+ years"). Keep everything else as written.

**Intro:**
"Since 2019, we've been doing what we love — helping businesses show up online the right way.

Web Digital Development is an Indian web design and development company built on one simple belief: your website should work as hard as you do. From the moment a visitor lands on your page, we want them to feel confident about your brand — and that takes more than just good looks.

Over the past few years, we've partnered with businesses across industries to build websites that don't just exist online, but actually perform. Whether you're starting from scratch or ready for a fresh redesign, our team brings together research, strategy, creative design, and technical development to deliver something you'll be genuinely proud of."

**What We Bring to the Table** (h3)
"We're not a one-size-fits-all agency. Every project we take on starts with understanding your business — your goals, your audience, and what makes you different. From there, we put our expertise to work across:"
- Website Design & Development — Clean, modern, fully responsive websites built to impress and convert
- Website Redesign — Breathing new life into outdated sites while preserving your brand identity
- Graphic Design — Logos, brochures, catalogues, and visual assets that keep your brand consistent
- SEO & Content Strategy — Keyword-focused content and on-page optimization that helps you get found on Google
- Online Marketing & SMO — Social media and digital marketing strategies that connect you with the right audience

**Why It Matters** (h3)
"Think about the last time you visited a website that felt clunky, slow, or just plain confusing. Chances are, you left — and didn't come back.

That's the reality of doing business online today. Your website is often the very first interaction someone has with your brand. It's your digital storefront, your business card, and your most accessible point of contact — all rolled into one.

A well-designed website builds trust instantly. A poorly designed one can cost you customers before they even read a single word. That's why we take every project seriously, no matter the size."

**Built for Businesses That Mean Business** (h3)
"At Web Digital Development, we've spent years (since 2019) refining our process so that what you get isn't just a beautiful website — it's a reliable digital asset that supports your growth.

Our team of experienced designers and developers stays up to date with the latest web standards, design trends, and search engine best practices. So when we hand over your website, it's not just ready to launch — it's ready to perform."

**Let's Build Something Great Together** (h3)
"Whether you're a startup finding your footing or an established business ready to level up your online presence, we're here to help. Tell us about your project and let's talk about what we can build for you."
→ button/link to `/contact` (existing style).

## 4. Acceptance criteria
- New "Who We Are" section renders **directly above** the existing About Us section on the homepage.
- Matches the site's theme/typography exactly (no new fonts/sizes/colors), looks correct in **light and dark** mode, and is responsive on mobile + desktop.
- The homepage still has **exactly one `<h1>`**; new headings are h2/h3 in logical order.
- Service items link to the correct `/services/[slug]` pages; closing links to `/contact`.
- No existing section/content/metadata/SEO changed; nothing else on the site touched.
