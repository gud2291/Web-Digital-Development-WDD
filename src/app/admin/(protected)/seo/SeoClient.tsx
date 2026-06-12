"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminApi } from "@/lib/adminApi";

interface SeoMetaItem {
  _id?: string;
  pageSlug: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonical: string;
  noIndex: boolean;
}

interface Props {
  initial: SeoMetaItem[];
}

const SUGGESTED_SLUGS = [
  "home",
  "about",
  "services",
  "projects",
  "blog",
  "contact",
  "reviews",
  "sitemap",
];

export function SeoClient({ initial }: Props) {
  const [items, setItems] = React.useState(initial);
  const [editing, setEditing] = React.useState<SeoMetaItem | null>(null);
  const [deleting, setDeleting] = React.useState<SeoMetaItem | null>(null);
  const [busy, setBusy] = React.useState(false);

  const save = async (item: SeoMetaItem) => {
    setBusy(true);
    try {
      const saved = await adminApi.put<SeoMetaItem>("/api/admin/seo", item);
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.pageSlug === saved.pageSlug);
        return idx >= 0 ? prev.map((p) => (p.pageSlug === saved.pageSlug ? saved : p)) : [saved, ...prev];
      });
      toast.success("Saved");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/seo/${encodeURIComponent(deleting.pageSlug)}`);
      setItems((p) => p.filter((m) => m.pageSlug !== deleting.pageSlug));
      toast.success("Deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <Btn
          type="button"
          onClick={() =>
            setEditing({
              pageSlug: "",
              title: "",
              description: "",
              keywords: [],
              ogImage: "",
              canonical: "",
              noIndex: false,
            })
          }
        >
          <Icon name="plus" size={14} /> New SEO entry
        </Btn>
        <div style={{ marginTop: 12 }}>
          <div className="t-small" style={{ marginBottom: 6 }}>Suggested page slugs:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SUGGESTED_SLUGS.map((s) => (
              <button
                key={s}
                type="button"
                className="badge badge--neutral"
                style={{ border: "1px solid var(--c-border)", cursor: "pointer" }}
                onClick={() =>
                  setEditing(
                    items.find((i) => i.pageSlug === s) ?? {
                      pageSlug: s,
                      title: "",
                      description: "",
                      keywords: [],
                      ogImage: "",
                      canonical: "",
                      noIndex: false,
                    }
                  )
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-table-wrap">
        {items.length === 0 ? (
          <div className="admin-table-empty">No SEO entries yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page slug</th>
                <th>Title</th>
                <th style={{ width: 100 }}>Index</th>
                <th style={{ width: 140 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.pageSlug}>
                  <td><code>{m.pageSlug}</code></td>
                  <td>{m.title || <span className="t-small">—</span>}</td>
                  <td>{m.noIndex ? <span className="admin-status admin-status--hidden">noindex</span> : "—"}</td>
                  <td className="admin-table-actions">
                    <button type="button" className="admin-icon-btn" onClick={() => setEditing(m)}>
                      <Icon name="code" size={12} /> Edit
                    </button>
                    <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => setDeleting(m)}>
                      <Icon name="x" size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <SeoEditModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={save}
          busy={busy}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete SEO entry?"
        message={deleting ? `Delete SEO for "${deleting.pageSlug}"?` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

function SeoEditModal({
  initial,
  onClose,
  onSave,
  busy,
}: {
  initial: SeoMetaItem;
  onClose: () => void;
  onSave: (item: SeoMetaItem) => void;
  busy: boolean;
}) {
  const [item, setItem] = React.useState(initial);
  const [keywords, setKeywords] = React.useState((initial.keywords ?? []).join(", "));

  const onChange = <K extends keyof SeoMetaItem>(k: K, v: SeoMetaItem[K]) =>
    setItem((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--lg" onClick={(e) => e.stopPropagation()}>
        <h3>{initial._id || initial.pageSlug ? `Edit SEO — ${initial.pageSlug || "new"}` : "New SEO entry"}</h3>
        <div className="admin-modal__body" style={{ display: "grid", gap: 14 }}>
          <div className="field">
            <label className="field__label">Page slug *</label>
            <input
              className="input"
              placeholder="home, about, services/website-design …"
              value={item.pageSlug}
              onChange={(e) => onChange("pageSlug", e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label">Title</label>
            <input className="input" value={item.title} onChange={(e) => onChange("title", e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Description</label>
            <textarea
              className="textarea"
              value={item.description}
              onChange={(e) => onChange("description", e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>
          <div className="field">
            <label className="field__label">Keywords (comma-separated)</label>
            <input className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <ImageUploader
            value={item.ogImage}
            onChange={(url) => onChange("ogImage", url)}
            label="OG image"
          />
          <div className="field">
            <label className="field__label">Canonical URL</label>
            <input className="input" value={item.canonical} onChange={(e) => onChange("canonical", e.target.value)} />
          </div>
          <label className="admin-form-checkbox">
            <input type="checkbox" checked={item.noIndex} onChange={(e) => onChange("noIndex", e.target.checked)} />
            <span>noindex (block search engines)</span>
          </label>
        </div>
        <div className="admin-modal__actions">
          <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
          <Btn
            type="button"
            disabled={busy || !item.pageSlug.trim()}
            onClick={() =>
              onSave({
                ...item,
                keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
              })
            }
          >
            {busy ? "Saving…" : "Save entry"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
