# SERVICE-DROPDOWN.md — Dynamic "Services" dropdown in the header

**Site:** webdigitaldevelopment.com (Next.js 14 App Router + MongoDB)
**Goal:** Turn the header's plain **"Services"** nav link into a **premium dropdown** that lists all services, each linking to its `/services/[slug]` page. It must be **dynamic**: when a service is added/edited/removed in the **admin panel**, it should automatically appear/update in the dropdown (and the mobile menu) — no code change needed.

---

## 0. OPERATIONAL RULES (how to work)
1. **Start directly. Do NOT ask permission.**
2. **Do NOT run `npm run build` / type-check / lint — the owner verifies the build.** Make the changes correctly in one pass.
3. **Do NOT narrate or explain step-by-step.** A 2-3 line summary at the end is enough.

## 0b. GROUND RULES (must not break anything)
- **Do NOT break any existing feature** — all other nav items, mobile menu, theme toggle, the CTA button, scroll behaviour, and the animated hover indicator must keep working exactly as now.
- **Match the existing design** — the dropdown must look native and premium (consistent colors, fonts, radius, shadow, spacing, and motion with the current site). This is the ONLY new UI; do not change any other styling/theme/layout.
- **Do NOT change** other pages, metadata/SEO, content, security, `next.config.mjs`, auth, `.env*`, or images.
- Accessible: keyboard focusable, `aria-expanded`/`aria-haspopup`, closes on Escape and on click-outside, works on touch.
- Surgical edits only.

---

## 1. Current state
- `src/components/SiteHeader.tsx` — a **client** component with a **hardcoded** `NAV_ITEMS` array; "Services" is item `{ label: "Services", to: "/services" }`. It renders the desktop nav (with a framer-motion sliding `nav-indicator`) and passes `NAV_ITEMS` to `MobileMenu`.
- `src/components/public/MobileMenu.tsx` — the mobile drawer, takes `items`.
- `src/app/(public)/layout.tsx` — **server** component; already fetches settings and passes `socialLinks` to `SiteHeader`. This is where service data should be fetched and passed down.
- Services live in MongoDB; there is a service-layer reader (e.g. `listServices()` in `src/server/services/service.service.ts`) returning services with `title` and `slug`. Service admin routes already call `revalidatePublic.services()` on create/update/delete/reorder.

## 2. What to build

### A. Provide services to the header (dynamic data)
- In `src/app/(public)/layout.tsx`, fetch the **published/visible** services (only `title` + `slug`, in the admin display order) and pass them to `SiteHeader` as a prop, e.g. `services={[{ label, slug }]}`.
- Use a **cached, tagged** read so it's efficient and auto-refreshes: wrap the services read with `unstable_cache` tagged `"services"` (mirror how `getCachedSettings`/`getCachedSiteContent` are done), and make the service admin routes call `revalidateTag("services")` on create/update/delete/reorder (they already call `revalidatePublic.services()` — add the tag revalidation alongside, or extend `revalidatePublic.services()` to also `revalidateTag("services")`). This guarantees a newly-added service shows in the dropdown right after saving.
- Guard with `.catch(() => [])` so a DB hiccup never breaks the header.

### B. Desktop dropdown (SiteHeader.tsx)
- Replace the single "Services" link behaviour with a dropdown:
  - The "Services" label still links to `/services` (clicking it navigates to the list page).
  - On **hover** (desktop) — and on keyboard focus — open a dropdown panel listing each service as a link to `/services/${slug}`.
  - Keep the existing animated hover `nav-indicator` working for all items including Services.
  - Close on mouse-leave, Escape, click-outside, or route change.
- If the `services` array is empty, render "Services" exactly as the current plain link (graceful fallback — no empty dropdown).
- Keep `NAV_ITEMS` for the other links; only "Services" becomes a dropdown. (You may add an optional `children`/`dropdown` flag to the Services item rather than hardcoding service names.)

### C. Mobile (MobileMenu.tsx)
- Make the "Services" entry an **expandable accordion**: tapping it expands to show the same service sub-links (each → `/services/${slug}`), while a separate tap/area can still go to `/services`. Selecting any link closes the drawer (existing behaviour).
- Pass the services list into `MobileMenu` (new prop) the same way.

### D. Styling (globals.css)
- Add dropdown-panel styles that match the site: same font, brand colors, border radius, subtle shadow/blur, and a short open/close transition consistent with existing animations. Support both light and dark theme (the site has a dark mode). Ensure it sits above other content (z-index) and is positioned under the Services item. Do not alter any existing header styles beyond what's needed to anchor the dropdown.

## 3. Acceptance criteria
- Desktop: hovering/focusing "Services" opens a premium dropdown listing **all current DB services**, each linking to the correct `/services/[slug]`; clicking "Services" still opens `/services`.
- Mobile: "Services" expands to the same sub-links; everything still closes correctly.
- **Dynamic:** add a new service in admin → it appears in the dropdown (and mobile) without any code change (after the tagged revalidation); editing the title/slug updates it; removing it removes it.
- Light + dark theme both look correct; the hover indicator and all other nav items behave exactly as before.
- Nothing else changed: other pages, SEO, security, theme, and features untouched.
