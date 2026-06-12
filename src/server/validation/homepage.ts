import { z } from "zod";

const heroSlideSchema = z.object({
  type: z.enum(["image", "video"]).default("image"),
  image: z.string().default(""),
  video: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  ctaText: z.string().default(""),
  ctaUrl: z.string().default(""),
});

const statSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const clientLogoSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  visible: z.boolean().default(true),
});

const sectionTitlesSchema = z.object({
  portfolio: z.string().default("Our Portfolio"),
  services: z.string().default("Our Services"),
  testimonials: z.string().default("Client Love"),
  badge: z.string().default(""),
});

const ctaBannerSchema = z.object({
  title: z.string().default(""),
  sub: z.string().default(""),
});

export const updateHomepageSchema = z.object({
  heroSlides: z.array(heroSlideSchema).optional(),
  stats: z.array(statSchema).optional(),
  clientLogos: z.array(clientLogoSchema).optional(),
  ctaBanner: ctaBannerSchema.optional(),
  sectionTitles: sectionTitlesSchema.optional(),
});

export type UpdateHomepageInput = z.infer<typeof updateHomepageSchema>;
