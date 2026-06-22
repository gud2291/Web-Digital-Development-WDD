# QUOTATION-PDF.md — Dynamic quotation/invoice PDF on form submit (admin-configurable per service)

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB + Cloudinary, on Vercel)
**Goal:** When a visitor fills the quote form and picks a service, they can **download a professional quotation PDF**, auto-filled with their details, priced/scoped per the selected service. Everything (cost, scope, payment terms, delivery, etc.) is **managed from the admin panel** so the client can set different values per service. The PDF must match the existing quotation design (see the reference image the owner provided) and use the **real WD logo** (not an AI-generated one).

This is a sizeable feature — it may take more than one pass. If you run out of room, stop at a clean point and say where to continue.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** A short summary at the end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.** Just implement correctly.

## 0b. GROUND RULES (nothing may break)
- **Do NOT break any existing feature, function, or CSS.** This is **additive only** — new model fields, a new admin section, a new form/route, a new PDF generator. The existing site/admin must work exactly as now.
- **No** changes to existing pages' layout/theme/CSS, SEO metadata, security, `.env`, or unrelated logic.
- **Quality must be premium** — the PDF should look as polished as the reference quotation.

---

## 1. What exists (reuse, don't rebuild)
- Leads system: `src/app/api/public/leads/route.ts` + admin **Inquiries**. Reuse it to store the lead.
- `Service` model already has `pricingTiers` (name/price/features/popular), `features`, `faqs`, `title`, `slug`. Build on it.
- Site/company info is in `src/config/site.ts` (name, phone, email, url, address, tagline).
- The real logo asset is what the public header/`Logo` component uses (e.g. `/assets/logo.png` / `/public/assets/...`). **Use that real logo in the PDF.**
- **No PDF library is installed** — add **`@react-pdf/renderer`** (it runs in Vercel serverless with no headless browser — do NOT use puppeteer/chromium).

## 2. Data model (admin-managed)
**A) Global quotation settings** — a single config the admin edits once (create a `QuotationSettings` model/singleton, or extend the existing Settings):
- `validity` (e.g. "1 Month"), `deliveryTime` (e.g. "15 – 25 working days"),
- `paymentTerms`: array of `{ percent, label, sub }` (e.g. 20% Advance / 30% After Design Approval / 50% Before Final Deployment),
- `hostingCost` (e.g. "₹5,000 / year"), `hostingNote`, `domainNote`,
- `featureBadges`: array of `{ title, subtitle }` (Modern & Responsive, Basic SEO Setup, Secure & Reliable, Support & Assistance),
- `footerNote`, `greetingTemplate` (with a `{clientName}` placeholder),
- company contact pulled from `siteConfig` (phone, website) — no need to duplicate.

**B) Per-service quotation fields** — add OPTIONAL fields to the `Service` model + its zod validation + the admin Service form:
- `quotationTitle` (e.g. "Complete Website Development", "E-commerce Development"),
- `quotationCostRange` (e.g. "₹35,000 – ₹45,000"),
- `quotationScope`: string[] (the "Included in Scope of Work" bullet list),
- optional per-service overrides for `deliveryTime` / `hostingCost` (fall back to global if empty),
- `quotationEnabled` (boolean) — only services with this on appear in the quote form's dropdown.

All new fields optional/additive; existing services keep working.

## 3. Admin UI
- **Global quotation settings:** a new admin page (e.g. `/admin/quotation`) or a section under Settings, with inputs for everything in §2A (payment-terms list editor, badges list, hosting, validity, delivery, greeting, footer).
- **Per-service:** add a "Quotation" section to the existing Service admin form (`ServiceForm.tsx` + `[id]` loader + new page) for the §2B fields. Use the existing form field styles; round-trip on save/edit.
- Wire admin saves to revalidate where needed (reuse the existing revalidate pattern).

## 4. User-facing quote form
- Add a **"Get a Quote / Download Quotation"** form (either a new section/page, or extend the existing contact/lead form — pick the cleaner one): fields = name, email, phone, business name (optional), and a **service dropdown** populated from services where `quotationEnabled` is true.
- On submit:
  1. Save the lead via the existing leads flow (so it shows in admin Inquiries).
  2. Generate the quotation PDF for the selected service + the entered details, and **download it** (PDF file).
- Validate input (zod) and rate-limit the endpoint like the other public POST routes.

## 5. PDF generation (`@react-pdf/renderer`)
- Create a server route (e.g. `POST /api/public/quotation`) that takes `{ serviceSlug, clientName, email, phone, business }`, loads the service's quotation fields + global settings, and returns a generated **PDF** (correct `Content-Type: application/pdf` + `Content-Disposition: attachment; filename="Quotation-WDD-XXXX.pdf"`).
- Build the PDF layout with `@react-pdf/renderer` to **match the reference quotation design**:
  - **Header:** real WD logo (left) + "QUOTATION / COMPLETE WEBSITE DEVELOPMENT" (right), green theme.
  - **Info row:** Quotation No. (auto-generate, e.g. `WDD-####`), Date (today), Client Name (from form), Validity (from settings).
  - **Greeting** ("Dear {clientName}, …") from the greeting template.
  - **Total cost box:** the service's `quotationCostRange` + "One-Time Development Charge"; Hosting (optional) line.
  - **Included in Scope of Work:** the service's `quotationScope` list with check icons.
  - **Payment Terms:** from settings (percent + label + sub).
  - **Domain & Hosting:** from settings notes.
  - **Feature badges row:** from settings.
  - **Footer:** phone + website (from siteConfig) + "Estimated Delivery Time" + thank-you line.
  - Match the green palette, fonts, spacing and overall look as closely as `@react-pdf/renderer` allows. Keep it clean and professional.
- **Real logo:** embed the actual site logo image (the colourful WD logo the header uses), NOT a placeholder/AI logo.
- **Quotation number:** generate a unique number (e.g. `WDD-` + a short random/sequential id). Optionally store the generated quote on the lead record.

## 6. Acceptance criteria
- A visitor can fill the quote form, pick a service, and **download a PDF quotation** that's auto-filled with their name/date/quote-number and the selected service's cost + scope.
- The admin can set, per service, the quotation title/cost/scope, and globally the payment terms/hosting/validity/delivery/badges — and the PDF reflects those values.
- The PDF visually matches the reference quotation design and uses the **real WD logo**.
- The lead is also saved in admin Inquiries.
- **Nothing existing breaks** — no feature/function/CSS/SEO/security regression; all changes additive.

---

## Suggested build order
1. Add `@react-pdf/renderer`; add the data-model fields (global settings + per-service) + zod.
2. Admin UI (global quotation page + per-service form fields).
3. The PDF generator route + `@react-pdf/renderer` template (design + real logo).
4. The user quote form wired to save-lead + download-PDF.
Stop at a clean point if needed and report where to continue.
