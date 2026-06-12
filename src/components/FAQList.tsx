"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

/**
 * FAQ accordion (CLAUDE.md §12.8) — shadcn/ui Accordion with smooth height
 * animation, single-open, chevron rotation, and a primary accent border on the
 * open item. Used on the services listing, every service detail, and every
 * registration detail page.
 */
export function FAQList({ items }: { items: [string, string][] }) {
  return (
    <Accordion type="single" collapsible className="flex flex-col gap-3">
      {items.map(([q, a], i) => (
        <AccordionItem
          key={q}
          value={`faq-${i}`}
          className="rounded-xl border border-border bg-white px-5 transition-colors data-[state=open]:border-l-2 data-[state=open]:border-l-primary-600 data-[state=open]:shadow-sm dark:border-[#1E2A44] dark:bg-[#111A2E]"
        >
          <AccordionTrigger>{q}</AccordionTrigger>
          <AccordionContent>{a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
