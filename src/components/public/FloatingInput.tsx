"use client";

import * as React from "react";

/**
 * Material-style floating-label input (CLAUDE.md §12.13). Works with
 * react-hook-form: spread `{...register("field")}` onto it — the returned `ref`
 * is forwarded and `name`/`onChange`/`onBlur` flow through `...rest`.
 */
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, id, name, ...rest }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || name || generatedId;
    return (
      <div className={`floating-field ${error ? "floating-field--error" : ""}`}>
        <input
          id={fieldId}
          name={name}
          ref={ref}
          placeholder=" "
          className="floating-field__control"
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
FloatingInput.displayName = "FloatingInput";
