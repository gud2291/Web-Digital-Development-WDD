"use client";

import * as React from "react";
import { Monitor, Tablet, Smartphone, PanelLeft, Columns2, Eye } from "lucide-react";

type Mode = "edit" | "split" | "preview";
type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, number> = { desktop: 1280, tablet: 768, mobile: 375 };
const SPLIT_KEY = "wdd-preview-split";
const DEFAULT_SPLIT = 45; // % width of the editor pane
const MIN_SPLIT = 28;
const MAX_SPLIT = 72;

interface Props {
  /** Preview resource key, e.g. "blog" (must match the API + page resource). */
  resource: string;
  /** Public path to render, e.g. `/blog/my-post`. */
  previewPath: string;
  /** Current (watched) form state — drives the debounced draft POST. */
  state: unknown;
  /**
   * Optional anchor (element id on the public page). When set, the preview
   * scrolls to & highlights that section — used by the section-card editors.
   */
  sectionAnchor?: string;
  /** The editor / form UI. */
  children: React.ReactNode;
}

/**
 * §1 — full-height split-pane live preview. Left = editor, right = an iframe of
 * the public page rendering the unsaved draft (in-memory or Redis store —
 * always available). Debounced 400ms draft POST, Edit/Split/Preview toggle,
 * drag-resizable divider (persisted), viewport selector, mobile tabs, and a
 * cleanup DELETE of the draft on unmount.
 */
export function LivePreview({ resource, previewPath, state, sectionAnchor, children }: Props) {
  const [mode, setMode] = React.useState<Mode>("split");
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [iframeUrl, setIframeUrl] = React.useState<string | null>(null);
  const [isNarrow, setIsNarrow] = React.useState(false);
  const [split, setSplit] = React.useState(DEFAULT_SPLIT);
  const draftIdRef = React.useRef<string | null>(null);
  const tokenRef = React.useRef<string | null>(null);
  const panesRef = React.useRef<HTMLDivElement>(null);
  const anchorRef = React.useRef<string | undefined>(sectionAnchor);
  anchorRef.current = sectionAnchor;

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    try {
      const stored = Number(localStorage.getItem(SPLIT_KEY));
      if (stored >= MIN_SPLIT && stored <= MAX_SPLIT) setSplit(stored);
    } catch {
      /* ignore */
    }
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Point the iframe at the draft-mode enable route, which validates the token,
  // turns on Next.js draft mode (httpOnly cookie), and redirects to the public
  // path — which then renders the draft. The token (not the draftId) carries the
  // draft identity, and the `t` param forces the iframe to reload on each edit.
  const buildUrl = React.useCallback(
    (token: string) => {
      const hash = anchorRef.current ? `#${anchorRef.current}` : "";
      const target = `${previewPath}${hash}`;
      return `/api/preview/enable?token=${encodeURIComponent(token)}&path=${encodeURIComponent(target)}&t=${Date.now()}`;
    },
    [previewPath]
  );

  const stateJson = JSON.stringify(state);

  // Debounced draft POST → updated iframe URL.
  React.useEffect(() => {
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/preview/${resource}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftId: draftIdRef.current, state }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { draftId?: string; token?: string };
        if (!data.draftId || !data.token) return;
        draftIdRef.current = data.draftId;
        tokenRef.current = data.token;
        setIframeUrl(buildUrl(data.token));
      } catch {
        /* network errors are non-fatal */
      }
    }, 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateJson, resource, previewPath]);

  // Scroll the preview to the focused section without waiting for a new draft.
  React.useEffect(() => {
    if (sectionAnchor && draftIdRef.current && tokenRef.current) {
      setIframeUrl(buildUrl(tokenRef.current));
    }
  }, [sectionAnchor, buildUrl]);

  // Invalidate the draft when leaving the editor.
  React.useEffect(() => {
    return () => {
      if (draftIdRef.current) {
        fetch(`/api/admin/preview/${resource}?draftId=${draftIdRef.current}`, {
          method: "DELETE",
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [resource]);

  // §1 — draggable divider.
  const onDividerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const panes = panesRef.current;
    if (!panes) return;
    const rect = panes.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, Math.round(pct))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setSplit((s) => {
        try {
          localStorage.setItem(SPLIT_KEY, String(s));
        } catch {
          /* ignore */
        }
        return s;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const effectiveMode: Mode = isNarrow ? (mode === "split" ? "edit" : mode) : mode;
  const showEditor = effectiveMode !== "preview";
  const showPreview = effectiveMode !== "edit";
  const isSplit = effectiveMode === "split" && !isNarrow;

  const iframe = iframeUrl ? (
    <iframe
      key={viewport}
      title="Live preview"
      src={iframeUrl}
      className="livepreview__iframe"
      style={{ width: isNarrow ? "100%" : VIEWPORT_WIDTH[viewport], maxWidth: "100%" }}
    />
  ) : (
    <div className="livepreview__disabled">
      <Eye size={22} />
      <p>Preparing preview…</p>
    </div>
  );

  return (
    <div className="livepreview">
      <div className="livepreview__bar">
        {isNarrow ? (
          <div className="livepreview__tabs">
            <button type="button" className={mode !== "preview" ? "is-active" : ""} onClick={() => setMode("edit")}>
              Edit
            </button>
            <button type="button" className={mode === "preview" ? "is-active" : ""} onClick={() => setMode("preview")}>
              Preview
            </button>
          </div>
        ) : (
          <div className="livepreview__seg">
            <button type="button" title="Edit only" className={mode === "edit" ? "is-active" : ""} onClick={() => setMode("edit")}>
              <PanelLeft size={15} /> Edit
            </button>
            <button type="button" title="Split" className={mode === "split" ? "is-active" : ""} onClick={() => setMode("split")}>
              <Columns2 size={15} /> Split
            </button>
            <button type="button" title="Preview only" className={mode === "preview" ? "is-active" : ""} onClick={() => setMode("preview")}>
              <Eye size={15} /> Preview
            </button>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {showPreview && !isNarrow ? (
          <div className="livepreview__seg">
            <button type="button" title="Desktop" className={viewport === "desktop" ? "is-active" : ""} onClick={() => setViewport("desktop")}>
              <Monitor size={15} />
            </button>
            <button type="button" title="Tablet" className={viewport === "tablet" ? "is-active" : ""} onClick={() => setViewport("tablet")}>
              <Tablet size={15} />
            </button>
            <button type="button" title="Mobile" className={viewport === "mobile" ? "is-active" : ""} onClick={() => setViewport("mobile")}>
              <Smartphone size={15} />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={panesRef}
        className={`livepreview__panes livepreview__panes--${effectiveMode}`}
        style={isSplit ? { gridTemplateColumns: `minmax(320px, ${split}%) 10px minmax(360px, 1fr)` } : undefined}
      >
        {showEditor ? <div className="livepreview__editor">{children}</div> : null}
        {isSplit ? (
          <div
            className="livepreview__divider"
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize"
            onPointerDown={onDividerDown}
          />
        ) : null}
        {showPreview ? <div className="livepreview__preview">{iframe}</div> : null}
      </div>
    </div>
  );
}
