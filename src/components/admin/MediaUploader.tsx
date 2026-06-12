"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";

export interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  createdAt: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm";
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];
const IMAGE_MAX = 10 * 1024 * 1024;
const VIDEO_MAX = 50 * 1024 * 1024;

interface UploadTask {
  id: string;
  name: string;
  pct: number;
  error?: string;
}

function uploadFile(file: File, onProgress: (pct: number) => void): Promise<MediaItem> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as MediaItem);
        } catch {
          reject(new Error("Malformed server response"));
        }
      } else {
        let msg = "Upload failed";
        try {
          msg = JSON.parse(xhr.responseText).error || msg;
        } catch {
          /* keep default */
        }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

interface Props {
  onUploaded: (doc: MediaItem) => void;
  /** Compact variant used inside the picker modal. */
  compact?: boolean;
}

/**
 * §15.4 — big dashed drop zone. Multi-file drag-drop or click-to-browse,
 * per-file progress bar, client-side type + size validation, auto-Cloudinary
 * upload via the existing upload route (which records a Media doc).
 */
export function MediaUploader({ onUploaded, compact }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = React.useState(false);
  const [tasks, setTasks] = React.useState<UploadTask[]>([]);

  const handleFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported type`);
        continue;
      }
      const isVideo = file.type.startsWith("video/");
      const max = isVideo ? VIDEO_MAX : IMAGE_MAX;
      if (file.size > max) {
        toast.error(`${file.name}: exceeds ${isVideo ? "50MB" : "10MB"} limit`);
        continue;
      }
      const taskId = `${file.name}-${Date.now()}-${Math.random()}`;
      setTasks((t) => [...t, { id: taskId, name: file.name, pct: 0 }]);
      try {
        const doc = await uploadFile(file, (pct) =>
          setTasks((t) => t.map((x) => (x.id === taskId ? { ...x, pct } : x)))
        );
        onUploaded(doc);
        setTasks((t) => t.filter((x) => x.id !== taskId));
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        setTasks((t) =>
          t.map((x) => (x.id === taskId ? { ...x, error: err instanceof Error ? err.message : "failed" } : x))
        );
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    }
  };

  return (
    <div
      className={`media-drop ${compact ? "media-drop--compact" : ""} ${dragover ? "media-drop--over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragover(true);
      }}
      onDragLeave={() => setDragover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragover(false);
        if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <UploadCloud size={compact ? 22 : 30} aria-hidden />
      <div className="media-drop__title">Drag &amp; drop images or videos here, or click to browse</div>
      {!compact ? (
        <div className="media-drop__hint">JPG · PNG · WebP · GIF · SVG up to 10MB &nbsp;·&nbsp; MP4 · WebM up to 50MB</div>
      ) : null}

      {tasks.length > 0 ? (
        <div className="media-drop__tasks" onClick={(e) => e.stopPropagation()}>
          {tasks.map((t) => (
            <div key={t.id} className="media-task">
              <span className="media-task__name">{t.name}</span>
              {t.error ? (
                <span className="media-task__err">{t.error}</span>
              ) : (
                <span className="media-task__bar">
                  <span style={{ width: `${t.pct}%` }} />
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
