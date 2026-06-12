import { z } from "zod";

export const legalSlugSchema = z.enum(["privacy-policy", "terms", "refund"]);

export const upsertLegalPageSchema = z.object({
  slug: legalSlugSchema,
  title: z.string().min(2).max(200),
  content: z.string().min(1),
});

export type UpsertLegalPageInput = z.infer<typeof upsertLegalPageSchema>;
