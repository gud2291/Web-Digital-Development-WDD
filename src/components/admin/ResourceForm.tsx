"use client";

import * as React from "react";
import { Btn } from "@/components/ui";

interface Props {
  /** Unique localStorage key for this resource's draft, e.g. `blog:new`. */
  storageKey: string;
  /** Current form values — serialized to localStorage on autosave. */
  values: unknown;
  /** When true, autosave + the beforeunload guard are active. */
  dirty?: boolean;
  submitting?: boolean;
  submitLabel?: string;
  /** Native form submit handler (e.g. RHF `handleSubmit(onValid)`). */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  /** Called when the user accepts the "Restore draft?" prompt. */
  onRestore?: (draft: unknown) => void;
  /** Extra actions rendered left of the submit button in the sticky footer. */
  secondaryActions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * §15.7 / §15.8 — generic form wrapper. Autosaves a draft to localStorage every
 * 10s while dirty, shows a save-status indicator, warns on unload of unsaved
 * changes (beforeunload), and offers to restore a found draft on mount. The
 * submit button is sticky at the bottom.
 */
export function ResourceForm({
  storageKey,
  values,
  dirty,
  submitting,
  submitLabel = "Save",
  onSubmit,
  onRestore,
  secondaryActions,
  children,
}: Props) {
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [draftFound, setDraftFound] = React.useState<unknown>(null);
  const key = `wdd-admin-draft:${storageKey}`;

  // On mount: detect an existing draft and offer to restore it.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw && onRestore) setDraftFound(JSON.parse(raw));
    } catch {
      /* ignore malformed drafts */
    }
    // Only on mount per storageKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Autosave every 10s while dirty.
  React.useEffect(() => {
    if (!dirty) return;
    const id = window.setInterval(() => {
      try {
        localStorage.setItem(key, JSON.stringify(values));
        setSavedAt(Date.now());
      } catch {
        /* quota / serialization issues are non-fatal */
      }
    }, 10000);
    return () => window.clearInterval(id);
  }, [dirty, values, key]);

  // Warn before leaving with unsaved changes.
  React.useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    clearDraft();
    onSubmit?.(e);
  };

  const statusText = savedAt
    ? `Draft saved · ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : dirty
      ? "Unsaved changes"
      : "All changes saved";

  return (
    <form className="admin-resource-form" onSubmit={handleSubmit}>
      {draftFound != null ? (
        <div className="admin-restore">
          <span>You have an unsaved draft for this item. Restore it?</span>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => {
              onRestore?.(draftFound);
              setDraftFound(null);
            }}
          >
            Restore
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => {
              clearDraft();
              setDraftFound(null);
            }}
          >
            Discard
          </button>
        </div>
      ) : null}

      {children}

      <div className="admin-form-sticky">
        <span className={`admin-save-status ${dirty ? "is-dirty" : ""}`}>{statusText}</span>
        <div style={{ flex: 1 }} />
        {secondaryActions}
        <Btn type="submit" disabled={submitting} iconRight="check">
          {submitting ? "Saving…" : submitLabel}
        </Btn>
      </div>
    </form>
  );
}
