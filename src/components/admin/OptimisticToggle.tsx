"use client";

import * as React from "react";
import toast from "react-hot-toast";

interface Props {
  checked: boolean;
  /** Async persist handler. Throw to trigger a rollback + error toast. */
  onToggle: (next: boolean) => Promise<void>;
  /** Optional success toast text, e.g. "Published" / "Hidden". */
  successText?: (next: boolean) => string;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * §15.8 — visibility / published switch that flips immediately (optimistic),
 * then rolls back and shows an error toast if the server rejects.
 */
export function OptimisticToggle({ checked, onToggle, successText, disabled, ...rest }: Props) {
  const [state, setState] = React.useState(checked);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setState(checked);
  }, [checked]);

  const flip = async () => {
    if (busy || disabled) return;
    const next = !state;
    setState(next); // optimistic
    setBusy(true);
    try {
      await onToggle(next);
      if (successText) toast.success(successText(next));
    } catch (err) {
      setState(!next); // rollback
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={state}
      aria-label={rest["aria-label"]}
      onClick={flip}
      disabled={busy || disabled}
      className={`admin-switch ${state ? "admin-switch--on" : ""}`}
    >
      <span className="admin-switch__knob" />
    </button>
  );
}
