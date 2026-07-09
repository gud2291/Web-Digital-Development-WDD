# FOUNDER-SECTION-IMPROVE.md — Make the "Founder & CEO" section premium + add real content

**Site:** webdigitaldevelopment.com (Next.js 14 + MongoDB + Cloudinary)
**Context:** The "Founder & CEO" section already exists on /about but currently looks plain (just a "GY" monogram block, a quote, and two flat Mission/Vision boxes). This spec upgrades it into a **premium, attractive, credibility-building** section, fills it with **real polished content**, and **moves it directly ABOVE the "Our Journey" section**.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** One short summary at the very end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.**

## 0b. GROUND RULES (nothing may break)
- **Additive/surgical.** Improve the existing Founder section + move its position. Do NOT touch other pages, other About sections, features, security, or `.env`.
- **Same theme** (light + dark), fully **responsive** (photo + text side-by-side on desktop; stack cleanly on mobile — photo on top, text below). Reuse existing components/typography/cards/tokens.
- **Position:** the Founder & CEO section must render **immediately ABOVE the "Our Journey" section** on /about. (Find the "Our Journey" block and place the Founder section right before it.)
- **Headings/SEO:** /about keeps exactly **one `<h1>`**. Founder section title = `<h2>`; "Mission"/"Vision" labels = `<h3>`. No metadata/schema regressions. Real founder content strengthens E-E-A-T.
- All fields **optional with the defaults below**, so it renders cleanly even before admin edits.

---

## 1. Data model (admin-managed)
In the model/config that holds the /about content (site-content) + its zod validation, ensure these OPTIONAL fields exist (add any missing ones):
- `founderName` — default `"Gudia Yadav"`
- `founderTitle` — default `"Founder & CEO"`
- `founderPhoto` — Cloudinary image URL (optional; if empty, keep the "GY" initials block as fallback)
- `founderPhotoAlt` — default `"Gudia Yadav, Founder & CEO of Web Digital Development"`
- `founderNote` — the personal message (long text) — default = **Content A** below
- `mission` — default = **Content B** below
- `vision` — default = **Content C** below
- `founderHighlights` — OPTIONAL array of `{ value, label }` (3 items). Default = **Content D** below. (If you don't want to add an array field to admin now, hardcode Content D as static chips — but prefer making it editable.)

---

## 2. CONTENT (use these as the default values — put this real copy in)

**Content A — founderNote (the personal message / quote):**
> "When I started Web Digital Development in 2019, I believed a world-class website shouldn't be a luxury only big brands can afford. That belief still drives everything we do. Every project that leaves our studio passes across my desk — because your website carries my name as much as yours. My promise is simple: premium design, honest pricing, and real support that doesn't disappear after launch."

**Content B — mission:**
> "To help small and mid-sized businesses across India and beyond build fast, beautiful, high-performing websites they're genuinely proud of — pairing premium design with honest pricing and support that stays with them long after launch."

**Content C — vision:**
> "To become India's most trusted web design studio — the first name a growing business thinks of when it wants a website that looks world-class and actually drives real growth."

**Content D — founderHighlights (3 credibility chips):**
- `{ value: "2019", label: "Building since" }`
- `{ value: "400+", label: "Projects shipped" }`
- `{ value: "Hands-on", label: "On every build" }`

**Signature line** (small text under the note): the founder name in a slightly emphasized/handwritten-feel style, e.g. `— Gudia Yadav, Founder & CEO`. (Use an italic/serif accent if the theme has one; otherwise bold + accent color.)

---

## 3. VISUAL UPGRADE (make it premium & attractive)
Rebuild the Founder section markup/styles (keep the same color theme) with:

**Left column — the photo:**
- Show `founderPhoto` via CldImage/next/image with fixed width/height (or a sized rounded container using `fill`), `object-cover`, descriptive alt, **lazy-load** (below the fold).
- Give it a **premium frame**: large rounded corners (`rounded-2xl`/`rounded-3xl`), soft shadow, and a **decorative offset accent block behind the photo** (a blurred gradient blob or a solid brand-color square offset behind the image) to add depth — instead of the current flat blue box.
- Fallback when no photo: keep the gradient "GY" initials block, but same premium frame + accent so it still looks intentional.

**Right column — the text:**
- Small eyebrow badge **"LEADERSHIP"** (keep).
- `<h2>` = `founderTitle` ("Founder & CEO"); below it the **name** (bold) + a subtle line `Founder & CEO · Web Digital Development`.
- The **founderNote** as a refined pull-quote with a left accent bar (keep the bar, refine spacing/line-height so it reads elegantly, not cramped).
- The **signature line** under the note.
- A row of the **3 founderHighlights chips** (value big/bold in accent color, label small/muted) — small, clean, evenly spaced; wrap on mobile.

**Mission & Vision (below, full width or two-column):**
- Two **equal-height cards** with border/subtle bg matching the theme, generous padding, rounded corners, and a **hover lift** (subtle translate-y + shadow).
- Each card: a small **icon** at top (Mission = target/bullseye icon; Vision = eye icon — use the icon set already in the project, e.g. lucide), then `<h3>` label in accent color, then the text.
- On desktop: side by side (2 columns). On mobile: stacked, full width. Ensure text never clips (fix the current mobile clipping seen where lines get cut).

**Overall polish:**
- Consistent vertical rhythm/section padding matching sibling sections.
- Works in light AND dark mode.
- Smooth, subtle transitions only (no heavy animation).

---

## 4. Admin UI
In the About/site-content admin form (`SiteContentForm.tsx` or wherever /about content is edited, + its loader/save route):
- Add/keep a **"Founder & CEO"** group with inputs: founder name, title, an **ImageUploader** for the photo (+ alt), a textarea for the note, textareas for Mission and Vision, and (if added) three `{value,label}` pairs for the highlights.
- Use existing admin form styles; round-trip on save; reuse the existing `revalidatePath("/about")` on save so changes go live.

---

## 5. Acceptance criteria
- /about shows a **premium, attractive** Founder & CEO section: framed founder photo (with accent depth) on one side; name + title + refined note + signature + 3 highlight chips on the other; **Mission** and **Vision** as polished, equal-height cards with icons and hover.
- The section sits **directly above the "Our Journey" section**.
- Real content (A/B/C/D above) is present as defaults, and **everything is editable from the admin panel** and round-trips on save.
- Fully responsive (clean stack on mobile, no text clipping), light + dark, exactly one `<h1>` on /about, and **nothing else changes / nothing breaks**.

Make all changes directly now.
