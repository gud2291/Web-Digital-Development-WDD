"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Upload, Images, X } from "lucide-react";
import { Btn } from "@/components/ui";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  /** What this field accepts — controls the file picker + preview player. */
  accept?: "image" | "video";
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

/**
 * §3 — the single media field used across the whole admin. Thumbnail / player
 * preview + Remove, "Upload New" (→ Cloudinary), "Choose from Library"
 * (MediaPickerModal), drag-drop onto the preview. No raw URL input — stored
 * values stay plain URL strings.
 */
export function ImageUploader({ value, onChange, label = "Image", accept = "image" }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [dragover, setDragover] = React.useState(false);

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
      const doc = (await res.json()) as { url: string };
      onChange(doc.url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <div className="image-uploader">
        <div
          className={`image-uploader__preview ${dragover ? "is-drag" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragover(true);
          }}
          onDragLeave={() => setDragover(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragover(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void upload(f);
          }}
        >
          {value ? (
            <>
              {accept === "video" || isVideoUrl(value) ? (
                <video src={value} controls muted preload="metadata" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="" />
              )}
              <button
                type="button"
                className="image-uploader__remove"
                onClick={() => onChange("")}
                aria-label="Remove"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <span className="image-uploader__empty">Drop {accept} here</span>
          )}
        </div>
        <div className="image-uploader__actions">
          <input
            ref={inputRef}
            type="file"
            accept={accept === "video" ? "video/mp4,video/webm" : "image/*"}
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn size="sm" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Upload size={14} /> {uploading ? "Uploading…" : "Upload New"}
            </Btn>
            <Btn size="sm" variant="secondary" type="button" onClick={() => setPickerOpen(true)}>
              <Images size={14} /> Choose from Library
            </Btn>
          </div>
        </div>
      </div>
      <MediaPickerModal
        open={pickerOpen}
        mode="single"
        onSelect={(urls) => {
          if (urls[0]) onChange(urls[0]);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
