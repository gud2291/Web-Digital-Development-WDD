import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(2).max(200),
  category: z.string().default("Web"),
  description: z.string().default(""),
  image: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().max(300).optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
  tech: z.array(z.string()).default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
