import { z } from "zod";

export const createTestimonialSchema = z.object({
  clientName: z.string().min(2).max(120),
  clientPhoto: z.string().url().optional().or(z.literal("")),
  clientCompany: z.string().default(""),
  message: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  helpfulCount: z.number().int().min(0).default(0),
  adminHearted: z.boolean().default(false),
  visible: z.boolean().default(true),
  source: z.enum(["google", "manual"]).default("manual"),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const publicTestimonialSchema = z.object({
  clientName: z.string().min(2).max(120),
  clientCompany: z.string().max(120).default(""),
  message: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
export type PublicTestimonialInput = z.infer<typeof publicTestimonialSchema>;
