"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, ChevronDown, User, KeyRound, LogOut, Menu } from "lucide-react";
import { AdminThemeToggle } from "./AdminThemeToggle";

interface Props {
  onMenuClick: () => void;
  onOpenPalette: () => void;
  /** Unread inquiry count — drives the red dot on the bell. */
  unread?: number;
}

export function AdminTopBar({ onMenuClick, onOpenPalette, unread = 0 }: Props) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-admin-user-menu]")) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  const name = session?.user?.name || session?.user?.email || "Admin";
  const role = session?.user?.role || "Super Admin";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="admin-topbar">
      <button
        type="button"
        onClick={onMenuClick}
        className="admin-topbar__menu"
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      <button type="button" className="admin-topbar__search" onClick={onOpenPalette}>
        <Search size={16} />
        <span className="admin-topbar__search-text">Search anything…</span>
        <kbd className="admin-topbar__kbd">⌘K</kbd>
      </button>

      <div style={{ flex: 1 }} />

      <AdminThemeToggle />

      <Link href="/admin/inquiries" className="admin-topbar__bell" aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 ? <span className="admin-topbar__bell-dot" aria-hidden /> : null}
      </Link>

      <div className="admin-topbar__user" data-admin-user-menu>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="admin-topbar__user-pill"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: "#1B4DA8" }}>
            {initials}
          </span>
          <span className="admin-topbar__user-pill-text">
            <span className="admin-topbar__user-pill-name">{name}</span>
            <span className="admin-topbar__user-pill-role">{roleLabel}</span>
          </span>
          <ChevronDown size={14} color="#64748B" />
        </button>
        {menuOpen && (
          <div className="admin-topbar__user-menu" role="menu">
            <div className="admin-topbar__user-menu-head">
              <div style={{ fontSize: 13, fontWeight: 600 }}>{session?.user?.name || name}</div>
              <div className="t-small" style={{ fontSize: 12 }}>{session?.user?.email}</div>
            </div>
            <Link href="/admin/settings" role="menuitem" className="admin-topbar__user-item" onClick={() => setMenuOpen(false)}>
              <User size={15} /> My Profile
            </Link>
            <Link href="/admin/settings" role="menuitem" className="admin-topbar__user-item" onClick={() => setMenuOpen(false)}>
              <KeyRound size={15} /> Change Password
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="admin-topbar__user-item admin-topbar__user-item--danger"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
