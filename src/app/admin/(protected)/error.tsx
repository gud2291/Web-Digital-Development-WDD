"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Btn } from "@/components/ui";

/**
 * Admin error boundary — caught from any page inside `(protected)`. The
 * surrounding admin shell (sidebar + topbar) is still rendered by Next.js, so
 * this only fills the content area.
 *
 * Two recovery paths:
 *   - retry the same page (most failures are transient — DB hiccup, timeout)
 *   - sign out (escape hatch for stale-session bugs)
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        background: "#fff",
        border: "1px solid var(--c-border)",
        borderRadius: 12,
        padding: 40,
        textAlign: "center",
        maxWidth: 560,
        margin: "40px auto",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#FEE2E2",
          color: "#DC2626",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 18px",
        }}
      >
        <AlertTriangle size={32} strokeWidth={1.75} />
      </div>
      <h1 className="t-h3" style={{ fontSize: 22 }}>This page hit an error</h1>
      <p className="t-small" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
        Something went wrong loading or running this admin page. You can retry the same view, or
        sign out and back in if the problem persists.
      </p>
      {error.digest ? (
        <p
          className="t-small"
          style={{
            marginTop: 14,
            fontSize: 11,
            color: "#94A3B8",
            fontFamily: "var(--ff-mono)",
          }}
        >
          Ref: {error.digest}
        </p>
      ) : null}
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginTop: 22,
          flexWrap: "wrap",
        }}
      >
        <Btn type="button" onClick={reset} iconRight="arrowRight">
          Try again
        </Btn>
        <Btn
          type="button"
          variant="secondary"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          Sign out
        </Btn>
      </div>
    </motion.div>
  );
}
