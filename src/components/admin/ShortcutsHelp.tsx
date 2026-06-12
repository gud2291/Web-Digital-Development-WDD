"use client";

import * as React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const GROUPS: { heading: string; items: [string, string][] }[] = [
  {
    heading: "General",
    items: [
      ["⌘ / Ctrl + K", "Open command palette"],
      ["⌘ / Ctrl + S", "Save current form"],
      ["⌘ / Ctrl + N", "New (current section)"],
      ["?", "Show this help"],
      ["Esc", "Close modal / cancel edit"],
    ],
  },
  {
    heading: "Go to (press g, then…)",
    items: [
      ["g d", "Dashboard"],
      ["g b", "Blog Manager"],
      ["g p", "Projects"],
      ["g s", "Services"],
      ["g i", "Inquiries"],
      ["g m", "Media"],
      ["g t", "Team"],
    ],
  },
];

/** §15.11 — keyboard shortcuts help (opened with `?`). */
export function ShortcutsHelp({ open, onClose }: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Keyboard shortcuts</h3>
        <div className="admin-modal__body" style={{ display: "grid", gap: 18 }}>
          {GROUPS.map((g) => (
            <div key={g.heading}>
              <div className="t-small" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
                {g.heading}
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {g.items.map(([keys, label]) => (
                  <div key={keys} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14 }}>{label}</span>
                    <kbd className="admin-kbd">{keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
