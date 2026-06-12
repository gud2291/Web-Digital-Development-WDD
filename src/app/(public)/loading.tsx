/**
 * Public-route loading skeleton — rendered as the Suspense fallback for any
 * page inside `(public)`. Server Component so it ships zero JS.
 *
 * Note: the brief asked for a Framer Motion fade-in, but framer-motion is a
 * client-only library and the file is intentionally a Server Component (zero
 * JS, faster first paint, no hydration cost). Fade-in is therefore done via
 * the Tailwind `animate-fade-in` utility already wired in `tailwind.config.ts`.
 */

const skeletonBar = "rounded-md bg-slate-200 animate-pulse";

function CardSkeleton() {
  return (
    <div
      style={{
        background: "var(--c-bg)",
        border: "1px solid var(--c-border)",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div className={skeletonBar} style={{ height: 180, marginBottom: 18 }} />
      <div className={skeletonBar} style={{ height: 16, width: "55%", marginBottom: 10 }} />
      <div className={skeletonBar} style={{ height: 12, width: "85%", marginBottom: 6 }} />
      <div className={skeletonBar} style={{ height: 12, width: "70%" }} />
    </div>
  );
}

export default function PublicLoading() {
  return (
    <div className="animate-fade-in">
      {/* Header strip */}
      <div
        style={{
          height: 64,
          borderBottom: "1px solid var(--c-border)",
          background: "var(--c-bg)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 16,
        }}
      >
        <div className={skeletonBar} style={{ height: 30, width: 110 }} />
        <div style={{ flex: 1 }} />
        <div className={skeletonBar} style={{ height: 14, width: 60 }} />
        <div className={skeletonBar} style={{ height: 14, width: 60 }} />
        <div className={skeletonBar} style={{ height: 14, width: 60 }} />
        <div className={skeletonBar} style={{ height: 38, width: 140 }} />
      </div>

      {/* Hero */}
      <section style={{ background: "var(--c-bg-section)", padding: "80px 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <div className={skeletonBar} style={{ height: 24, width: 180, marginBottom: 24 }} />
            <div className={skeletonBar} style={{ height: 48, width: "90%", marginBottom: 14 }} />
            <div className={skeletonBar} style={{ height: 48, width: "70%", marginBottom: 24 }} />
            <div className={skeletonBar} style={{ height: 16, width: "85%", marginBottom: 8 }} />
            <div className={skeletonBar} style={{ height: 16, width: "75%", marginBottom: 28 }} />
            <div style={{ display: "flex", gap: 12 }}>
              <div className={skeletonBar} style={{ height: 56, width: 200 }} />
              <div className={skeletonBar} style={{ height: 56, width: 180 }} />
            </div>
          </div>
          <div className={skeletonBar} style={{ height: 360, width: "100%" }} />
        </div>
      </section>

      {/* Three card rows */}
      <section style={{ padding: "96px 0", background: "var(--c-bg)" }}>
        <div className="container">
          <div
            className={skeletonBar}
            style={{ height: 16, width: 120, margin: "0 auto 12px" }}
          />
          <div
            className={skeletonBar}
            style={{ height: 36, width: 360, margin: "0 auto 56px" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </section>

      <section style={{ padding: "96px 0", background: "var(--c-bg-section)" }}>
        <div className="container">
          <div
            className={skeletonBar}
            style={{ height: 36, width: 280, margin: "0 auto 56px" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </section>

      <section style={{ padding: "96px 0", background: "var(--c-bg)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
