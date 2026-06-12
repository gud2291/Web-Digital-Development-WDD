"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { adminApi } from "@/lib/adminApi";

interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  filename: string;
}

interface Props {
  open: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaLibraryModal({ open, onSelect, onClose }: Props) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [selected, setSelected] = React.useState<string>("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.get<{ items: MediaItem[] }>("/api/admin/media?limit=80");
      setItems(data.items ?? []);
    } catch {
      toast.error("Could not load media");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      setSelected("");
      void load();
    }
  }, [open, load]);

  if (!open) return null;

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      await load();
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="admin-modal admin-modal--lg" onClick={(e) => e.stopPropagation()}>
        <h3>Media Library</h3>
        <div className="admin-modal__body">
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
            <Btn size="sm" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload new"}
            </Btn>
          </div>
          {loading ? (
            <p className="t-small">Loading…</p>
          ) : items.length === 0 ? (
            <p className="t-small">No media yet.</p>
          ) : (
            <div className="media-grid" style={{ maxHeight: 420, overflowY: "auto" }}>
              {items.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  className={`media-tile ${selected === m.url ? "media-tile__selected" : ""}`}
                  onClick={() => setSelected(m.url)}
                  title={m.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.filename} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="admin-modal__actions">
          <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
          <Btn
            type="button"
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onSelect(selected);
                onClose();
              }
            }}
          >
            Use selected
          </Btn>
        </div>
      </div>
    </div>
  );
}
