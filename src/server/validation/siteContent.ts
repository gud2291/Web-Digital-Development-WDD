import { z } from "zod";

const timelineItemSchema = z.object({
  year: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
});

const aboutSchema = z.object({
  heroImage: z.string().default(""),
  heading: z.string().default(""),
  description: z.string().default(""),
  whyChooseUs: z.array(z.string()).default([]),
  timeline: z.array(timelineItemSchema).default([]),
});

const bannerSchema = z.object({
  bg: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  ctaText: z.string().default(""),
  ctaUrl: z.string().default(""),
});

const contactPageSchema = z.object({
  mapEmbedUrl: z.string().default(""),
  descText: z.string().default(""),
  budgetRanges: z.array(z.string()).default([]),
  quickPromises: z.array(z.string()).default([]),
});

const navLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const navLinksSchema = z.object({
  header: z.array(navLinkSchema).default([]),
  footerQuick: z.array(navLinkSchema).default([]),
  footerServices: z.array(navLinkSchema).default([]),
});

const footerSchema = z.object({
  tagline: z.string().default(""),
  copyright: z.string().default(""),
  policyLinks: z.array(navLinkSchema).default([]),
});

export const updateSiteContentSchema = z.object({
  about: aboutSchema.optional(),
  banners: z.record(z.string(), bannerSchema).optional(),
  contactPage: contactPageSchema.optional(),
  navLinks: navLinksSchema.optional(),
  footer: footerSchema.optional(),
});

export type UpdateSiteContentInput = z.infer<typeof updateSiteContentSchema>;
