import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2).max(120),
  designation: z.string().default(""),
  photo: z.string().url().optional().or(z.literal("")),
  bio: z.string().default(""),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  visible: z.boolean().default(true),
});

export const updateTeamSchema = createTeamSchema.partial();

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
