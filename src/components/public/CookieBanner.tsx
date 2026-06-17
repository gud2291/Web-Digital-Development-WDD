"use client";

import * as React from "react";
import Script from "next/script";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const PRIMARY = "#2563EB";
// §14.3 — token-backed so the banner flips correctly in dark mode.
const INK = "var(--c-text)";

// NEXT_PUBLIC_ vars are inlined into the client bundle at build time, so we read
// it directly rather than importing the server env module (which would throw in
// the browser when it tries to validate server-only secrets).
const GA_ID_ENV = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID_ENV = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_ID_ENV = process.env.NEXT_PUBLIC_CLARITY_ID;

export interface AnalyticsIds {
  ga4?: string;
  gtm?: string;
  clarity?: string;
}

/**
 * Cookie consent banner (14.1). Always mounted in the public layout: it shows
 * the slide-up banner until a choice is made, and — once analytics consent is
 * granted — loads Google Analytics 4, GTM, and Clarity via next/script. No
 * tracking script loads without explicit consent.
 */
export function CookieBanner({ analyticsIds }: { analyticsIds?: AnalyticsIds }) {
  const { consent, loaded, decided, save, acceptAll, declineAll } = useCookieConsent();
  const [customiseOpen, setCustomiseOpen] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(true);
  const [marketing, setMarketing] = React.useState(true);

  const analyticsAllowed = consent?.analytics === true;

  // Prefer DB-set ID, fall back to env var
  const GA_ID = analyticsIds?.ga4 || GA_ID_ENV;
  const GTM_ID = analyticsIds?.gtm || GTM_ID_ENV;
  const CLARITY_ID = analyticsIds?.clarity || CLARITY_ID_ENV;

  return (
    <>
      {/* GA4 — only when the visitor has consented to analytics. */}
      {GA_ID && analyticsAllowed && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {/* GTM — only when the visitor has consented to analytics. */}
      {GTM_ID && analyticsAllowed && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}

      {/* Microsoft Clarity — only when the visitor has consented to analytics. */}
      {CLARITY_ID && analyticsAllowed && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      )}

      {/* Banner */}
      <AnimatePresence>
        {loaded && !decided && !customiseOpen && (
          <motion.div
            role="region"
            aria-label="Cookie consent"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            style={{
              position: "fixed",
              left: 16,
              right: 16,
              bottom: 16,
              // Below the mobile nav menu (200). See Z-INDEX HIERARCHY in globals.css.
              zIndex: 150,
              background: "var(--c-bg)",
              border: "1px solid var(--c-border)",
              borderRadius: 14,
              boxShadow: "0 16px 40px rgba(15,23,42,.16)",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  flex: "0 0 auto",
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "var(--c-primary-50)",
                  color: PRIMARY,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name="shield" size={18} />
              </span>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--c-text-muted)" }}>
                We use cookies to improve your experience and understand how the site is used. You
                can accept all, decline non-essential cookies, or choose what to allow.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "0 0 auto" }}>
              <button type="button" onClick={() => setCustomiseOpen(true)} style={ghostBtn}>
                Customise
              </button>
              <button type="button" onClick={declineAll} style={outlineBtn}>
                Decline
              </button>
              <button type="button" onClick={acceptAll} style={primaryBtn}>
                Accept all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customise modal */}
      <AnimatePresence>
        {customiseOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCustomiseOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              // Below the mobile nav menu (200). See Z-INDEX HIERARCHY in globals.css.
              zIndex: 160,
              background: "rgba(15,23,42,.5)",
              display: "grid",
              placeItems: "center",
              padding: 20,
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Cookie preferences"
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 460,
                background: "var(--c-bg)",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 24px 60px rgba(15,23,42,.28)",
              }}
            >
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: INK }}>
                Cookie preferences
              </h3>
              <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "var(--c-text-muted)" }}>
                Choose which cookies we can use. Essential cookies are always on.
              </p>

              <ConsentRow
                title="Essential"
                desc="Required for the site to work (sessions, security). Always active."
                checked
                disabled
              />
              <ConsentRow
                title="Analytics"
                desc="Anonymous usage data via Google Analytics to help us improve."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ConsentRow
                title="Marketing"
                desc="Used to measure and improve our campaigns."
                checked={marketing}
                onChange={setMarketing}
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    declineAll();
                    setCustomiseOpen(false);
                  }}
                  style={outlineBtn}
                >
                  Decline all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    save({ analytics, marketing });
                    setCustomiseOpen(false);
                  }}
                  style={primaryBtn}
                >
                  Save preferences
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ConsentRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 0",
        borderTop: "1px solid var(--c-border)",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ marginTop: 3, width: 18, height: 18, accentColor: PRIMARY, cursor: disabled ? "default" : "pointer" }}
      />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: INK }}>{title}</span>
        <span style={{ display: "block", fontSize: 12.5, color: "var(--c-text-muted)", marginTop: 2 }}>{desc}</span>
      </span>
    </label>
  );
}

const baseBtn: React.CSSProperties = {
  fontSize: 13.5,
  fontWeight: 600,
  borderRadius: 9,
  padding: "9px 16px",
  cursor: "pointer",
  border: "1px solid transparent",
  fontFamily: "inherit",
};
const primaryBtn: React.CSSProperties = { ...baseBtn, background: PRIMARY, color: "#fff" };
const outlineBtn: React.CSSProperties = { ...baseBtn, background: "var(--c-bg)", color: INK, borderColor: "var(--c-border-strong)" };
const ghostBtn: React.CSSProperties = { ...baseBtn, background: "transparent", color: "var(--c-text-muted)" };
