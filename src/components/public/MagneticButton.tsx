"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Magnetic CTA wrapper (CLAUDE.md §14.17 — parent-area gating). The button is
 * wrapped in a 14px-padded "activation area"; the button only attracts while the
 * cursor is inside that area (its bounding box IS the trigger zone — no
 * window-level listener, no distance hack). On leave it snaps back to (0,0).
 * Disabled on touch and under prefers-reduced-motion.
 */
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** How strongly the button follows the cursor (0–1). */
  strength?: number;
}

export function MagneticButton({ children, className, style, strength = 0.15 }: MagneticButtonProps) {
  const btnRef = React.useRef<HTMLDivElement>(null);
  const tracking = React.useRef(false);
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Snappy spring back to centre.
  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  React.useEffect(() => {
    if (reduceMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
  }, [reduceMotion]);

  if (!enabled) {
    return (
      <span className={className} style={{ display: "inline-block", ...style }}>
        {children}
      </span>
    );
  }

  const onEnter = () => {
    tracking.current = true;
  };
  const onLeave = () => {
    tracking.current = false;
    x.set(0);
    y.set(0);
  };
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tracking.current) return;
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  return (
    <div
      className="magnetic-area"
      style={{ padding: "14px", display: "inline-block", position: "relative" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      <motion.div ref={btnRef} className={className} style={{ display: "inline-block", ...style, x: springX, y: springY }}>
        {children}
      </motion.div>
    </div>
  );
}
