"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFirstVisit } from "@/hooks/useFirstVisit";

/**
 * §17.2 — first-visit cinematic intro. The white WDD logo lands centred on the
 * brand gradient (scale 0.85→1 spring), tagline fades in below, a thin progress
 * bar fills, then the whole thing fades out. 1.4s total. Click to skip. Shows
 * only once per session (sessionStorage gate via useFirstVisit). Reduced-motion
 * users get a static logo + tagline for ~500ms, then a fade.
 */
const TAGLINE = "Web Digital Development";

export function BrandLoader() {
  const { isFirst, markSeen } = useFirstVisit();
  const reduced = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!isFirst) return;
    setVisible(true);
    const total = reduced ? 500 : 1400;
    const t = window.setTimeout(() => setVisible(false), total);
    return () => window.clearTimeout(t);
  }, [isFirst, reduced]);

  const skip = () => setVisible(false);

  return (
    <AnimatePresence onExitComplete={markSeen}>
      {visible && (
        <motion.div
          key="brand-loader"
          role="presentation"
          aria-hidden
          onClick={skip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.3, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "linear-gradient(135deg, #1B4DA8 0%, #2563EB 100%)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: 24, textAlign: "center" }}>
            {reduced ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/assets/logo-white.png" alt="Web Digital Development" width={180} style={logoStyle} />
            ) : (
              <motion.img
                src="/assets/logo-white.png"
                alt="Web Digital Development"
                width={180}
                style={logoStyle}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  scale: { type: "spring", stiffness: 200, damping: 18 },
                  opacity: { duration: 0.25, ease: "easeOut" },
                }}
              />
            )}

            {reduced ? (
              <p style={taglineStyle}>{TAGLINE}</p>
            ) : (
              <motion.p
                style={taglineStyle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
              >
                {TAGLINE}
              </motion.p>
            )}

            <div style={progressTrackStyle} aria-hidden>
              {reduced ? (
                <div style={{ ...progressFillStyle, width: "100%" }} />
              ) : (
                <motion.div
                  style={progressFillStyle}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const logoStyle: React.CSSProperties = {
  width: 180,
  height: "auto",
  display: "block",
};

const taglineStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: "0.08em",
  margin: 0,
};

const progressTrackStyle: React.CSSProperties = {
  width: 160,
  height: 2,
  background: "rgba(255,255,255,0.25)",
  borderRadius: 999,
  overflow: "hidden",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  background: "#fff",
};
