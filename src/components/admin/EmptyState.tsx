"use client";

import * as React from "react";
import { Inbox, type LucideIcon } from "lucide-react";

interface Props {
  /** lucide icon component (defaults to an inbox). */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary CTA — typically a <Link><Btn/></Link>. */
  action?: React.ReactNode;
}

/**
 * §15.7 — friendly empty state for lists with zero items. Icon + heading +
 * description + optional primary CTA.
 */
export function EmptyState({ icon: Glyph = Inbox, title, description, action }: Props) {
  return (
    <div className="admin-empty">
      <div className="admin-empty__icon">
        <Glyph size={26} strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="admin-empty__title">{title}</h3>
      {description ? <p className="admin-empty__desc">{description}</p> : null}
      {action ? <div className="admin-empty__action">{action}</div> : null}
    </div>
  );
}
