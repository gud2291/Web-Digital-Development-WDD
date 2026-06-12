"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Scroll-reveal primitives (CLAUDE.md §12.1).
 *
 * - <Reveal>        fades + slides a section up as it enters the viewport.
 * - <RevealStagger> + <RevealItem> stagger a grid of children (0.08s apart).
 *
 * All respect prefers-reduced-motion by rendering a plain <div> (no animation).
 * `delay` is kept (in ms) for backwards compatibility with existing call sites.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function RevealStagger({ children, className, style }: Omit<RevealProps, "delay">) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, style }: Omit<RevealProps, "delay">) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div className={className} style={style} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
