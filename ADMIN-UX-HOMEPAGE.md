# ADMIN-UX-HOMEPAGE.md — Make the admin Homepage editor clear & roomy

**Site:** webdigitaldevelopment.com — **ADMIN PANEL ONLY** task.
**Problem:** The admin **Homepage** editor is hard to use: the edit area is narrow/cramped, section borders are thin, there's no clear separation, and it's not obvious which block is which (e.g. "what comes after the slider"). Make it spacious, clearly sectioned, and labeled.

**Scope:** ONLY the admin Homepage editor + admin styling. The Projects/Team/Blogs editors are fine — **do not touch them**. **Do NOT change the public website at all.**

---

## 0. OPERATIONAL RULES
1. **Start directly. Do NOT ask permission.**
2. **Do NOT run `npm run build` / type-check / lint — the owner verifies.** One clean pass.
3. **Do NOT narrate.** 2-3 line summary at the end only.

## 0b. GROUND RULES
- **This is an ADMIN-panel UX improvement.** Improve layout/spacing/labels/width in the admin only. **Do NOT change the public site** (its theme/pages/components) in any way.
- **Do NOT break any admin functionality** — saving, every field, image Upload New / Choose from Library, drag-reorder, the Visible toggles, delete (×), and the Edit / Split / Preview modes must all keep working exactly as now.
- Stay within the **existing admin design language** (reuse admin colors/tokens/classes; just improve spacing, borders, labels, width). Don't introduce a clashing new look.
- Must work in admin **light AND dark** mode and stay **responsive** (usable on smaller screens — don't force a fixed wide width that breaks mobile).
- **No** data/schema/API/`.env`/security/public-page changes.

---

## 1. Files
- `src/app/admin/(protected)/homepage/HomepageForm.tsx` — the editor (structure: section grouping, headings, per-item labels).
- `src/app/admin/(protected)/homepage/page.tsx` — if it sets width/wrappers.
- `src/app/globals.css` — admin styles. Note: `.admin-form { max-width: 920px }` is why the editor is narrow; `.admin-card` uses a thin `1px` border. Add/adjust admin classes here (don't change public classes).

## 2. What to improve

### A. Roomy edit area (not cramped)
- The Homepage editor should use the **full available admin content width** in Edit mode (and a sensible split in Split mode), instead of being capped at the generic `.admin-form` 920px. Give it a dedicated wider wrapper/class (e.g. `admin-form--wide` or a homepage-editor class) rather than changing the shared `.admin-form` used by other forms. Keep comfortable padding so fields aren't edge-to-edge.

### B. Clear, labeled sections
- Group the editor's fields into clearly-labeled section blocks that match the homepage parts (per the page's own description: "hero slides, stats, client logos, CTA banner and section titles"). Give each group a **bold heading + one-line description**, e.g.:
  - **Hero Slides**
  - **Stats**
  - **Client Logos**
  - **Section Titles** (the eyebrow/heading texts)
  - **CTA Banner**
- This directly answers "slider ke baad kya hai" — the admin should instantly see which block they're in.

### C. Strong visual separation
- Between section groups and between repeatable items (each slide, each logo): add **clear separation** — more margin/spacing, a **stronger/clearer border** (or a subtle background tint / divider line) so blocks don't blur together. Increase the gap so it's obvious where one card ends and the next begins.

### D. Per-item headers
- Each repeatable item (slide / logo) should have a clear **header row** showing its label (e.g. "Slide 1", "Client Logo 2"), with its Visible toggle, reorder ↑↓, and delete (×) neatly aligned. Number the items so they're easy to track.

### E. Polish
- Consistent spacing rhythm, readable field labels, and the "Add logo"/"Add slide" buttons clearly separated from the items above them. Make the whole editor feel structured and easy to scan.

## 3. Acceptance criteria
- The Homepage editor is **wide/roomy** in Edit mode (no longer cramped in a narrow column).
- Each part is in a **clearly-labeled, visually-separated section** (Hero Slides, Stats, Client Logos, Section Titles, CTA Banner); repeatable items are labeled and clearly bordered/spaced.
- **All editing still works**: save, upload, choose-from-library, reorder, visible toggle, delete, and Edit/Split/Preview modes — unchanged.
- Looks correct in admin **light + dark** mode, **responsive** on smaller screens.
- **The public website and the other admin editors (Projects/Team/Blogs) are completely unchanged.**
