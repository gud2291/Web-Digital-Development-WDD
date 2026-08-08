import { z } from "zod";

/**
 * Note: unknown keys are stripped by zod, so the anti-spam fields the client
 * appends (`_hp_website`, `_elapsed`) never reach the DB — the route reads them
 * off the raw body before parsing.
 */
export const createContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(120)
    // A name with no letter at all is either a bot or unusable to reply to.
    .refine((v) => /\p{L}/u.test(v), "Enter a real name")
    .refine((v) => !/https?:\/\/|www\./i.test(v), "Enter a real name"),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().max(30).default(""),
  service: z.string().trim().max(120).default(""),
  budget: z.string().trim().max(120).default(""),
  message: z.string().trim().min(10).max(2000),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["new", "viewed", "replied", "closed"]),
});

export const contactQuerySchema = z.object({
  status: z.enum(["new", "viewed", "replied", "closed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
export type ContactQuery = z.infer<typeof contactQuerySchema>;
