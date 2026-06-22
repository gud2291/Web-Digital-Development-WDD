# LANGUAGE-TRANSLATE.md — On-brand Google Translate language switcher

**Site:** webdigitaldevelopment.com (Next.js 14, public site)
**Goal:** Add a free language switcher using **Google Translate Element** (free, no token limit), styled as an **on-brand custom dropdown** that matches the site — without Google's default banner, and without breaking the UI, code, APIs, or SEO/GEO/AEO.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** Short summary at the end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.**

## 0b. GROUND RULES (nothing may break)
- **Additive/surgical.** A new language-switcher component + the Google Translate script + a little CSS to hide Google's chrome + placement in the header. **Do NOT change** existing pages, components, APIs, data, SEO metadata/schema/robots/sitemap, security, or `.env`.
- **UI/UX must stay identical** except for the new switcher, which must match the site theme (light + dark) and be responsive. **Hide Google's default top banner / iframe / tooltip** so the visible design is unchanged.
- **SEO/GEO/AEO unaffected:** the widget translates client-side only; do not alter any server-rendered HTML, metadata, hreflang, or canonical. Crawlers must keep seeing the original English (no change).
- Load the widget **client-side, after hydration** to avoid React hydration errors. Premium quality.

---

## 1. Implementation
1. **Google Translate Element script** — load it client-side only (e.g. via `next/script` with `strategy="lazyOnload"`, or inject on mount in a `"use client"` component). Initialise:
   `new google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "en,hi,bn,ta,te,mr,gu,pa,ur", autoDisplay: false, layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, "google_translate_element")`
   (keep a small set of relevant Indian languages + English; the owner can adjust the list later.)
   - Put the required hidden `<div id="google_translate_element">` somewhere in the layout (visually hidden).
2. **Custom on-brand dropdown** — build a small language `<select>`/dropdown styled like the site (place it in the header, desktop + mobile menu). When the user picks a language, drive the hidden Google combo (`.goog-te-combo`) / set the `googtrans` cookie so the page translates. Show the current language. English = reset to original.
3. **Hide Google's default UI with CSS** (scoped, additive — append to globals.css, don't edit existing rules):
   - Hide the banner/iframe: `.goog-te-banner-frame { display:none !important; }`, `.skiptranslate { display:none !important; }` (the top bar), and force `body { top:0 !important; }` so the page doesn't get pushed down.
   - Hide the Google tooltip/highlight and "Powered by" where it interferes.
   - Keep the hidden `#google_translate_element` off-screen.
4. **React safety:** add `suppressHydrationWarning` where the translated DOM would otherwise trip hydration (e.g. on `<body>` / the main content wrapper), and only init the widget after mount. Don't server-render any translated state.
5. **Placement:** a clean globe/language icon + current-language label in the header (and inside the mobile menu), matching existing nav styling.

## 2. Acceptance criteria
- A visitor can pick a language from an **on-brand dropdown** and the page translates (Google Translate), with **no Google banner** pushing the layout and **no visible Google chrome** — the design looks unchanged except for the new switcher.
- Switching back to English restores the original.
- **No existing feature/UI/CSS/API/SEO regression**; server-rendered HTML + metadata unchanged; crawlers still see English.
- Works in light + dark mode, desktop + mobile; no React hydration errors. Additive only.

## Note (for the owner, not a task)
This widget translates only in the visitor's browser — it does NOT create indexable translated pages, so other-language versions won't rank in search (that would need full i18n with separate URLs + hreflang, a much larger project). This is fine for a quick on-site translator and causes no SEO harm.
