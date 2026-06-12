import { z } from "zod";
import { slugSchema } from "./common";

const faqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

const pricingTierSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  features: z.array(z.string()).default([]),
  popular: z.boolean().default(false),
});

export const createServiceSchema = z.object({
  title: z.string().min(3).max(200),
  slug: slugSchema,
  shortDescription: z.string().max(300).default(""),
  content: z.string().default(""),
  coverImage: z.string().url().optional().or(z.literal("")),
  icon: z.string().default("Globe"),
  iconName: z.string().default("Globe"),
  accentColor: z.enum(["blue", "green", "orange", "pink", "purple", "teal"]).default("blue"),
  features: z.array(z.string()).default([]),
  faqs: z.array(faqSchema).default([]),
  pricingTiers: z.array(pricingTierSchema).default([]),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(200).optional().or(z.literal("")),
  visible: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
