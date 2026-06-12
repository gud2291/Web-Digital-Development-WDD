"use client";

import * as React from "react";

/**
 * Light/dark theme toggle (CLAUDE.md §13.4). Adds/removes `dark` class on
 * <html>, persists to localStorage (`wdd-theme`). First-visit default follows
 * prefers-color-scheme (applied pre-paint by the inline script in the root
 * layout, so there's no FOUC).
 */
const KEY = "wdd-theme";

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    // §14.3 — keep the data-theme attribute in sync with the class.
    if (next) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  // Avoid hydration mismatch: render a stable placeholder until mounted.
  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={mounted ? dark : undefined}
    >
      {mounted && dark ? (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
