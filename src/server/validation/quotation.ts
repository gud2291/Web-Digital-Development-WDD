import { z } from "zod";

const paymentTermSchema = z.object({
  percent: z.string().max(40).default(""),
  label: z.string().max(120).default(""),
  sub: z.string().max(200).default(""),
});

const featureBadgeSchema = z.object({
  title: z.string().max(80).default(""),
  subtitle: z.string().max(120).default(""),
});

const customServiceSchema = z.object({
  title: z.string().max(120).default(""),
  costRange: z.string().max(60).default(""),
  deliveryTime: z.string().max(120).default(""),
  scope: z.array(z.string().max(200)).default([]),
});

/** Admin: update the global quotation settings singleton. */
export const updateQuotationSettingsSchema = z.object({
  validity: z.string().max(80).default("1 Month"),
  deliveryTime: z.string().max(120).default(""),
  paymentTerms: z.array(paymentTermSchema).default([]),
  hostingCost: z.string().max(120).default(""),
  hostingNote: z.string().max(400).default(""),
  domainNote: z.string().max(400).default(""),
  featureBadges: z.array(featureBadgeSchema).default([]),
  customServices: z.array(customServiceSchema).default([]),
  greetingTemplate: z.string().max(800).default(""),
  footerNote: z.string().max(400).default(""),
});

/**
 * Admin: generate a quotation PDF for a client and either download it or email
 * it. Email is required only when emailing (enforced in the route).
 */
export const generateQuotationSchema = z.object({
  serviceSlug: z.string().min(1).max(120),
  clientName: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  business: z.string().max(160).optional().or(z.literal("")),
  developmentCost: z.string().max(60).optional().or(z.literal("")),
  customServiceTitle: z.string().max(120).optional().or(z.literal("")),
  customScope: z.array(z.string().max(200)).default([]),
  action: z.enum(["download", "email", "whatsapp"]).default("download"),
});

export type UpdateQuotationSettingsInput = z.infer<typeof updateQuotationSettingsSchema>;
export type GenerateQuotationInput = z.infer<typeof generateQuotationSchema>;
