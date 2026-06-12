"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { siteConfig } from "@/config/site";

export function FloatingActions() {
  const [showTop, setShowTop] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="floating-actions">
      {/* WhatsApp + Call are hidden on mobile (< md) because the MobileBottomBar
          already provides them — showing both is redundant and overlaps. The
          `!` important modifier is needed because `.fab { display: grid }` is
          declared after Tailwind's utilities layer and would otherwise win. */}
      <a
        href={`https://wa.me/${siteConfig.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fab fab--whatsapp !hidden md:!grid"
        title="WhatsApp"
      >
        <Icon name="whatsapp" size={24} />
      </a>
      <a
        href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
        className="fab fab--phone !hidden md:!grid"
        title="Call Us"
      >
        <Icon name="phone" size={22} />
      </a>
      {showTop && (
        <button
          className="fab fab--top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Back to top"
          aria-label="Back to top"
        >
          <Icon name="arrowUp" size={18} />
        </button>
      )}
    </div>
  );
}
