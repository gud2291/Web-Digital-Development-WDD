"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { Btn, Eyebrow } from "@/components/ui";

/**
 * Interactive pricing estimator (CLAUDE.md §13.1). 4-step wizard → a price
 * range. "Get Detailed Quote" dispatches a `wdd:prefill-contact` event that the
 * ContactForm below listens for, then scrolls to the form. No backend call for
 * the estimate; the real submission still goes through the contact form.
 */
type SiteType = "business" | "ecommerce" | "portfolio" | "webapp";
type Timeline = "asap" | "1mo" | "3mo" | "flexible";

const TYPES: { id: SiteType; label: string; icon: Parameters<typeof Icon>[0]["name"]; min: number; max: number; perPage: number }[] = [
  { id: "business", label: "Business / Brochure", icon: "monitor", min: 25000, max: 55000, perPage: 2500 },
  { id: "ecommerce", label: "E-commerce Store", icon: "cart", min: 60000, max: 140000, perPage: 3500 },
  { id: "portfolio", label: "Portfolio", icon: "sparkle", min: 15000, max: 38000, perPage: 1800 },
  { id: "webapp", label: "Web App / Portal", icon: "code", min: 120000, max: 280000, perPage: 6000 },
];

const TIMELINES: { id: Timeline; label: string; mult: number }[] = [
  { id: "asap", label: "ASAP (rush)", mult: 1.2 },
  { id: "1mo", label: "Within 1 month", mult: 1.0 },
  { id: "3mo", label: "2–3 months", mult: 0.95 },
  { id: "flexible", label: "Flexible", mult: 0.9 },
];

const inr = (n: number) => `₹${Math.round(n / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function estimate(type: SiteType, pages: number, seo: boolean, timeline: Timeline) {
  const t = TYPES.find((x) => x.id === type)!;
  const tl = TIMELINES.find((x) => x.id === timeline)!.mult;
  const pageCost = Math.max(0, pages - 5) * t.perPage;
  let min = (t.min + pageCost) * tl;
  let max = (t.max + pageCost * 1.4) * tl;
  if (seo) {
    min += 12000;
    max += 30000;
  }
  return { min, max };
}

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export function PricingCalculator() {
  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState<SiteType>("business");
  const [pages, setPages] = React.useState(5);
  const [seo, setSeo] = React.useState(true);
  const [timeline, setTimeline] = React.useState<Timeline>("1mo");

  const total = 5; // 4 questions + result
  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const { min, max } = estimate(type, pages, seo, timeline);

  const getQuote = () => {
    const typeLabel = TYPES.find((t) => t.id === type)!.label;
    const tlLabel = TIMELINES.find((t) => t.id === timeline)!.label;
    const detail = {
      service: type === "ecommerce" ? "E-commerce" : type === "webapp" ? "Development" : "Website Design",
      budget: `${inr(min)} – ${inr(max)}`,
      message: `I used the pricing calculator. Project: ${typeLabel}, ~${pages} pages, SEO: ${seo ? "yes" : "no"}, timeline: ${tlLabel}. Estimated range: ${inr(min)} – ${inr(max)}. Please send a detailed quote.`,
    };
    window.dispatchEvent(new CustomEvent("wdd:prefill-contact", { detail }));
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="card pricing-calc">
      <div className="pricing-calc__head">
        <div>
          <Eyebrow>QUICK ESTIMATE</Eyebrow>
          <h3 className="t-h3" style={{ fontSize: 22, marginTop: 4 }}>Get a ballpark in 30 seconds</h3>
        </div>
        <div className="pricing-calc__progress">{Math.min(step + 1, 4)} / 4</div>
      </div>
      <div className="pricing-calc__track">
        <div className="pricing-calc__bar" style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }} />
      </div>

      <div className="pricing-calc__body">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step === 0 && (
              <Step title="What kind of site do you need?">
                <div className="pricing-calc__grid">
                  {TYPES.map((t) => (
                    <button key={t.id} type="button" onClick={() => setType(t.id)} className={`pricing-calc__opt ${type === t.id ? "is-active" : ""}`}>
                      <Icon name={t.icon} size={22} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </Step>
            )}
            {step === 1 && (
              <Step title="Roughly how many pages?">
                <div className="pricing-calc__pages">{pages}{pages >= 50 ? "+" : ""} page{pages > 1 ? "s" : ""}</div>
                <input type="range" min={1} max={50} value={pages} onChange={(e) => setPages(Number(e.target.value))} className="pricing-calc__range" aria-label="Number of pages" />
                <div className="pricing-calc__range-labels"><span>1</span><span>50</span></div>
              </Step>
            )}
            {step === 2 && (
              <Step title="Do you want SEO included?">
                <div className="pricing-calc__grid pricing-calc__grid--2">
                  <button type="button" onClick={() => setSeo(true)} className={`pricing-calc__opt ${seo ? "is-active" : ""}`}>Yes, help me rank</button>
                  <button type="button" onClick={() => setSeo(false)} className={`pricing-calc__opt ${!seo ? "is-active" : ""}`}>Not right now</button>
                </div>
              </Step>
            )}
            {step === 3 && (
              <Step title="What's your timeline?">
                <div className="pricing-calc__grid pricing-calc__grid--2">
                  {TIMELINES.map((t) => (
                    <button key={t.id} type="button" onClick={() => setTimeline(t.id)} className={`pricing-calc__opt ${timeline === t.id ? "is-active" : ""}`}>{t.label}</button>
                  ))}
                </div>
              </Step>
            )}
            {step === 4 && (
              <div className="pricing-calc__result">
                <div className="t-small">Estimated project range</div>
                <div className="pricing-calc__amount">{inr(min)} – {inr(max)}</div>
                <p className="t-small" style={{ marginTop: 8 }}>
                  A rough guide based on your answers. Every project is scoped individually — get a written, fixed quote below.
                </p>
                <Btn size="lg" iconRight="arrowRight" style={{ marginTop: 18 }} onClick={getQuote}>
                  Get Detailed Quote
                </Btn>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {step < 4 && (
        <div className="pricing-calc__nav">
          <Btn variant="ghost" size="sm" onClick={back} disabled={step === 0}>Back</Btn>
          <Btn size="sm" iconRight="arrowRight" onClick={next}>{step === 3 ? "See estimate" : "Next"}</Btn>
        </div>
      )}
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>{title}</h4>
      {children}
    </div>
  );
}
