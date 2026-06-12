"use client";

import * as React from "react";
import { Btn } from "@/components/ui";

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel} role="dialog" aria-modal>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message ? (
          <div className="admin-modal__body" style={{ fontSize: 14, color: "var(--c-text-muted)", lineHeight: 1.6 }}>
            {message}
          </div>
        ) : null}
        <div className="admin-modal__actions">
          <Btn variant="ghost" type="button" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Btn>
          <Btn
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={destructive ? { background: "#DC2626" } : undefined}
          >
            {loading ? "Working…" : confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// §15.8 — imperative confirm() so call sites can do `if (await confirm({...}))`
// instead of native `window.confirm`. Mount <ConfirmProvider> once (in
// AdminProviders); call `const confirm = useConfirm()` anywhere beneath it.
// ───────────────────────────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    // Fallback to native confirm if a provider isn't mounted — keeps callers safe.
    return async (o) => (typeof window !== "undefined" ? window.confirm(o.message ?? o.title) : false);
  }
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{ opts: ConfirmOptions } | null>(null);
  const resolver = React.useRef<((v: boolean) => void) | null>(null);

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setState({ opts });
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!state}
        title={state?.opts.title ?? ""}
        message={state?.opts.message}
        confirmLabel={state?.opts.confirmLabel}
        cancelLabel={state?.opts.cancelLabel}
        destructive={state?.opts.destructive}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}
