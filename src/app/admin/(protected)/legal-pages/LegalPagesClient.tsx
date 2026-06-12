"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { LivePreview } from "@/components/admin/LivePreview";
import { adminApi } from "@/lib/adminApi";

type Slug = "privacy-policy" | "terms" | "refund";

interface LegalDoc {
  slug: Slug;
  title: string;
  content: string;
  lastUpdated?: string;
}

const SLUG_LABEL: Record<Slug, string> = {
  "privacy-policy": "Privacy Policy",
  terms: "Terms of Service",
  refund: "Refund Policy",
};

interface Props {
  initial: LegalDoc[];
}

export function LegalPagesClient({ initial }: Props) {
  const [active, setActive] = React.useState<Slug>("privacy-policy");
  const byslug = React.useMemo(() => new Map(initial.map((d) => [d.slug, d])), [initial]);

  const initialFor = (s: Slug) => byslug.get(s) ?? { slug: s, title: SLUG_LABEL[s], content: "" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 18 }}>
      <div className="admin-card" style={{ padding: 8 }}>
        {(Object.keys(SLUG_LABEL) as Slug[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className="admin-sidebar__link"
            style={{
              width: "100%",
              color: active === s ? "#fff" : "var(--c-text)",
              background: active === s ? "var(--c-primary-600)" : "transparent",
            }}
          >
            {SLUG_LABEL[s]}
          </button>
        ))}
      </div>
      <LegalEditor key={active} doc={initialFor(active)} />
    </div>
  );
}

function LegalEditor({ doc }: { doc: LegalDoc }) {
  const [title, setTitle] = React.useState(doc.title);
  const [content, setContent] = React.useState(doc.content);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.put("/api/admin/legal-pages", { slug: doc.slug, title, content });
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LivePreview
      resource="legal"
      previewPath={`/legal/${doc.slug}`}
      state={{ slug: doc.slug, title, content, lastUpdated: new Date().toISOString() }}
    >
      <div className="admin-card">
        <div className="field">
          <label className="field__label">Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Content</label>
          <TipTapEditor value={content} onChange={setContent} placeholder="Write the legal copy…" />
        </div>
        {doc.lastUpdated && (
          <p className="t-small" style={{ marginTop: 10, fontSize: 12 }}>
            Last updated: {new Date(doc.lastUpdated).toLocaleString("en-IN")}
          </p>
        )}
        <div style={{ marginTop: 14 }}>
          <Btn type="button" iconRight="arrowRight" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save page"}
          </Btn>
        </div>
      </div>
    </LivePreview>
  );
}
