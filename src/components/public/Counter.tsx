"use client";

import * as React from "react";
import { useInView, animate, useReducedMotion } from "framer-motion";

/**
 * Animated stat counter (CLAUDE.md §12.2). Counts from 0 to the parsed number
 * once, the first time it enters the viewport. Preserves any suffix ("+", "K").
 * Values it can't cleanly count up (e.g. "24×7", "24/7") just render as-is.
 * Respects prefers-reduced-motion.
 */
export function Counter({ value, durationMs = 900 }: { value: string; durationMs?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = React.useState<string>(value);

  React.useEffect(() => {
    if (!inView) return;

    const match = value.match(/^([\d][\d.,]*)(.*)$/s);
    // Skip the count-up for values that aren't a single number + suffix
    // (e.g. "24×7", "24/7") or when the user prefers reduced motion.
    const complex = /[×x/]/.test(value) || (match ? /\d/.test(match[2]) : false);
    if (reduceMotion || complex || !match) {
      setDisplay(value);
      return;
    }

    const numStr = match[1].replace(/,/g, "");
    const target = Number(numStr);
    const suffix = match[2];
    const decimals = numStr.includes(".") ? numStr.split(".")[1]?.length ?? 0 : 0;
    if (Number.isNaN(target)) {
      setDisplay(value);
      return;
    }

    setDisplay(`0${suffix}`);
    const controls = animate(0, target, {
      duration: durationMs / 1000,
      ease: "easeOut",
      onUpdate: (latest: number) => setDisplay(`${latest.toFixed(decimals)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, value, reduceMotion, durationMs]);

  return <span ref={ref}>{display}</span>;
}
