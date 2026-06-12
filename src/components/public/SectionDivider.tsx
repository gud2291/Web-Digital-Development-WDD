/**
 * SVG wave divider between two adjacent sections (CLAUDE.md §12.15). The block's
 * background is the section above (`from`); the wave path is filled with the
 * section below (`to`), so it reads as a smooth transition regardless of the
 * page background. `flip` mirrors the curve for variety. Self-contained, no JS.
 */
const WHITE = "#ffffff";
const SURFACE = "#F7F9FC";

// §14.3 — map the page surface hexes to theme tokens so dividers flip in dark
// mode (otherwise white/F7F9FC wave bands leak between dark sections).
const TOKEN: Record<string, string> = {
  "#ffffff": "var(--c-bg)",
  "#fff": "var(--c-bg)",
  "#f7f9fc": "var(--c-bg-section)",
};
function themed(color: string): string {
  return TOKEN[color.toLowerCase()] ?? color;
}

export function SectionDivider({
  from = WHITE,
  to = SURFACE,
  flip = false,
}: {
  from?: string;
  to?: string;
  flip?: boolean;
}) {
  return (
    <div aria-hidden="true" style={{ background: themed(from), lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{
          display: "block",
          width: "100%",
          height: "clamp(36px, 5vw, 72px)",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      >
        <path
          d="M0,34 C320,82 560,2 760,30 C960,58 1180,14 1440,46 L1440,80 L0,80 Z"
          style={{ fill: themed(to) }}
        />
      </svg>
    </div>
  );
}
