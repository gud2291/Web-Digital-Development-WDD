"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * GDPR + Indian DPDP Act cookie consent, persisted to localStorage under
 * `wdd-cookie-consent`. A decision is valid for 12 months; after that the
 * banner re-appears. SSR-safe: nothing is read until after mount (`loaded`).
 */
export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  /** Unix ms when the choice was made. */
  decidedAt: number;
}

export const COOKIE_CONSENT_KEY = "wdd-cookie-consent";
const TWELVE_MONTHS_MS = 1000 * 60 * 60 * 24 * 365;

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CookieConsent;
        const fresh =
          parsed &&
          typeof parsed.decidedAt === "number" &&
          Date.now() - parsed.decidedAt < TWELVE_MONTHS_MS;
        if (fresh) setConsent(parsed);
      }
    } catch {
      // Corrupt value — treat as "no decision yet".
    }
    setLoaded(true);
  }, []);

  const save = useCallback((value: { analytics: boolean; marketing: boolean }) => {
    const next: CookieConsent = { ...value, decidedAt: Date.now() };
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked (private mode) — keep it in memory for this session.
    }
    setConsent(next);
  }, []);

  const acceptAll = useCallback(() => save({ analytics: true, marketing: true }), [save]);
  const declineAll = useCallback(() => save({ analytics: false, marketing: false }), [save]);

  return {
    /** Current stored consent, or null if no (valid) decision yet. */
    consent,
    /** True once localStorage has been read — render nothing until then. */
    loaded,
    /** Whether the user has made a (still-valid) choice. */
    decided: consent !== null,
    save,
    acceptAll,
    declineAll,
  };
}
