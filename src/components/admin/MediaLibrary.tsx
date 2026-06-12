"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Eye, Pencil, Trash2, Copy, X } from "lucide-react";
import { Btn } from "@/components/ui";
import { adminApi } from "@/lib/adminApi";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { MediaUploader, type MediaItem } from "@/components/admin/MediaUploader";

type FilterKey = "all" | "images" | "videos" | "recent" | "month";
type SortKey = "newest" | "oldest" | "size" | "name";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "images", label: "Images" },
  { key: "videos", label: "Videos" },
  { key: "recent", label: "Recent" },
  { key: "month", label: "This Month" },
];

function bytes(n: number): string {
  if (!n) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

const isVideo = (m: MediaItem) => (m.mimeType || "").startsWith("video/");

export function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const confirm = useConfirm();
  const [items, setItems] = React.useState<MediaItem[]>(initial);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [detail, setDetail] = React.useState<MediaItem | null>(null);
  const [altDraft, setAltDraft] = React.useState("");

  const openDetail = (m: MediaItem) => {
    setDetail(m);
    setAltDraft(m.alt ?? "");
  };

  const visible = React.useMemo(() => {
    const now = Date.now();
    const monthNow = new Date();
    let list = items.filter((m) => m.filename.toLowerCase().includes(query.trim().toLowerCase()));
    list = list.filter((m) => {
      switch (filter) {
        case "images":
          return !isVideo(m);
        case "videos":
          return isVideo(m);
        case "recent":
          return now - new Date(m.createdAt).getTime() <= 7 * 86400000;
        case "month": {
          const d = new Date(m.createdAt);
          return d.getMonth() === monthNow.getMonth() && d.getFullYear() === monthNow.getFullYear();
        }
        default:
          return true;
      }
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "size":
          return b.size - a.size;
        case "name":
          return a.filename.localeCompare(b.filename);
        default:
          return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
    return list;
  }, [items, query, filter, sort]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const removeItem = async (m: MediaItem) => {
    const ok = await confirm({
      title: "Delete file?",
      message: `Delete "${m.filename}"? It will be removed from Cloudinary too.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await adminApi.delete(`/api/admin/media/${m._id}`);
      setItems((p) => p.filter((x) => x._id !== m._id));
      if (detail?._id === m._id) setDetail(null);
      toast.success("Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const saveAlt = async () => {
    if (!detail) return;
    try {
      await adminApi.patch(`/api/admin/media/${detail._id}`, { alt: altDraft });
      setItems((p) => p.map((x) => (x._id === detail._id ? { ...x, alt: altDraft } : x)));
      setDetail((d) => (d ? { ...d, alt: altDraft } : d));
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <MediaUploader onUploaded={(doc) => setItems((p) => [doc, ...p])} />
      </div>

      <div className="admin-card" style={{ padding: 14, marginBottom: 18 }}>
        <div className="media-toolbar">
          <input
            className="input"
            placeholder="Search filename…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <div className="media-chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`pill ${filter === f.key ? "pill--active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <label className="t-small" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Sort
            <select
              className="select"
              style={{ height: 36, width: 130 }}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="size">Size</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="admin-card">
          <EmptyState title="No media found" description="Upload a file or adjust your filters." />
        </div>
      ) : (
        <div className="media-grid">
          {visible.map((m) => (
            <div key={m._id} className="media-tile media-tile--lib">
              {isVideo(m) ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={m.url} muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt || m.filename} />
              )}
              <div className="media-tile__overlay">
                <button type="button" title="View" onClick={() => openDetail(m)}>
                  <Eye size={15} />
                </button>
                <button type="button" title="Edit alt text" onClick={() => openDetail(m)}>
                  <Pencil size={15} />
                </button>
                <button type="button" title="Delete" onClick={() => removeItem(m)}>
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="media-tile__meta">
                <span className="media-tile__name">{m.filename}</span>
                <span className="media-tile__hover">
                  {bytes(m.size)} · {m.width}×{m.height}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Right detail drawer */}
      {detail ? (
        <div className="media-drawer-overlay" onClick={() => setDetail(null)}>
          <aside className="media-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="media-drawer__head">
              <h3>File details</h3>
              <button type="button" className="admin-icon-btn" onClick={() => setDetail(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="media-drawer__preview">
              {isVideo(detail) ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={detail.url} controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detail.url} alt={detail.alt || detail.filename} />
              )}
            </div>
            <dl className="media-drawer__meta">
              <Meta label="Filename" value={detail.filename} />
              <Meta label="Type" value={detail.mimeType || "—"} />
              <Meta label="Size" value={bytes(detail.size)} />
              <Meta label="Dimensions" value={`${detail.width} × ${detail.height}`} />
              <Meta label="Uploaded" value={new Date(detail.createdAt).toLocaleString("en-IN")} />
            </dl>
            <div className="field">
              <label className="field__label">URL</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" readOnly value={detail.url} />
                <Btn size="sm" variant="secondary" type="button" onClick={() => copy(detail.url)}>
                  <Copy size={14} /> Copy
                </Btn>
              </div>
            </div>
            <div className="field">
              <label className="field__label">Alt text</label>
              <input
                className="input"
                value={altDraft}
                onChange={(e) => setAltDraft(e.target.value)}
                placeholder="Describe the image for accessibility & SEO"
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn size="sm" type="button" onClick={saveAlt} disabled={altDraft === (detail.alt ?? "")}>
                Save
              </Btn>
              <Btn size="sm" variant="ghost" type="button" onClick={() => removeItem(detail)} style={{ color: "#DC2626" }}>
                <Trash2 size={14} /> Delete
              </Btn>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="media-drawer__metarow">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
