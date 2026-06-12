"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { useChatbotStore } from "@/store/chatbot";

/**
 * Floating "Discuss Your Project" pill (14.2). Appears once the visitor has scrolled
 * past 30% of the page, sits above the chat bubble (bottom-right), and hides
 * whenever the chat window is open so the two never collide.
 */
export function StickyQuoteCTA() {
  const [scrolledEnough, setScrolledEnough] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const chatOpen = useChatbotStore((s) => s.open);

  React.useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrolledEnough(scrollable > 0 && window.scrollY > scrollable * 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const visible = scrolledEnough && !chatOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: "fixed",
            // Desktop: above the chat bubble (bottom 18px). Mobile: clears the
            // bottom bar (~60px) AND the repositioned chat bubble (72–128px),
            // so it stacks at 140px. See Z-INDEX HIERARCHY in globals.css.
            right: isMobile ? 14 : 18,
            bottom: isMobile ? 140 : 84,
            zIndex: 85,
          }}
        >
          <Link
            href="/contact"
            aria-label="Discuss your project"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#2563EB",
              color: "#fff",
              borderRadius: 999,
              padding: isMobile ? "10px 16px" : "12px 20px",
              fontSize: isMobile ? 13 : 14,
              fontWeight: 700,
              boxShadow: "0 10px 24px rgba(37,99,235,.35)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="sparkle" size={isMobile ? 15 : 16} />
            {isMobile ? "Your Project" : "Discuss Your Project"}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
