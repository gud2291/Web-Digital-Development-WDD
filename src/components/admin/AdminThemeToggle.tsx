"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";

/**
 * §14.18 — admin light/dark toggle. Independent of the public site (own
 * localStorage key `wdd-admin-theme`). Default is LIGHT; OS preference is never
 * auto-applied. Flips `data-theme` + the `dark` class on <html>. On unmount it
 * restores the public preference so leaving the admin (client-side nav) doesn't
 * leak the admin theme onto the public site.
 */
const KEY = "wdd-admin-theme";

function applyTheme(theme: "light" | "dark") {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  el.classList.toggle("dark", theme === "dark");
}

export function AdminThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* ignore */
    }
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);

    return () => {
      let pub: string | null = null;
      try {
        pub = localStorage.getItem("wdd-theme");
      } catch {
        /* ignore */
      }
      applyTheme(pub === "dark" ? "dark" : "light");
    };
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="admin-theme-toggle"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={mounted ? theme === "dark" : undefined}
    >
      {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
