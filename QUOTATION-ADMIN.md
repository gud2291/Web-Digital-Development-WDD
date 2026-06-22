# QUOTATION-ADMIN.md — Remove self-service quote; make it admin-generated & sent

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB + Resend + Cloudinary)
**Goal:** Replace the visitor self-service quotation with an **admin-only** flow: the admin enters a client's details, picks a service, and **downloads the quotation PDF and/or emails it to the client**. Reuse the PDF generator, data model, and admin config that already exist from QUOTATION-PDF.md — only the trigger changes (public → admin).

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** Short summary at the end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.**

## 0b. GROUND RULES (nothing may break)
- **Removal must be clean:** when you remove the public self-service quote form/route, leave **no broken imports, dead links, or references**. The rest of the site/admin must keep working exactly as now.
- **The admin additions are additive/surgical.** No change to unrelated features, layout, theme, CSS, SEO, security, or `.env`.
- **Reuse, don't rebuild:** keep `@react-pdf/renderer`, the `QuotationSettings` model + its admin config, the per-service quotation fields + Service-form section, and the existing PDF template/generator. Only the public form/route is removed and an admin trigger is added.
- **Premium quality** — the PDF and admin UI stay polished.

---

## PART 1 — Remove the public self-service quotation
- Remove the **visitor-facing quote form** (the public section/page where a visitor entered details + downloaded a PDF) and any nav/menu/CTA link pointing to it.
- Remove or lock down the **public PDF route** (`/api/public/quotation` if that's where it lives): delete it, since generation now happens from the admin side (the new admin route in Part 2 replaces it).
- Do NOT remove: the PDF generator/template code, `@react-pdf/renderer`, the data model, or the admin config — those are reused. Keep the lead/Inquiries system unchanged.
- Verify nothing else imported the removed form/route (no dangling imports or broken build).

## PART 2 — Admin "Generate Quotation" (download + email to client)
Add an **admin-only** quotation generator (gated by the existing `gateAdmin`):
1. **UI:** a "Generate Quotation" form in the admin — either a dedicated page (e.g. `/admin/quotation/generate`) or a clear section in the quotation admin area. Fields:
   - Client name (required), client email (required for emailing), phone, business name (optional),
   - **Service dropdown** (the services that have quotation config / `quotationEnabled`).
   - Two actions: **"Download PDF"** and **"Email to client"**.
   - Optional nicety: a **"Create quotation"** shortcut on an Inquiry/lead row that opens this form pre-filled with that lead's name/email/phone.
2. **Route:** `POST /api/admin/quotation` (gated by `gateAdmin`, validated with zod, additive). It loads the selected service's quotation fields + global `QuotationSettings`, generates the PDF (reuse the existing generator), and based on the action:
   - **download:** returns the PDF (`application/pdf`, `Content-Disposition: attachment; filename="Quotation-WDD-XXXX.pdf"`).
   - **email:** sends the PDF to the client's email via the existing Resend `sendEmail` (PDF as attachment) with a short, professional covering message; return a success/failure JSON.
3. **PDF content:** unchanged from the existing generator — real WD logo, green theme, auto quotation number + today's date + the entered client name, the selected service's cost + scope, global payment terms / hosting / validity / delivery / badges, footer with siteConfig phone/website.
4. Keep the **admin config** (global QuotationSettings page + per-service quotation fields) exactly as built — that's how the client sets different pricing/scope per service.

## PART 3 — Acceptance criteria
- The **public** self-service quote form/route is gone, with no broken links/imports and no other regression.
- In the **admin**, the owner can enter a client's name/email + pick a service, then **download the quotation PDF** and/or **email it to the client** (via Resend), with the PDF auto-filled (client name, date, quote number) and priced/scoped per the selected service + global settings.
- The PDF still matches the reference design with the **real WD logo**.
- The admin quotation **config** (global + per-service) still works and drives the PDF values.
- Nothing else changed — additive/surgical, no feature/CSS/SEO/security regression.
