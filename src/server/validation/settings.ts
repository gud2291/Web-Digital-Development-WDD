import { z } from "zod";

const businessSchema = z.object({
  phone: z.string().default(""),
  email: z.string().email().or(z.literal("")).default(""),
  address: z.string().default(""),
  hoursWeek: z.string().default(""),
  hoursSunday: z.string().default(""),
});

const socialSchema = z.object({
  fb: z.string().default(""),
  tw: z.string().default(""),
  li: z.string().default(""),
  ig: z.string().default(""),
  yt: z.string().default(""),
});

const analyticsSchema = z.object({
  ga4: z.string().default(""),
  gtm: z.string().default(""),
  clarity: z.string().default(""),
});

const quickActionSchema = z.object({
  label: z.string().min(1),
  payload: z.string().default(""),
});

const chatbotConfigSchema = z.object({
  name: z.string().default("Aria"),
  avatar: z.string().default(""),
  welcome: z.string().default(""),
  placeholder: z.string().default(""),
  quickActions: z.array(quickActionSchema).default([]),
});

const seoSchema = z.object({
  defaultOgImage: z.string().default(""),
  schemaOrg: z.string().default(""),
});

export const updateSettingsSchema = z.object({
  business: businessSchema.optional(),
  social: socialSchema.optional(),
  analytics: analyticsSchema.optional(),
  chatbot: chatbotConfigSchema.optional(),
  seo: seoSchema.optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
