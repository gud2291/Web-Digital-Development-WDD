"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminApi } from "@/lib/adminApi";

interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  filename: string;
  width: number;
  height: number;
  size: number;
}

interface Props {
  initial: MediaItem[];
}

function bytes(n: number): string {
  if (!n) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function MediaClient({ initial }: Props) {
  const [items, setItems] = React.useState(initial);
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState<MediaItem | null>(null);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const doc = (await res.json()) as MediaItem;
      setItems((prev) => [doc, ...prev]);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/media/${deleting._id}`);
      setItems((p) => p.filter((m) => m._id !== deleting._id));
      toast.success("Deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Btn type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload file"}
          </Btn>
          <span className="t-small">{items.length} items</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-table-empty">No media yet — upload one to get started.</div>
      ) : (
        <div className="media-grid">
          {items.map((m) => (
            <div key={m._id} className="media-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.filename} title={m.filename} />
              <button
                type="button"
                className="media-tile__del"
                onClick={() => setDeleting(m)}
                title="Delete"
              >
                <Icon name="x" size={12} />
              </button>
              <button
                type="button"
                className="media-tile__del"
                style={{ right: 38, display: "inline-flex" }}
                onClick={() => copy(m.url)}
                title="Copy URL"
              >
                <Icon name="download" size={12} />
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "6px 8px",
                  background: "rgba(0,0,0,.55)",
                  color: "#fff",
                  fontSize: 10,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                  {m.filename}
                </span>
                <span>{bytes(m.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete file?"
        message={deleting ? `Delete "${deleting.filename}"? It will be removed from Cloudinary too.` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
