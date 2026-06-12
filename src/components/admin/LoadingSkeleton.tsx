"use client";

import * as React from "react";

type Variant = "card" | "row" | "chart" | "stat" | "text" | "table";

interface Props {
  variant?: Variant;
  /** How many skeleton elements to render (rows/cards/lines). */
  count?: number;
  /** Optional explicit height (px) for card/chart variants. */
  height?: number;
  className?: string;
}

/**
 * §15.7 — shimmer placeholders used while admin data is fetching. Variants:
 * card / row / chart / stat / text / table. Pure CSS pulse (see globals.css
 * `.admin-skel`).
 */
export function LoadingSkeleton({ variant = "card", count = 1, height, className }: Props) {
  const items = Array.from({ length: Math.max(1, count) });

  if (variant === "row" || variant === "table") {
    return (
      <div className={`admin-skel-rows ${className ?? ""}`.trim()}>
        {items.map((_, i) => (
          <div key={i} className="admin-skel admin-skel--row" />
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div
        className={`admin-skel admin-skel--chart ${className ?? ""}`.trim()}
        style={height ? { height } : undefined}
      />
    );
  }

  if (variant === "stat") {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className="admin-skel admin-skel--stat" />
        ))}
      </>
    );
  }

  if (variant === "text") {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className="admin-skel admin-skel--text" />
        ))}
      </>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`admin-skel admin-skel--card ${className ?? ""}`.trim()}
          style={height ? { height } : undefined}
        />
      ))}
    </>
  );
}
