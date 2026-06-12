"use client";

import * as React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { CommandPalette } from "./CommandPalette";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface Props {
  children: React.ReactNode;
  /** Live badge counts surfaced in the sidebar/topbar (e.g. unread inquiries). */
  unreadInquiries?: number;
}

export function AdminShell({ children, unreadInquiries }: Props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  useKeyboardShortcuts({ onShowHelp: () => setHelpOpen(true) });

  return (
    <div className="admin-layout" data-admin>
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        badges={{ inquiries: unreadInquiries }}
      />
      <div className="admin-main">
        <AdminTopBar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          onOpenPalette={() => setPaletteOpen(true)}
          unread={unreadInquiries}
        />
        <div className="admin-content">{children}</div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
