# QUOTATION-PDF-REDESIGN.md — Match the PDF to the reference poster + records + localhost fix

**Site:** webdigitaldevelopment.com (Next.js 14 + @react-pdf/renderer + MongoDB + Cloudinary)
**Goal:** Rebuild the quotation PDF so it looks **exactly like the reference poster** (two-column, boxed cards, icons, green ribbon, dark footer) — the colours are already right, only the layout is wrong (currently everything is in one plain column). Plus: never show "localhost" in the PDF, and keep a record of every quotation generated so the admin can track who got what.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** Short summary at the end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.** (You MAY run the Part-4 sample seed since it writes data — print masked DB target first.)

## 0b. GROUND RULES
- **Additive/surgical, nothing else breaks.** Only the PDF template, the website-display value, and a new quotation-record/list are touched. The existing generate/download/email/WhatsApp flow keeps working.
- **Use the REAL WD logo** (the colourful WD mosaic the site header uses) — not an AI/placeholder.
- Premium quality; the PDF should be visually close to the poster.

---

## PART 1 — Rebuild the PDF layout to match the reference poster (the big one)
Rebuild the `@react-pdf/renderer` quotation template to mirror the poster. A4 portrait, white background. Use `@react-pdf/renderer` flexbox (rows/columns) for the two-column layout, coloured `View` boxes for cards, and simple `Svg`/`Path` (or small images) for the icons. Greens: a medium green + a darker green (gradient where shown), white cards, light-grey panels, dark navy/black footer.

**Top header band:**
- LEFT: real WD logo + "WEB DIGITAL DEVELOPMENT" + tagline "BUILDING WEBSITES. BUILDING BUSINESSES."
- RIGHT: green angular block with **"QUOTATION"** (large) and the service's quotation title (e.g. "COMPLETE WEBSITE DEVELOPMENT") under it.

**Info row — 4 columns, each = circular outlined green icon + label + value, with thin vertical dividers:**
- Quotation No. (doc icon) → `WDD-####`
- Date (calendar icon) → today
- Client Name (person icon) → client name
- Validity (clock icon) → from settings

**Body — TWO COLUMNS:**
- LEFT column:
  - Greeting: "Dear {clientName}," + the greeting paragraph.
  - **"INCLUDED IN SCOPE OF WORK"** card: green header bar (clipboard icon + title) + a checklist below — each item = green circle-check icon + text (the service's scope list).
- RIGHT column:
  - **"TOTAL DEVELOPMENT COST"** rounded box with a **green corner ribbon "ONE-TIME DEVELOPMENT CHARGE"**, the big cost range, a divider, then **"HOSTING (OPTIONAL)"** + the hosting price.
  - **"PAYMENT TERMS"** card: dark-green header (card icon + title); rows = a green-gradient **% box** (e.g. 20% / 30% / 50%) + label + sub line.
  - **"DOMAIN & HOSTING"** card: dark header (globe icon + title); 3 rows, each a circular icon + text (domain registration included; hosting charges note; alternatively buy hosting separately).

**Feature badges strip** (light panel, 4 items with thin dividers): circular icon + 2-line label — Modern & Responsive, Basic SEO Setup, Secure & Reliable, Support & Assistance.

**Dark footer band:**
- LEFT: phone (green icon box) + website (green icon box).
- RIGHT: green block with calendar icon + "ESTIMATED DELIVERY TIME" + the big delivery value + "(depending on content availability)".

**Bottom green bar:** italic "Thank you for your time and consideration." (left) + "We look forward to working with you!" (right).

Match spacing, rounded corners, header bars, the ribbon, and icon style as closely as `@react-pdf/renderer` allows. All values come from the selected service + global QuotationSettings + the entered client details.

## PART 2 — Never show "localhost" in the PDF
- The footer website must always display **`www.webdigitaldevelopment.com`** (a literal brand string), NOT `siteConfig.url` / `NEXT_PUBLIC_SITE_URL` (which is localhost in dev). Hardcode the brand domain for display so the PDF is correct regardless of environment. (Phone also from siteConfig is fine.)

## PART 3 — Save a record of every quotation (so the admin can track)
- Create a `Quotation` record in the DB saved each time a quotation is generated/sent, with: quotation number, client name, phone, email, selected service, cost range shown, date, and how it was sent (download / email / whatsapp).
- Add a simple **admin "Quotations" list** page showing these records (number, client, phone, service, date, sent-via) so the owner can see **who got which quotation and their contact**. Read-only list is fine (newest first). This makes the quotation number meaningful (look it up later).

## PART 4 — Seed sample data so it can be tested now
- Ensure the global QuotationSettings + at least the services have quotation config (run/confirm the earlier `fill-service-quotations.ts`). If anything's empty, fill sensible sample values that mirror the poster (cost range, scope list, payment terms, hosting, validity, delivery, badges) so a generated PDF looks complete out of the box for testing.

## Acceptance criteria
- A generated PDF looks **like the reference poster**: two-column layout, the scope card, cost box with ribbon, payment-terms rows, domain & hosting card, feature badges strip, dark footer with delivery box, and the bottom thank-you bar — with the **real WD logo** and the green theme.
- The PDF footer shows **www.webdigitaldevelopment.com** (never localhost).
- Every generated quotation is **saved**, and an admin **"Quotations" list** shows who received what (client, phone, service, number, date).
- Sample data present so the PDF is testable immediately. Nothing else breaks.
```
