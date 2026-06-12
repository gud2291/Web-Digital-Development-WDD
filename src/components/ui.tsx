"use client";

import * as React from "react";
import {
  Sparkles,
  Briefcase,
  FolderOpen,
  Workflow,
  Quote as QuoteIcon,
  BookOpen,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { Icon, type IconName } from "./Icon";
import { Reveal, RevealStagger, RevealItem } from "@/components/public/Reveal";
import { MagneticButton } from "@/components/public/MagneticButton";

// Re-export the framer-motion scroll-reveal primitives (§12.1) so existing
// `import { Reveal } from "@/components/ui"` call sites pick up the upgrade.
export { Reveal, RevealStagger, RevealItem };

// ---- Stars ----
export function Stars({ value = 5, size = 14 }: { value?: number; size?: number }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= value ? "#F59E0B" : "#E5EAF2"}
          stroke="none"
        >
          <polygon points="12 2 15 8.6 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.6 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ---- Badge ----
type BadgeKind = "primary" | "success" | "neutral" | "accent";
export function Badge({
  kind = "primary",
  children,
  style,
}: {
  kind?: BadgeKind;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const cls = `badge ${kind !== "primary" ? `badge--${kind}` : ""}`;
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
}

// ---- Button ----
type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: IconName;
  iconRight?: IconName;
}

export function Btn({
  variant = "primary",
  size,
  icon,
  iconRight,
  children,
  className = "",
  ...rest
}: BtnProps) {
  const cls = [
    "btn",
    variant !== "primary" && `btn--${variant}`,
    size === "sm" && "btn--sm",
    size === "lg" && "btn--lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  );
}

// ---- Placeholder ----
export function PH({
  w = "100%",
  h = 180,
  label = "image",
  variant,
  style,
}: {
  w?: string | number;
  h?: string | number;
  label?: string;
  variant?: "solid" | "dark";
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`ph ${variant ? `ph--${variant}` : ""}`}
      style={{ width: w, height: h, ...style }}
    >
      <span>{label}</span>
    </div>
  );
}

// ---- Section Eyebrow pill (§14.14) ----
// A refined pill badge for section eyebrows ("ABOUT WDD", "WHAT WE DO", …) with
// a small contextual lucide icon picked from the label text.
const EYEBROW_ICONS: { match: RegExp; Glyph: LucideIcon }[] = [
  { match: /about|story|who we are/i, Glyph: Sparkles },
  { match: /what we do|service|expertise/i, Glyph: Briefcase },
  { match: /portfolio|recent work|recent project|our work|case stud/i, Glyph: FolderOpen },
  { match: /process|how we work|approach|journey|proven/i, Glyph: Workflow },
  { match: /review|testimonial|client|voice/i, Glyph: QuoteIcon },
  { match: /blog|insight|article|from the studio/i, Glyph: BookOpen },
  { match: /faq|question|frequently/i, Glyph: HelpCircle },
];

export function Eyebrow({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const text = typeof children === "string" ? children : "";
  const Glyph = EYEBROW_ICONS.find((e) => e.match.test(text))?.Glyph;
  return (
    <span className={["section-eyebrow", className].filter(Boolean).join(" ")} style={style}>
      {Glyph ? <Glyph size={12} strokeWidth={2.2} aria-hidden /> : null}
      {children}
    </span>
  );
}

// ---- Section Header ----
export function SectionHead({
  kicker,
  title,
  sub,
  align = "center",
}: {
  kicker?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      style={{
        textAlign: align,
        maxWidth: 720,
        margin: align === "center" ? "0 auto 48px" : "0 0 40px 0",
      }}
    >
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <h2 className="t-h2" style={{ marginTop: 14 }}>
        {title}
      </h2>
      {sub && (
        <p className="t-lead" style={{ marginTop: 12 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ---- Logo ----
import NextImage from "next/image";
const LOGO_RATIO = 247 / 82; // intrinsic aspect of /assets/logo.png
export function Logo({ h = 32 }: { h?: number }) {
  return (
    <NextImage
      src="/assets/logo.png"
      alt="Web Digital Development"
      width={Math.round(h * LOGO_RATIO)}
      height={h}
      priority
      style={{ height: h, width: "auto" }}
    />
  );
}

// ---- Scroll Reveal ----
export function useScrollReveal() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, visible] as const;
}

// Reveal is now provided by @/components/public/Reveal (framer-motion, §12.1)
// and re-exported at the top of this file.

// ---- CTA Banner ----
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function CTABanner({
  title,
  sub,
  btnText = "Start Your Project",
  variant = "blue",
}: {
  title?: string;
  sub?: string;
  btnText?: string;
  variant?: "blue" | "dark";
}) {
  return (
    <Reveal>
      <section style={{ padding: "32px 0 80px" }}>
        <div className={`cta-banner container ${variant === "dark" ? "cta-banner--dark" : ""}`}>
          <div className="cta-banner__text">
            <h2>{title || "Let's Build a Website That Generates Real Business Leads."}</h2>
            <p>
              {sub ||
                "Tell us about your project — you'll hear back within one working day."}
            </p>
          </div>
          <div className="cta-banner__actions">
            <MagneticButton>
              <Link href="/contact">
                <Btn
                  size="lg"
                  iconRight="arrowRight"
                  style={{ background: "#fff", color: "#1D4ED8" }}
                >
                  {btnText}
                </Btn>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Btn size="lg" variant="whatsapp" icon="whatsapp">
                  Talk on WhatsApp
                </Btn>
              </a>
            </MagneticButton>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
