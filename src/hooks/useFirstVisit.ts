"use client";

import * as React from "react";

const STORAGE_KEY = "wdd-loader-seen";

/**
 * Returns `true` exactly once per browser session (per tab) — when this hook
 * is mounted and `sessionStorage` does not already hold the seen flag.
 *
 * Call `markSeen()` after the consumer finishes its visual treatment so the
 * loader doesn't re-fire on internal route changes.
 *
 * Notes:
 *  - SSR-safe: returns `false` on the server (never blocks first paint),
 *    then re-evaluates on the client mount.
 *  - Privacy mode / disabled storage: try/catch swallows errors so the loader
 *    simply never shows, instead of crashing the page.
 */
export function useFirstVisit() {
  const [isFirst, setIsFirst] = React.useState(false);

  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.sessionStorage.getItem(STORAGE_KEY)) return;
      setIsFirst(true);
    } catch {
      // sessionStorage unavailable (e.g. strict privacy mode) — treat as repeat visit
    }
  }, []);

  const markSeen = React.useCallback(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — the loader has already played; nothing to do
    }
    setIsFirst(false);
  }, []);

  return { isFirst, markSeen };
}
