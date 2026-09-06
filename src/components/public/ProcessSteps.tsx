"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SectionHead } from "@/components/ui";

/**
 * Animated 4-step process (CLAUDE.md §12.14). Lottie skipped to keep the bundle
 * small — instead each icon is an SVG drawn with framer-motion `pathLength` that
 * autoplays on scroll-into-view, and a connecting line fills left→right on
 * desktop. Reduced-motion users see the finished icons with no draw animation.
 */
interface Step {
  n: string;
  title: string;
  desc: string;
  paths: string[];
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Discovery",
    desc: "We learn your goals, audience and competitors.",
    paths: ["M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z", "M15.5 15.5 21 21"],
  },
  {
    n: "02",
    title: "Design & Prototype",
    desc: "Wireframes → polished UI you can click through.",
    paths: ["M13 6l5 5L8 21l-5 1 1-5L13 6z", "M11 8l5 5"],
  },
  {
    n: "03",
    title: "Development",
    desc: "Fast, SEO-ready code with rigorous QA.",
    paths: ["M8 6 2 12l6 6", "M16 6l6 6-6 6"],
  },
  {
    n: "04",
    title: "Launch & Grow",
    desc: "Go live, analytics, plus 15 days of support.",
    paths: [
      "M5 16c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2 2 0 0 0-2.9-.1z",
      "M12 15l-3-3a22 22 0 0 1 2-4 12 12 0 0 1 9-5c0 3-1 7-5 10a22 22 0 0 1-4 2z",
    ],
  },
];

function StepIcon({ paths, inView, reduce, order }: { paths: string[]; inView: boolean; reduce: boolean; order: number }) {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.8, ease: "easeInOut", delay: reduce ? 0 : 0.2 + order * 0.15 + i * 0.12 }}
        />
      ))}
    </svg>
  );
}

export function ProcessSteps() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          kicker="HOW WE WORK"
          title="Our 4-Step Process"
          sub="Transparent, milestone-driven and quick to ship."
        />
        <div className="process-steps" ref={ref}>
          {/* Connector line — desktop only, fills left→right on scroll. */}
          <motion.div
            className="process-steps__line"
            initial={{ scaleX: reduce ? 1 : 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: reduce ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: "easeOut" }}
            aria-hidden="true"
          />
          <div className="process-grid process-grid--4">
            {STEPS.map((s, idx) => (
              <div key={s.n} className="card process-card card--interactive">
                <div className="process-steps__icon">
                  <StepIcon paths={s.paths} inView={inView} reduce={reduce} order={idx} />
                  <span className="process-steps__num">{s.n}</span>
                </div>
                <h4 className="t-h4" style={{ fontSize: 18, marginTop: 14 }}>{s.title}</h4>
                <p className="t-small" style={{ marginTop: 8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
