# FIX-PROMPT — Duplicate opening on "Website Maintenance Cost in India"

**Site:** webdigitaldevelopment.com — page: `/blog/website-maintenance-cost-india`
**Issue (reported by a client, screenshot confirmed):** the page opens with two near-identical sentences back to back — the `excerpt` (renders as the lead-in text right below the header/image) and the body's first paragraph both restate "website maintenance costs ₹2,000–₹25,000 per month in India" almost word for word, one right after the other.

---

## Root cause
Both the `excerpt` field and the body's opening paragraph were written to satisfy the "first 1–2 sentences must be a direct, snippet-ready answer" rule from the content workflow. That rule is meant for the body (it's what helps with AEO / featured snippets). Nobody accounted for the fact that on this site's blog template, `excerpt` renders immediately above `content` — so two near-identical answer-sentences end up stacked on the live page. The body's opening is doing its job correctly and should NOT change. The `excerpt` is the one that's wrong — it should be a distinct teaser, not a restatement of the same sentence.

---

## Fix — surgical, one field only
1. Connect the same way as the other seed scripts (`.env.local` loader + `mongoose.connect`, inline `strict:false` Blog schema, no `collection:` override — same pattern as `scripts/seed-new-blogs.ts`).
2. Find the blog with `slug: "website-maintenance-cost-india"`.
3. Replace ONLY its `excerpt` field with (use this, or a close variant that fixes the duplication without changing the meaning):

   > "Wondering what a website actually costs to maintain in India? Here's the full 2026 breakdown — what you're really paying for, real price tables by site type, and what skipping maintenance ends up costing instead."

4. Do NOT touch `content`, `title`, `seoTitle`, `seoDescription`, tags, related fields, or any other field on this document. Do NOT touch any other blog, any SEO Meta entry, or any file under `src/`.
5. Save as `scripts/fix-maintenance-cost-excerpt.ts`, run it, read back the document to confirm the new excerpt saved, report the before/after excerpt text.

---

## Apply this going forward, to every future blog on this site
`excerpt` must never restate the body's opening sentence(s) near-verbatim. Since the template renders it directly above the body, it needs to work as a distinct hook/teaser (what the article covers, why it's worth reading) — while the body's first 1–2 sentences keep doing the direct-answer/AEO job. Keep both distinct on every blog from now on, not just this one.

Make this change directly now, no permission needed. One short summary at the end only.
