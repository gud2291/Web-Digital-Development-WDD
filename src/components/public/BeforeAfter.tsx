"use client";

import * as React from "react";
import { CldImage } from "@/components/CldImage";

/**
 * Before/after drag-comparison slider (CLAUDE.md §13.2). The "after" image sits
 * underneath; the "before" image is clipped to the handle position on top.
 * Mouse + touch drag.
 */
export function BeforeAfter({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const [pos, setPos] = React.useState(50);

  const setFromX = React.useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  }, []);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => dragging.current && setFromX(e.clientX);
    const onTouch = (e: TouchEvent) => {
      if (dragging.current && e.touches[0]) setFromX(e.touches[0].clientX);
    };
    const stop = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", stop);
    };
  }, [setFromX]);

  return (
    <div
      ref={ref}
      className="before-after"
      onMouseDown={(e) => {
        dragging.current = true;
        setFromX(e.clientX);
      }}
      onTouchStart={(e) => {
        dragging.current = true;
        if (e.touches[0]) setFromX(e.touches[0].clientX);
      }}
      role="slider"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Before / after comparison"
    >
      <CldImage src={after} alt={afterLabel} fill sizes="(max-width: 980px) 100vw, 980px" className="before-after__img" draggable={false} />
      <span className="before-after__badge before-after__badge--after">{afterLabel}</span>
      <div className="before-after__clip" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <CldImage src={before} alt={beforeLabel} fill sizes="(max-width: 980px) 100vw, 980px" className="before-after__img" draggable={false} />
        <span className="before-after__badge before-after__badge--before">{beforeLabel}</span>
      </div>
      <div className="before-after__handle" style={{ left: `${pos}%` }}>
        <div className="before-after__grip">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 6 15 12 9 18" transform="translate(0,0)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
