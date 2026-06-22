"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";
import { Btn, Logo } from "./ui";
import { MobileMenu } from "@/components/public/MobileMenu";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { LanguageSwitcher } from "@/components/public/LanguageSwitcher";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

export interface NavService {
  label: string;
  slug: string;
}

export function SiteHeader({
  socialLinks,
  services = [],
}: {
  socialLinks?: Record<string, string>;
  services?: NavService[];
}) {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [servicesOpen, setServicesOpen] = React.useState(false);
  const servicesRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Lock body scroll when the mobile drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close the services dropdown on Escape or click-outside.
  React.useEffect(() => {
    if (!servicesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [servicesOpen]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const activeTo = NAV_ITEMS.find((n) => isActive(n.to))?.to;
  // The sliding underline sits under the hovered item, or the active page when nothing is hovered.
  const indicatorTo = hovered ?? activeTo;
  const hasServices = services.length > 0;

  return (
    <header className={`site-hdr ${scrolled ? "site-hdr--scrolled" : ""}`}>
      <div className="container site-hdr__inner">
        <Link href="/" className="site-hdr__logo">
          <Logo h={46} />
        </Link>

        <nav className="site-nav" onMouseLeave={() => setHovered(null)}>
          {NAV_ITEMS.map((n) => {
            const isServices = n.to === "/services" && hasServices;
            return (
              <div
                key={n.to}
                ref={isServices ? servicesRef : undefined}
                className={`site-nav__item ${isServices ? "site-nav__item--dropdown" : ""}`}
                onMouseEnter={() => {
                  setHovered(n.to);
                  if (isServices) setServicesOpen(true);
                }}
                onMouseLeave={() => {
                  if (isServices) setServicesOpen(false);
                }}
              >
                <Link
                  href={n.to}
                  className={`site-nav__link ${isActive(n.to) ? "active" : ""}`}
                  aria-haspopup={isServices ? "menu" : undefined}
                  aria-expanded={isServices ? servicesOpen : undefined}
                  onFocus={isServices ? () => setServicesOpen(true) : undefined}
                >
                  {n.label}
                </Link>
                {indicatorTo === n.to && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="site-nav__indicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {isServices && (
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        role="menu"
                        aria-label="Services"
                        className="nav-dropdown"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
                      >
                        {services.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/services/${s.slug}`}
                            role="menuitem"
                            className="nav-dropdown__link"
                            onClick={() => setServicesOpen(false)}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        <div className="site-hdr__actions">
          <LanguageSwitcher variant="desktop" />
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

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} items={NAV_ITEMS} services={services} socialLinks={socialLinks} />
    </header>
  );
}
