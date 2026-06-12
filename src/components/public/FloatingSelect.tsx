"use client";

import * as React from "react";

/**
 * Floating-label select (CLAUDE.md §12.13). A select always has a value, so the
 * label sits in its raised position permanently (`floating-field--select`).
 * react-hook-form compatible — see FloatingInput for the spread pattern.
 */
interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
}

export const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, error, options, id, name, ...rest }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || name || generatedId;
    return (
      <div className={`floating-field floating-field--select ${error ? "floating-field--error" : ""}`}>
        <select id={fieldId} name={name} ref={ref} className="floating-field__control" {...rest}>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <label htmlFor={fieldId} className="floating-field__label">
          {label}
        </label>
        {error && <span className="floating-field__err">{error}</span>}
      </div>
    );
  }
);
FloatingSelect.displayName = "FloatingSelect";
