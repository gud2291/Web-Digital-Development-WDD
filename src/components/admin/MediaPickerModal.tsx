"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { adminApi } from "@/lib/adminApi";
import { MediaUploader, type MediaItem } from "@/components/admin/MediaUploader";

interface Props {
  open: boolean;
  mode?: "single" | "multi";
  onSelect: (urls: string[]) => void;
  onClose: () => void;
}

/**
 * §15.4 — pick existing Cloudinary media (or upload a new one) and return the
 * URL(s). Single or multi-select. Used by ImageUploader and the TipTap editor.
 */
export function MediaPickerModal({ open, mode = "single", onSelect, onClose }: Props) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.get<{ items: MediaItem[] }>("/api/admin/media?limit=200");
      setItems(data.items ?? []);
    } catch {
      toast.error("Could not load media");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      setSelected([]);
      setQuery("");
      void load();
    }
  }, [open, load]);

  if (!open) return null;

  const toggle = (url: string) =>
    setSelected((s) =>
      mode === "single" ? [url] : s.includes(url) ? s.filter((u) => u !== url) : [...s, url]
    );

  const filtered = items.filter((m) => m.filename.toLowerCase().includes(query.trim().toLowerCase()));
  const isVideo = (m: MediaItem) => (m.mimeType || "").startsWith("video/");

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="admin-modal admin-modal--lg" onClick={(e) => e.stopPropagation()}>
        <h3>Media Library</h3>
        <div className="admin-modal__body">
          <MediaUploader compact onUploaded={(doc) => setItems((p) => [doc, ...p])} />
          <input
            className="input"
            placeholder="Search filename…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ margin: "14px 0" }}
          />
          {loading ? (
            <p className="t-small">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="t-small">No media found.</p>
          ) : (
            <div className="media-grid media-grid--picker" style={{ maxHeight: 380, overflowY: "auto" }}>
              {filtered.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  className={`media-tile ${selected.includes(m.url) ? "media-tile__selected" : ""}`}
                  onClick={() => toggle(m.url)}
                  title={m.filename}
                >
                  {isVideo(m) ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={m.url} muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.alt || m.filename} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="admin-modal__actions">
          <Btn variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            type="button"
            disabled={selected.length === 0}
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
          >
            {mode === "multi" && selected.length > 1 ? `Use ${selected.length} selected` : "Use selected"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
