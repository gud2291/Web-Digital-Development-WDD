# QUOTATION-ENHANCE.md — Seed all services, better admin UI, WhatsApp send

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB + Cloudinary + Resend)
**Goal:** Build on the admin quotation feature with 3 things: (1) auto-fill quotation config for **all services** so the admin doesn't fill each by hand, (2) make the quotation admin UI **easy + advanced** (content edited easily), (3) add **"Send via WhatsApp"** alongside Download and Email.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** Short summary at the end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.** (You MAY run the seed script in Part 1, since it needs to write data — print a masked DB target first.)

## 0b. GROUND RULES
- **Additive/surgical. Nothing existing may break** — no change to unrelated features, layout, theme, CSS, SEO, security, `.env`. The existing admin quotation generator (download + email) keeps working.
- **Premium quality** — UI clean and on-brand; PDF unchanged (real WD logo, green design).

---

## PART 1 — Auto-fill quotation config for ALL services
Write a one-off data script `scripts/fill-service-quotations.ts` (reuse the env-loading + mongoose pattern from the other scripts; print the masked DB target, fill only EMPTY fields so manual edits are never overwritten):
- For **each existing service**, set `quotationEnabled = true`, a sensible **`quotationCostRange`**, and a **`quotationScope`** list appropriate to that service. Use realistic India web-studio pricing and a scope list that fits each service (website design, website development, e-commerce, SEO, digital marketing, graphic design, WordPress, mobile-first — tailor cost + scope to each). These are starting points the owner will tweak in admin.
- Also seed the **global `QuotationSettings`** with sensible defaults if empty (payment terms 20/30/50, hosting ₹5,000/year, validity "1 Month", delivery "15–25 working days", the feature badges, greeting + footer text) — mirroring the reference quotation.
- Run it (`npx tsx scripts/fill-service-quotations.ts`) after showing the masked DB target. Idempotent: re-running changes nothing already filled.

## PART 2 — Easy + advanced quotation admin UI
Improve the quotation admin so the client can edit everything easily (additive — don't break what's there):
- Clear, labelled sections for the **global settings** and the **per-service quotation** fields.
- **List editors** with add / remove / reorder for: scope-of-work items, payment terms (percent + label + sub), and feature badges — so adding/editing a line is one click, no raw text blobs.
- Keep the existing admin design language (cards, inputs, buttons). Make it scannable and roomy (don't cram).
- Optional nicety: a small "what the client will see" hint near the cost/scope fields.

## PART 3 — "Send via WhatsApp" (plus existing Download + Email)
WhatsApp can't take a file via a link, so share the PDF as a link:
1. Add a **"Send via WhatsApp"** action to the admin Generate-Quotation form (the form already has client name/phone/service).
2. On click, `POST /api/admin/quotation` (gateAdmin) should: generate the PDF, **upload it to Cloudinary as a raw/auto resource** (reuse the existing Cloudinary setup) to get a public `secure_url`, and return that URL.
3. The frontend then opens `https://wa.me/<clientPhone>?text=<message>` where the message is a short professional note + the PDF link, and `<clientPhone>` is the entered client phone normalised to digits with country code (default +91 if no code). This opens WhatsApp (web/app) with the message pre-filled to that client — the admin just presses send.
4. Keep the existing **Download** and **Email to client** actions working unchanged. (Email can also include the same hosted link if helpful.)
- Validate inputs; phone required for the WhatsApp action.

## Acceptance criteria
- After running the seed, **every service has quotation config** (enabled + cost + scope) and the global settings are populated — visible/editable in admin.
- The quotation admin UI is **easy to edit** (add/remove list rows for scope/terms/badges), clean and on-brand.
- The admin can **Download**, **Email**, OR **Send via WhatsApp** a quotation; WhatsApp opens with a pre-filled message + a working PDF link to the client.
- PDF unchanged (real logo, design). Nothing else breaks — additive/surgical only.
