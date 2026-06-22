"use client";

import * as React from "react";

/**
 * On-brand language switcher backed by the free Google Translate Element.
 *
 * - `GoogleTranslateInit` injects the Google script client-side after mount and
 *   renders the required (visually-hidden) #google_translate_element. Google's
 *   default banner/iframe/tooltip are hidden via scoped CSS in globals.css.
 * - `LanguageSwitcher` is a custom dropdown (globe + current language) that
 *   drives the hidden `.goog-te-combo` and sets the `googtrans` cookie so the
 *   translation persists. English clears the cookie and restores the original.
 *
 * Everything runs in the browser only — server-rendered HTML + metadata stay in
 * English, so crawlers are unaffected.
 */

// Top international languages (correct Google Translate codes).
const INCLUDED = "en,es,fr,de,pt,ru,zh-CN,ja,ar,hi";

export interface LangOption {
  code: string;
  native: string;
  en: string;
}

const LANGS: LangOption[] = [
  { code: "en", native: "English", en: "English" },
  { code: "es", native: "Español", en: "Spanish" },
  { code: "fr", native: "Français", en: "French" },
  { code: "de", native: "Deutsch", en: "German" },
  { code: "pt", native: "Português", en: "Portuguese" },
  { code: "ru", native: "Русский", en: "Russian" },
  { code: "zh-CN", native: "中文", en: "Chinese" },
  { code: "ja", native: "日本語", en: "Japanese" },
  { code: "ar", native: "العربية", en: "Arabic" },
  { code: "hi", native: "हिन्दी", en: "Hindi" },
];

// ---- cookie + translation helpers (client-only) ---------------------------

function setGoogTransCookie(code: string) {
  const val = `/en/${code}`;
  document.cookie = `googtrans=${val};path=/`;
  const host = window.location.hostname;
  if (host.split(".").length > 1) {
    document.cookie = `googtrans=${val};path=/;domain=${host}`;
    document.cookie = `googtrans=${val};path=/;domain=.${host}`;
  }
}

function clearGoogTransCookie() {
  const past = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=;expires=${past};path=/`;
  const host = window.location.hostname;
  if (host.split(".").length > 1) {
    document.cookie = `googtrans=;expires=${past};path=/;domain=${host}`;
    document.cookie = `googtrans=;expires=${past};path=/;domain=.${host}`;
  }
}

function currentLangFromCookie(): string {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "en";
}

function applyLanguage(code: string) {
  if (code === "en") {
    // Cleanest, most reliable reset: drop the cookie and reload to the original.
    clearGoogTransCookie();
    window.location.reload();
    return;
  }
  // Persist the choice so it survives reloads / is read on widget init.
  setGoogTransCookie(code);

  // The Google combo may not exist yet (script still loading) — poll for it,
  // then drive it with a BUBBLING change event so Google's handler fires.
  const start = Date.now();
  const TIMEOUT_MS = 3000;
  const tick = () => {
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    if (Date.now() - start < TIMEOUT_MS) {
      window.setTimeout(tick, 150);
    } else {
      // Widget never appeared — reload; the cookie is applied on init.
      window.location.reload();
    }
  };
  tick();
}

// ---- Google Translate loader + hidden element ------------------------------

interface TranslateElementCtor {
  new (
    cfg: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean; layout: number },
    el: string
  ): unknown;
  InlineLayout: { SIMPLE: number };
}
interface GoogleTranslateWindow {
  googleTranslateElementInit?: () => void;
  google?: { translate?: { TranslateElement?: TranslateElementCtor } };
}

export function GoogleTranslateInit() {
  React.useEffect(() => {
    const w = window as unknown as GoogleTranslateWindow;

    // Builds the hidden widget (which creates the .goog-te-combo we drive).
    const init = () => {
      const TE = w.google?.translate?.TranslateElement;
      const el = document.getElementById("google_translate_element");
      if (!TE || !el) return;
      if (el.querySelector(".goog-te-combo")) return; // already initialised
      // eslint-disable-next-line no-new
      new TE(
        { pageLanguage: "en", includedLanguages: INCLUDED, autoDisplay: false, layout: TE.InlineLayout.SIMPLE },
        "google_translate_element"
      );
    };
    w.googleTranslateElementInit = init;

    // If the script is already loaded (e.g. client-side remount), init directly.
    if (w.google?.translate?.TranslateElement) {
      init();
      return;
    }

    // Otherwise inject the loader once; its ?cb= calls googleTranslateElementInit.
    if (!document.getElementById("google-translate-script")) {
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return <div id="google_translate_element" aria-hidden suppressHydrationWarning />;
}

// ---- icons ----------------------------------------------------------------

function GlobeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transition: "transform var(--dur-base, 200ms) ease", transform: open ? "rotate(180deg)" : "none" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ---- the on-brand switcher ------------------------------------------------

export function LanguageSwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState("en");
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Read the active language only after mount (keeps SSR/first paint = English).
  React.useEffect(() => {
    setLang(currentLangFromCookie());
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  const choose = (code: string) => {
    setOpen(false);
    if (code === lang) return;
    setLang(code);
    applyLanguage(code);
  };

  return (
    <div className={`lang-switcher lang-switcher--${variant}`} ref={ref}>
      <button
        type="button"
        className="lang-switcher__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        {/* `notranslate` so Google never re-labels the switcher itself */}
        <span className="notranslate" translate="no">{current.native}</span>
        <ChevIcon open={open} />
      </button>

      {open && (
        <div className="lang-switcher__menu" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={l.code === lang}
              className={`lang-switcher__item notranslate ${l.code === lang ? "lang-switcher__item--active" : ""}`}
              translate="no"
              onClick={() => choose(l.code)}
            >
              <span>{l.native}</span>
              <span className="lang-switcher__item-en">{l.en}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
