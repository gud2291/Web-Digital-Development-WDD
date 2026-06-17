# SEMRUSH-DB-LINKS.md — DB external links that need the owner's attention

These external links live in the **database** (admin-editable) and were NOT changed
by code — fixing them in code would require writing to the production DB, which we do
not do. Please fix each one in the **admin panel**.

Generated from a **read-only** audit: `npx tsx scripts/audit-db-links.ts`
(connects with `MONGODB_URI`, only reads, never writes). Re-run it any time to refresh.

**Default rule:** if there is no real URL, **remove the link** (leave the field blank).
Never use a placeholder. An empty field renders no link at all (safe — not "broken").

---

## 1. Team members — placeholder LinkedIn URLs (Admin → Team)

Each of these has a fake `linkedin.com/in/placeholder-*` URL carried over from the seed.
**Action:** replace with the person's real LinkedIn URL, **or clear the LinkedIn field**
if they don't have one (preferred over leaving a placeholder).

| Team member    | Current linkedinUrl (broken)              | Fix |
|----------------|-------------------------------------------|-----|
| Tushar Ahlawat | `https://linkedin.com/in/placeholder-rohit` | Real URL **or clear** |
| Dimple         | `https://linkedin.com/in/placeholder-priya` | Real URL **or clear** |
| Sumit Kandpal  | `https://linkedin.com/in/placeholder-arjun` | Real URL **or clear** |
| Putul Kumari   | `https://linkedin.com/in/placeholder-neha`  | Real URL **or clear** |

> Gudia Yadav's LinkedIn (`linkedin.com/in/gudia-yadav-7aa002220`) is real — leave it.

---

## 2. Projects — missing live-preview URLs (Admin → Projects)

These projects have an **empty** live-preview URL. An empty field renders no link, so it
is not itself a broken link — but if a live client site exists, add it; otherwise leave
it blank (the "Live Preview" button simply won't link out).

| Project                | Current liveUrl | Fix |
|------------------------|-----------------|-----|
| Shree Namo Motar Glass | *(empty)*       | Add real URL **or leave blank** |
| IHS Gurgaon            | *(empty)*       | Add real URL **or leave blank** |
| QuickBooks Next        | *(empty)*       | Add real URL **or leave blank** |
| VM International        | *(empty)*       | Add real URL **or leave blank** |
| Atlanture              | *(empty)*       | Add real URL **or leave blank** |
| Fams Global Trade      | *(empty)*       | Add real URL **or leave blank** |

### Projects with live URLs — verify these still resolve
The audit found no obviously-wrong domains here (none point at the old
`webdigitaldevelopment.in`), but Semrush may have flagged some as dead. Open each and
confirm it loads; if a client site is gone, **clear the URL** in admin:

- Orgway Agritech — `https://orgwayagritech.com`
- Sahayog Solar — `https://www.sahayogsolar.com`
- Ajay Kumar Singhal — `https://ajaykumarsinghal.com`
- Expoed — `https://expoed.es`
- SBM Greens — `https://sbmgreens.in`
- Medhawi — `https://medhawi.in/`

> Note: some Semrush "broken external link" reports are **false positives** (the target
> site blocks Semrush's crawler). If a URL opens fine in your browser, leave it as-is.

---

## What was already fixed in code (no DB write needed)
- `scripts/seed-team-members.ts` — placeholder LinkedIn URLs replaced with blank, so
  future seeds are clean.
- `src/lib/utils.ts` — `absoluteUrl()` fallback domain corrected from the old `.in` to
  the canonical `.com`.
