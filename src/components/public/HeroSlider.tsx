"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Btn } from "@/components/ui";
import { MagneticButton } from "@/components/public/MagneticButton";

export interface HeroSlideData {
  type: string;
  image: string;
  video: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
}

interface HeroSliderProps {
  slides: HeroSlideData[];
  badgeText?: string;
  /** Auto-advance interval in ms (default 6000). */
  interval?: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function renderTitle(title: string) {
  if (!title) return null;
  // **highlight** markers → accent-coloured spans.
  return title.split("**").map((part, idx) =>
    idx % 2 === 1 ? (
      <span key={idx} style={{ color: "#22C55E" }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

/**
 * Premium hero slider (CLAUDE.md §12.9). Pure framer-motion (no carousel lib):
 * auto-advance (6s) driven by a rAF progress bar, pause-on-hover, touch swipe,
 * prev/next arrows (desktop), dot jumps, ken-burns image zoom, and text that
 * fades + slides in 180ms after the image crossfade. Videos play on desktop
 * only (poster/image on mobile) and only for the active slide.
 */
export function HeroSlider({ slides, badgeText, interval = 6000 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduce = useReducedMotion();
  const progressRef = useRef(0);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const touchStartX = useRef<number | null>(null);
  const total = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const goTo = useCallback((i: number) => {
    progressRef.current = 0;
    setProgress(0);
    setCurrent(((i % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // rAF loop: fills the progress bar 0→1 over `interval`, then advances. Freezes
  // while hovered. Respects reduced motion by holding on the first slide.
  useEffect(() => {
    if (total <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused) {
        progressRef.current += dt / interval;
        if (progressRef.current >= 1) {
          progressRef.current = 0;
          setCurrent((c) => (c + 1) % total);
        }
        setProgress(progressRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, interval, total]);

  // Only the active slide's video plays.
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idx, el]) => {
      if (!el) return;
      if (Number(idx) === current) el.play().catch(() => {});
      else el.pause();
    });
  }, [current]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <>
      {slides.map((s, i) => {
        const isVideo = s.type === "video" && !!s.video;
        const isActive = i === current;
        const HeadingTag = i === 0 ? "h1" : "h2";
        return (
          <div
            key={i}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            {/* Background media + ken-burns zoom (scale 1 → 1.06 over slide duration). */}
            <motion.div
              animate={{ scale: isActive && !reduce ? 1.06 : 1 }}
              transition={{ duration: isActive && !reduce ? interval / 1000 : 0.6, ease: "linear" }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                background: "var(--grad-hero)",
              }}
            >
              {isVideo && !isMobile && s.video ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={s.image || undefined}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                >
                  <source src={s.video} type="video/mp4" />
                </video>
              ) : s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image}
                  alt={s.title || `Slide ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : isVideo && s.video ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                >
                  <source src={s.video} type="video/mp4" />
                </video>
              ) : null}
            </motion.div>

            {/* Readability overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                background: "linear-gradient(180deg, rgba(11,27,59,0.55) 0%, rgba(11,27,59,0.75) 100%)",
              }}
            />

            {/* Content — fades + slides in 180ms after the image crossfade. */}
            <div
              className="container"
              style={{
                position: "relative",
                zIndex: 3,
                padding: "100px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <motion.div
                className="hero__text"
                initial={false}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 24 }}
                transition={{ duration: reduce ? 0 : 0.5, ease: EASE, delay: isActive && !reduce ? 0.18 : 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: 800 }}
              >
                <div
                  className="hero__pill"
                  style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                >
                  <span className="hero__dot" />
                  {badgeText || "Available for new projects"}
                </div>
                <HeadingTag className="t-h1" style={{ color: "#fff", marginTop: 18 }}>
                  {renderTitle(s.title) || (
                    <>
                      Build a Website That <span style={{ color: "#4ADE80" }}>Brings Real</span>
                      <br />
                      Business Leads.
                    </>
                  )}
                </HeadingTag>
                <p className="t-lead" style={{ marginTop: 22, maxWidth: 540, color: "#BFDBFE" }}>
                  {s.subtitle ||
                    "We design and develop modern, responsive websites that attract qualified visitors and turn them into paying customers. Delhi-based, results-obsessed."}
                </p>
                <div className="hero__btns" style={{ justifyContent: "flex-start" }}>
                  <MagneticButton>
                    <Link href={s.ctaUrl || "/contact"}>
                      <Btn size="lg" iconRight="arrowRight">
                        {s.ctaText || "Book a Consultation"}
                      </Btn>
                    </Link>
                  </MagneticButton>
                  {/* §14.7 — hide the secondary CTA when the slide's own CTA already says "See Our Work" (no duplicate). */}
                  {(s.ctaText || "Book a Consultation").trim().toLowerCase() !== "see our work" && (
                    <MagneticButton>
                      <Link href="/projects">
                        <Btn size="lg" variant="secondary" iconRight="arrowRight">
                          See Our Work
                        </Btn>
                      </Link>
                    </MagneticButton>
                  )}
                </div>
                {/* §14.13 — single text-only trust badge, slide 1 only. */}
                {i === 0 && (
                  <div className="hero__trust">
                    <span className="hero-trust-badge hero-trust-badge--on-dark">⭐ 4.9 / 5 — 130+ clients</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        );
      })}

      {/* Prev / next arrows — desktop only (mobile uses swipe). */}
      {total > 1 && !isMobile && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="hero-arrow hero-arrow--prev"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="hero-arrow hero-arrow--next"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? 28 : 10,
                height: 10,
                borderRadius: 999,
                border: "none",
                background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Auto-advance progress bar */}
      {total > 1 && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, zIndex: 20, background: "rgba(255,255,255,0.15)" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, progress * 100)}%`,
              background: "linear-gradient(90deg, #60A5FA, #ffffff)",
              transition: "width 90ms linear",
            }}
          />
        </div>
      )}
    </>
  );
}
