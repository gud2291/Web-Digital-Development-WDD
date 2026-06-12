"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

interface Opts {
  /** Open the shortcuts help modal (bound to `?`). */
  onShowHelp: () => void;
}

// `g` then <key> → navigate.
const GO_MAP: Record<string, string> = {
  d: "/admin/dashboard",
  b: "/admin/blog",
  p: "/admin/projects",
  s: "/admin/services",
  i: "/admin/inquiries",
  m: "/admin/media",
  t: "/admin/team",
};

// Ctrl/Cmd+N → context-aware "new" route, keyed off the section segment.
const NEW_MAP: Record<string, string> = {
  blog: "/admin/blog/new",
  projects: "/admin/projects/new",
  services: "/admin/services/new",
  team: "/admin/team/new",
  testimonials: "/admin/testimonials/new",
};

/**
 * §15.11 — global admin keyboard shortcuts. Cmd/Ctrl+K is owned by the command
 * palette; this hook adds Cmd/Ctrl+S (save form), Cmd/Ctrl+N (new resource),
 * `?` (help), and the vim-style `g <key>` navigation.
 */
export function useKeyboardShortcuts({ onShowHelp }: Opts) {
  const router = useRouter();
  const lastG = React.useRef(0);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+S → submit the current admin form.
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.querySelector<HTMLFormElement>(".admin-content form")?.requestSubmit();
        return;
      }

      // Ctrl/Cmd+N → create a new resource based on the current section.
      if (mod && e.key.toLowerCase() === "n") {
        const seg = window.location.pathname.split("/")[2];
        const dest = seg ? NEW_MAP[seg] : undefined;
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      // The remaining shortcuts must not fire while typing or with modifiers.
      if (typing || mod) return;

      if (e.key === "?") {
        e.preventDefault();
        onShowHelp();
        return;
      }

      const now = Date.now();
      if (e.key === "g") {
        lastG.current = now;
        return;
      }
      if (now - lastG.current < 800 && GO_MAP[e.key]) {
        lastG.current = 0;
        router.push(GO_MAP[e.key]);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, onShowHelp]);
}
