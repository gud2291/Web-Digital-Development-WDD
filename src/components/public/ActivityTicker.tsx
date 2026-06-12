"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/Icon";

/**
 * Subtle live-activity ticker (CLAUDE.md §13.3). Pulls anonymised recent
 * inquiries from /api/public/activity-feed and shows one bubble at a time,
 * bottom-left: visible 6s, next one ~25s after the last appeared. Dismissable
 * (hidden for the rest of the session). Desktop-only to avoid mobile clutter.
 */
interface Activity {
  name: string;
  city: string;
  action: string;
}

const DISMISS_KEY = "wdd-activity-dismissed";

export function ActivityTicker() {
  const [items, setItems] = React.useState<Activity[]>([]);
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setEnabled(true);
    fetch("/api/public/activity-feed")
      .then((r) => r.json())
      .then((d: { items: Activity[] }) => setItems(d.items ?? []))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!enabled || items.length === 0) return;
    let hideTimer: number;
    const show = () => {
      setVisible(true);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        setIndex((i) => (i + 1) % items.length);
      }, 6000);
    };
    const first = window.setTimeout(show, 4000); // initial delay
    const cycle = window.setInterval(show, 25000); // next appears every 25s
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(hideTimer);
      window.clearInterval(cycle);
    };
  }, [enabled, items.length]);

  const dismiss = () => {
    setVisible(false);
    setEnabled(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!enabled || items.length === 0) return null;
  const current = items[index];

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="activity-ticker"
        >
          <span className="activity-ticker__dot" />
          <div className="activity-ticker__text">
            <strong>{current.name}</strong> from {current.city}
            <br />
            <span>{current.action}</span>
          </div>
          <button type="button" className="activity-ticker__close" onClick={dismiss} aria-label="Dismiss">
            <Icon name="x" size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
