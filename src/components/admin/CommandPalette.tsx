"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Plus,
  Upload,
  FileText,
  FolderKanban,
  Wrench,
  Users,
  MessageSquareQuote,
  type LucideIcon,
} from "lucide-react";
import type { AdminSearchItem } from "@/types/admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_ACTIONS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Add New Blog", href: "/admin/blog/new", icon: Plus },
  { label: "Add New Project", href: "/admin/projects/new", icon: Plus },
  { label: "Add New Service", href: "/admin/services/new", icon: Plus },
  { label: "Upload Media", href: "/admin/media", icon: Upload },
];

const TYPE_ICON: Record<AdminSearchItem["type"], LucideIcon> = {
  Blog: FileText,
  Project: FolderKanban,
  Service: Wrench,
  Team: Users,
  Testimonial: MessageSquareQuote,
};

/**
 * §15.1 — Cmd+K / Ctrl+K spotlight palette. Quick-actions at the top + fuzzy
 * search across every editable resource (cmdk handles the fuzzy match). Enter
 * navigates to the resource's edit page.
 */
export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [items, setItems] = React.useState<AdminSearchItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  // Global shortcut.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Lazy-load resources the first time the palette opens.
  React.useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;
    fetch("/api/admin/search")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: AdminSearchItem[] }) => {
        if (!cancelled) {
          setItems(d.items ?? []);
          setLoaded(true);
        }
      })
      .catch(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  if (!open) return null;

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <div className="admin-cmdk-overlay" onClick={() => onOpenChange(false)}>
      <div className="admin-cmdk" onClick={(e) => e.stopPropagation()}>
        <Command label="Admin command palette" loop>
          <div className="admin-cmdk__search">
            <Search size={16} aria-hidden />
            <Command.Input autoFocus placeholder="Search posts, projects, services…" />
            <kbd className="admin-cmdk__kbd">Esc</kbd>
          </div>
          <Command.List>
            <Command.Empty className="admin-cmdk__empty">No results found.</Command.Empty>

            <Command.Group heading="Quick actions">
              {QUICK_ACTIONS.map((a) => {
                const Glyph = a.icon;
                return (
                  <Command.Item key={a.href} value={`action ${a.label}`} onSelect={() => go(a.href)}>
                    <span className="admin-cmdk__icon admin-cmdk__icon--accent">
                      <Glyph size={15} />
                    </span>
                    {a.label}
                  </Command.Item>
                );
              })}
            </Command.Group>

            {items.length > 0 ? (
              <Command.Group heading="Jump to">
                {items.map((it) => {
                  const Glyph = TYPE_ICON[it.type];
                  return (
                    <Command.Item
                      key={`${it.type}-${it.id}`}
                      value={`${it.type} ${it.label}`}
                      onSelect={() => go(it.href)}
                    >
                      <span className="admin-cmdk__icon">
                        <Glyph size={15} />
                      </span>
                      <span className="admin-cmdk__label">{it.label}</span>
                      <span className="admin-cmdk__type">{it.type}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ) : null}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
