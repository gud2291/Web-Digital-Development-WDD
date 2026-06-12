"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { Btn, Logo } from "./ui";
import { MobileMenu } from "@/components/public/MobileMenu";
import { ThemeToggle } from "@/components/public/ThemeToggle";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader({ socialLinks }: { socialLinks?: Record<string, string> }) {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when the mobile drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const activeTo = NAV_ITEMS.find((n) => isActive(n.to))?.to;
  // The sliding underline sits under the hovered item, or the active page when nothing is hovered.
  const indicatorTo = hovered ?? activeTo;

  return (
    <header className={`site-hdr ${scrolled ? "site-hdr--scrolled" : ""}`}>
      <div className="container site-hdr__inner">
        <Link href="/" className="site-hdr__logo">
          <Logo h={46} />
        </Link>

        <nav className="site-nav" onMouseLeave={() => setHovered(null)}>
          {NAV_ITEMS.map((n) => (
            <div
              key={n.to}
              className="site-nav__item"
              onMouseEnter={() => setHovered(n.to)}
            >
              <Link href={n.to} className={`site-nav__link ${isActive(n.to) ? "active" : ""}`}>
                {n.label}
              </Link>
              {indicatorTo === n.to && (
                <motion.span
                  layoutId="nav-indicator"
                  className="site-nav__indicator"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </div>
          ))}
        </nav>

        <div className="site-hdr__actions">
          <ThemeToggle />
          <Link href="/contact" className="site-hdr__cta-desktop">
            <Btn icon="phone" size="sm">Book a Consultation</Btn>
          </Link>
          <button
            className="site-hdr__hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? "x" : "menu"} size={22} />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} items={NAV_ITEMS} socialLinks={socialLinks} />
    </header>
  );
}
