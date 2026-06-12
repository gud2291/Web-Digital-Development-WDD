import { z } from "zod";

export const upsertSeoMetaSchema = z.object({
  pageSlug: z.string().min(1).max(120),
  title: z.string().max(120).default(""),
  description: z.string().max(200).default(""),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().url().optional().or(z.literal("")),
  canonical: z.string().url().optional().or(z.literal("")),
  noIndex: z.boolean().default(false),
});

export type UpsertSeoMetaInput = z.infer<typeof upsertSeoMetaSchema>;
