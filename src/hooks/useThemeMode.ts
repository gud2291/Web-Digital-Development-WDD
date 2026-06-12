"use client";

import * as React from "react";

/**
 * §14.18 — reactive theme mode ("light" | "dark") read from the `data-theme`
 * attribute on <html>. Updates when the attribute flips, so charts and other
 * JS-driven colours can follow the toggle.
 */
export function useThemeMode(): "light" | "dark" {
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const read = () =>
      setMode(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => obs.disconnect();
  }, []);

  return mode;
}
