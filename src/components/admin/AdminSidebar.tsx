"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icon, type IconName } from "@/components/Icon";

type Area = "content" | "media" | "seo" | "chatbot" | "inbox" | "system";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  area: Area;
  badgeKey?: BadgeKey;
}

type BadgeKey = "inquiries";

// §2 — flat nav, colour-coded by area (blue=content, green=media, purple=SEO, amber=chatbot).
const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "layers", area: "system" },
  { label: "Inquiries", href: "/admin/inquiries", icon: "mail", area: "inbox", badgeKey: "inquiries" },
  { label: "Pages", href: "/admin/pages", icon: "layers", area: "content" },
  { label: "Blog Manager", href: "/admin/blog", icon: "file", area: "content" },
  { label: "Projects", href: "/admin/projects", icon: "award", area: "content" },
  { label: "Services", href: "/admin/services", icon: "monitor", area: "content" },
  { label: "Team", href: "/admin/team", icon: "users", area: "content" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "heart", area: "content" },
  { label: "Homepage", href: "/admin/homepage", icon: "home", area: "content" },
  { label: "Site Content", href: "/admin/site-content", icon: "code", area: "content" },
  { label: "Legal Pages", href: "/admin/legal-pages", icon: "shield", area: "content" },
  { label: "Media", href: "/admin/media", icon: "download", area: "media" },
  { label: "SEO", href: "/admin/seo", icon: "search", area: "seo" },
  { label: "Newsletter", href: "/admin/newsletter", icon: "megaphone", area: "inbox" },
  { label: "Chatbot", href: "/admin/chatbot", icon: "chat", area: "chatbot" },
  { label: "Settings", href: "/admin/settings", icon: "filter", area: "system" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  badges?: Partial<Record<BadgeKey, number>>;
}

export function AdminSidebar({ open, onClose, badges }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const name = session?.user?.name || session?.user?.email || "Admin User";
  const role = session?.user?.role || "Super Admin";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <aside
        className={open ? "admin-sidebar admin-sidebar--open" : "admin-sidebar"}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__brand">
          <Image src="/assets/logo.png" alt="Web Digital Development" width={116} height={34} priority />
          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-title">Admin Panel</span>
            <span className="admin-sidebar__brand-sub">Management Portal</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
            const count = item.badgeKey ? badges?.[item.badgeKey] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                data-area={item.area}
                className={
                  isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"
                }
              >
                <Icon name={item.icon} size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {count && count > 0 ? (
                  <span className="admin-sidebar__count">{count > 99 ? "99+" : count}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <Link href="/admin/projects/new" onClick={onClose} className="admin-sidebar__cta">
          <Icon name="plus" size={16} />
          New Project
        </Link>

        <div className="admin-sidebar__user">
          <span className="avatar" style={{ width: 38, height: 38, fontSize: 13, background: "#1B4DA8" }}>
            {initials}
          </span>
          <div className="admin-sidebar__user-text">
            <span className="admin-sidebar__user-name">{name}</span>
            <span className="admin-sidebar__user-role">{roleLabel}</span>
          </div>
        </div>
      </aside>
      {open && <div className="admin-sidebar__overlay" onClick={onClose} aria-hidden />}
    </>
  );
}
