"use client";

import * as React from "react";
import { HONEYPOT_FIELD, ELAPSED_FIELD } from "@/config/antiSpam";

/**
 * 🛡️ Client half of the anti-bot guard (server half: `@/server/utils/spamGuard`).
 *
 * Gives a form two things a real browser session has and a script doesn't:
 *   • a honeypot input that is invisible to humans but irresistible to auto-fillers
 *   • how long the form was actually on screen before submit
 *
 * Usage:
 *   const { withShield, honeypotRef } = useSpamShield();
 *   <HoneypotField ref={honeypotRef} />
 *   fetch(url, { body: JSON.stringify(withShield(values)) })
 */
export function useSpamShield() {
  const mountedAt = React.useRef(Date.now());
  const honeypotRef = React.useRef<HTMLInputElement>(null);

  // Re-stamp on mount so the clock starts at hydration, not at SSR.
  React.useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const withShield = React.useCallback(<T extends object>(values: T) => {
    return {
      ...values,
      [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
      [ELAPSED_FIELD]: Date.now() - mountedAt.current,
    };
  }, []);

  return { withShield, honeypotRef };
}

/**
 * The honeypot input. Deliberately NOT `display: none` — the cheaper bots skip
 * hidden inputs, so this is pushed off-screen instead while staying "visible"
 * to anything parsing the DOM. Screen readers and keyboard users skip it via
 * `aria-hidden` + `tabIndex={-1}`.
 */
export const HoneypotField = React.forwardRef<HTMLInputElement>(function HoneypotField(_props, ref) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "auto",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
      <input
        ref={ref}
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
});
