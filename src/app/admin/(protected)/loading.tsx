/**
 * Admin loading skeleton for any route inside `(protected)`.
 *
 * Implementation note: because this `loading.tsx` lives *inside* the
 * protected layout, Next.js renders the layout (real sidebar + topbar) AROUND
 * this Suspense fallback. So we only skeleton the page-content area to avoid
 * visually duplicating the chrome. The spec asked for sidebar/topbar
 * placeholders too — those would only make sense at `src/app/admin/loading.tsx`
 * (one level up). Easy to move if preferred.
 */

const bar = "rounded-md bg-slate-200 animate-pulse";

function HeaderSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div className={bar} style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className={bar} style={{ height: 14, width: 280 }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className={bar} style={{ height: 36, width: 110 }} />
        <div className={bar} style={{ height: 36, width: 140 }} />
      </div>
    </div>
  );
}

function TableSkeleton() {
  const ROWS = 8;
  const COLS = 4;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--c-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 14,
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div className={bar} style={{ height: 36, width: 280, borderRadius: 8 }} />
        <div style={{ flex: 1 }} />
        <div className={bar} style={{ height: 36, width: 110, borderRadius: 8 }} />
      </div>

      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 16,
          padding: "12px 16px",
          background: "var(--c-bg-section)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        {Array.from({ length: COLS }).map((_, i) => (
          <div key={`h-${i}`} className={bar} style={{ height: 12, width: "60%" }} />
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: ROWS }).map((_, r) => (
        <div
          key={`r-${r}`}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 16,
            padding: "16px",
            borderBottom: r === ROWS - 1 ? "0" : "1px solid var(--c-border)",
            alignItems: "center",
          }}
        >
          {Array.from({ length: COLS }).map((_, c) => (
            <div
              key={`r-${r}-c-${c}`}
              className={bar}
              style={{
                height: 14,
                width: c === 0 ? "85%" : c === COLS - 1 ? "40%" : `${60 + (r % 3) * 10}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="animate-fade-in">
      <HeaderSkeleton />
      <TableSkeleton />
    </div>
  );
}
