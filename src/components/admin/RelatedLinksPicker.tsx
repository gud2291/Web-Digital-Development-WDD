"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";

export interface RelatedOption {
  title: string;
  slug: string;
}

/**
 * §INTERNAL-LINKING (Part B) — admin "Related pages / Internal links" picker.
 * A searchable checkbox-list: shows each item's title, stores its slug. Used in
 * BlogForm/ServiceForm/ProjectForm to pick related Services/Blogs. Controlled —
 * value is `string[]` of slugs, onChange returns the updated array. Reuses the
 * existing admin form styling (field, input, admin-form-checkbox).
 */
export function RelatedLinksPicker({
  label,
  help,
  options,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  options: RelatedOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = React.useState("");
  const selected = React.useMemo(() => new Set(value), [value]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.title.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q)
    );
  }, [options, query]);

  const toggle = (slug: string) => {
    if (selected.has(slug)) onChange(value.filter((s) => s !== slug));
    else onChange([...value, slug]);
  };

  return (
    <div className="field" style={{ marginTop: 14 }}>
      <label className="field__label">{label}</label>
      {help && (
        <span className="admin-form-help" style={{ display: "block", marginBottom: 8 }}>
          {help}
        </span>
      )}
      {options.length === 0 ? (
        <span className="t-small">Nothing to link to yet.</span>
      ) : (
        <>
          {options.length > 6 && (
            <input
              className="input"
              placeholder="Filter…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ marginBottom: 8 }}
            />
          )}
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              border: "1px solid var(--c-border)",
              borderRadius: 10,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {filtered.length === 0 ? (
              <span className="t-small" style={{ padding: 6 }}>
                No matches.
              </span>
            ) : (
              filtered.map((o) => (
                <label
                  key={o.slug}
                  className="admin-form-checkbox"
                  style={{ padding: "6px 6px", borderRadius: 8 }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(o.slug)}
                    onChange={() => toggle(o.slug)}
                  />
                  <span>{o.title}</span>
                </label>
              ))
            )}
          </div>
          {value.length > 0 && (
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}
            >
              {value.map((slug) => {
                const opt = options.find((o) => o.slug === slug);
                return (
                  <span
                    key={slug}
                    className="pill"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--c-bg-section, #EFF6FF)",
                      padding: "4px 10px",
                      borderRadius: 40,
                      fontSize: 13,
                    }}
                  >
                    {opt?.title ?? slug}
                    <button
                      type="button"
                      aria-label={`Remove ${opt?.title ?? slug}`}
                      onClick={() => toggle(slug)}
                      style={{
                        display: "inline-flex",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "inherit",
                      }}
                    >
                      <Icon name="x" size={11} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
