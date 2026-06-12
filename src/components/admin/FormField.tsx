"use client";

import * as React from "react";

export type FieldVariant =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "image"
  | "richtext"
  | "toggle"
  | "date"
  | "number"
  | "color";

export type FieldValue = string | number | boolean | string[];

export interface FieldOption {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  variant?: FieldVariant;
  value?: FieldValue;
  onChange?: (value: FieldValue) => void;
  /** For select / multiselect. Accepts strings or {label,value}. */
  options?: (FieldOption | string)[];
  placeholder?: string;
  rows?: number;
  id?: string;
  name?: string;
  disabled?: boolean;
  /**
   * For `image` and `richtext` variants, pass the editor/uploader as children
   * (e.g. <ImageUploader/> or <TipTapEditor/>). FormField only renders the
   * label/hint/error chrome around it.
   */
  children?: React.ReactNode;
}

function normalizeOptions(options?: (FieldOption | string)[]): FieldOption[] {
  return (options ?? []).map((o) => (typeof o === "string" ? { label: o, value: o } : o));
}

/**
 * §15.7 — unified label + control + error + hint. One component for every form
 * field across the admin so spacing, error styling and labels stay consistent.
 */
export function FormField({
  label,
  hint,
  error,
  required,
  variant = "text",
  value,
  onChange,
  options,
  placeholder,
  rows = 4,
  id,
  name,
  disabled,
  children,
}: Props) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const opts = normalizeOptions(options);

  const control = (() => {
    switch (variant) {
      case "textarea":
        return (
          <textarea
            id={fieldId}
            name={name}
            className={`textarea ${error ? "input--err" : ""}`}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );
      case "select":
        return (
          <select
            id={fieldId}
            name={name}
            className={`select ${error ? "input--err" : ""}`}
            disabled={disabled}
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case "multiselect": {
        const selected = Array.isArray(value) ? value : [];
        const toggle = (v: string) =>
          onChange?.(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
        return (
          <div className="admin-multiselect">
            {opts.map((o) => (
              <button
                key={o.value}
                type="button"
                disabled={disabled}
                onClick={() => toggle(o.value)}
                className={`admin-chip ${selected.includes(o.value) ? "admin-chip--on" : ""}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        );
      }
      case "toggle":
        return (
          <button
            type="button"
            id={fieldId}
            role="switch"
            aria-checked={Boolean(value)}
            disabled={disabled}
            onClick={() => onChange?.(!value)}
            className={`admin-switch ${value ? "admin-switch--on" : ""}`}
          >
            <span className="admin-switch__knob" />
          </button>
        );
      case "number":
        return (
          <input
            id={fieldId}
            name={name}
            type="number"
            className={`input ${error ? "input--err" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => onChange?.(e.target.value === "" ? "" : Number(e.target.value))}
          />
        );
      case "date":
        return (
          <input
            id={fieldId}
            name={name}
            type="date"
            className={`input ${error ? "input--err" : ""}`}
            disabled={disabled}
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );
      case "color":
        return (
          <div className="admin-color-field">
            <input
              type="color"
              aria-label={label ?? "color"}
              disabled={disabled}
              value={String(value ?? "#2563EB")}
              onChange={(e) => onChange?.(e.target.value)}
            />
            <input
              type="text"
              className="input"
              disabled={disabled}
              value={String(value ?? "")}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder="#2563EB"
            />
          </div>
        );
      case "image":
      case "richtext":
        // Caller supplies the editor/uploader via children.
        return <>{children}</>;
      case "text":
      default:
        return (
          <input
            id={fieldId}
            name={name}
            type="text"
            className={`input ${error ? "input--err" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );
    }
  })();

  return (
    <div className="admin-field">
      {label ? (
        <label htmlFor={fieldId} className="admin-field__label">
          {label}
          {required ? <span className="admin-field__req"> *</span> : null}
        </label>
      ) : null}
      {control}
      {error ? (
        <div className="admin-field__err">{error}</div>
      ) : hint ? (
        <div className="admin-field__hint">{hint}</div>
      ) : null}
    </div>
  );
}
