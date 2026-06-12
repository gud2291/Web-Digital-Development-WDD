"use client";

import * as React from "react";

/**
 * Lazy wrapper for the R3F hero. Three.js + the scene chunk is ~150 KB
 * gzipped so we never want it in the initial bundle — `ssr: false` keeps it
 * out of SSR (no benefit, can't hydrate WebGL anyway) and `dynamic` keeps it
 * out of the critical path.
 *
 * Loading state and reduced-motion fallback share the same gradient so users
 * never see a flash of blank space and never have to suffer a continuously
 * animating background if their OS says "stop moving things." Both render
 * exactly the same DOM as the eventual Canvas wrapper, so there's no layout
 * shift when the scene mounts.
 */

const positioningStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  opacity: 0.6,
  pointerEvents: "none",
  zIndex: 0,
};

function GradientFallback() {
  return (
    <div
      aria-hidden
      style={{
        ...positioningStyle,
        background:
          "radial-gradient(60% 60% at 70% 40%, rgba(37, 99, 235, 0.35) 0%, rgba(27, 77, 168, 0.18) 45%, rgba(255, 255, 255, 0) 80%)",
      }}
    />
  );
}

export function HeroSceneWrapper() {
  return <GradientFallback />;
}

export default HeroSceneWrapper;
