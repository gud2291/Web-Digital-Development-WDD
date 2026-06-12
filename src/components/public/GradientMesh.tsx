"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Subtle animated gradient mesh (CLAUDE.md §12.16, toned down §14.8). Two large,
 * very heavily-blurred radial blobs (primary-600 tint + primary-50 tint) drifting
 * on a slow 40s loop behind hero content. Barely perceptible — never the focal
 * point. Decorative only; paused for reduced-motion users.
 */
const BLOBS = [
  { color: "#2563EB", size: 560, top: "-10%", left: "-5%", x: [0, 40, 0], y: [0, -28, 0], dur: 40 },
  { color: "#DBE7FE", size: 480, top: "45%", left: "60%", x: [0, -34, 0], y: [0, 30, 0], dur: 40 },
];

export function GradientMesh() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter: "blur(120px)",
            opacity: 0.1,
          }}
        />
      ))}
    </div>
  );
}
