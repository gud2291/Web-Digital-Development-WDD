"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { Btn, Logo } from "@/components/ui";
import { siteConfig } from "@/config/site";

/**
 * Mobile nav drawer (CLAUDE.md §12.22). Slides in from the right (80% width),
 * blurred backdrop, large stacked links that stagger in, and closes on link
 * click or backdrop click. Replaces the old CSS slide-in `.site-nav` menu.
 */
interface NavItem {
  label: string;
  to: string;
}

const linkVariants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0 },
};

export function MobileMenu({ open, onClose, items, socialLinks }: { open: boolean; onClose: () => void; items: NavItem[]; socialLinks?: Record<string, string> }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(11,27,59,0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "80%",
              maxWidth: 380,
              background: "var(--c-bg)",
              display: "flex",
              flexDirection: "column",
              padding: "20px 22px calc(20px + env(safe-area-inset-bottom))",
              boxShadow: "-20px 0 60px rgba(15,23,42,.25)",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Logo h={30} />
              <button type="button" onClick={onClose} aria-label="Close menu" className="mobile-menu__close">
                <Icon name="x" size={22} />
              </button>
            </div>

            <motion.nav
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
              style={{ display: "flex", flexDirection: "column", marginTop: 28, gap: 2 }}
            >
              {items.map((n) => (
                <motion.div key={n.to} variants={linkVariants}>
                  <Link href={n.to} onClick={onClose} className="mobile-menu__link">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            <div style={{ marginTop: "auto", paddingTop: 24 }}>
              <Link href="/contact" onClick={onClose}>
                <Btn icon="phone" style={{ width: "100%" }}>
                  Book a Consultation
                </Btn>
              </Link>
              <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
                {(["facebook", "linkedin", "instagram", "youtube"] as const).map((s) => {
                  const url = socialLinks?.[s] || siteConfig.social[s];
                  if (!url) return null;
                  return (
                    <a
                      key={s}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-menu__social"
                      aria-label={s}
                    >
                      <Icon name={s} size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
