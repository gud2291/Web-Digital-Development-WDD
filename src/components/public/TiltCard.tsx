"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Subtle 3D tilt wrapper (CLAUDE.md §12.7) for service + project cards. The card
 * rotates up to ±`max` degrees toward the cursor and springs back on leave.
 * Desktop-only: disabled on touch pointers and under prefers-reduced-motion
 * (renders a plain <div> so layout is unchanged).
 */
export function TiltCard({
  children,
  className,
  style,
  max = 2,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  max?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  // §14.5 — slower, heavier spring return (less playful).
  const springX = useSpring(rotateX, { stiffness: 90, damping: 18, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 90, damping: 18, mass: 0.6 });

  React.useEffect(() => {
    if (reduceMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
  }, [reduceMotion]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1..1
    const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1..1
    rotateY.set(px * max);
    rotateX.set(py * -max);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  if (!enabled) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        ...style,
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}
