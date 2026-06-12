"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Btn } from "@/components/ui";

/**
 * Public error boundary — caught from any page inside `(public)`. Renders a
 * friendly recovery card with two paths forward: retry the same page, or
 * bail to the homepage. Real error details are logged but never shown to
 * the visitor.
 */
export default function PublicError({
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
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #F4F8FF 0%, #fff 60%)",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="card"
        style={{
          maxWidth: 520,
          width: "100%",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#FEE2E2",
            color: "#DC2626",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 18px",
          }}
        >
          <AlertTriangle size={36} strokeWidth={1.75} />
        </div>
        <h1 className="t-h3" style={{ fontSize: 26 }}>Something went wrong</h1>
        <p className="t-small" style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>
          We hit an unexpected snag while loading this page. You can try again, or head back to
          the homepage while we sort it out.
        </p>
        {error.digest ? (
          <p
            className="t-small"
            style={{ marginTop: 14, fontSize: 11, color: "#94A3B8", fontFamily: "var(--ff-mono)" }}
          >
            Ref: {error.digest}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 26,
            flexWrap: "wrap",
          }}
        >
          <Btn type="button" onClick={reset} iconRight="arrowRight">
            Try again
          </Btn>
          <Link href="/">
            <Btn type="button" variant="secondary" icon="home">
              Go home
            </Btn>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
