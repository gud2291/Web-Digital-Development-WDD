"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Thin reading-progress bar pinned to the top of the viewport (14.5). It is
 * mounted globally in the public layout but only renders on individual blog
 * posts (`/blog/[slug]`), never on the `/blog` listing or any other page.
 *
 * Note: the sticky site header is z-index 100, so the bar uses z-index 110 to
 * stay visible on top of it (the spec's "50" would be hidden behind the header).
 */
export function ReadingProgressBar() {
  const pathname = usePathname() || "";
  const isBlogPost = /^\/blog\/[^/]+$/.test(pathname);
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    if (!isBlogPost) return;
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setPct(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isBlogPost]);

  if (!isBlogPost) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 4,
        width: `${pct}%`,
        background: "#2563EB",
        zIndex: 110,
        transition: "width 0.1s linear",
        willChange: "width",
      }}
    />
  );
}
