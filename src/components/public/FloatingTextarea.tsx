"use client";

import * as React from "react";

/**
 * Floating-label textarea (CLAUDE.md §12.13). react-hook-form compatible —
 * see FloatingInput for the spread pattern.
 */
interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, id, name, ...rest }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || name || generatedId;
    return (
      <div className={`floating-field floating-field--textarea ${error ? "floating-field--error" : ""}`}>
        <textarea
          id={fieldId}
          name={name}
          ref={ref}
          placeholder=" "
          className="floating-field__control floating-field__control--textarea"
          {...rest}
        />
        <label htmlFor={fieldId} className="floating-field__label">
          {label}
        </label>
        {error && <span className="floating-field__err">{error}</span>}
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";
