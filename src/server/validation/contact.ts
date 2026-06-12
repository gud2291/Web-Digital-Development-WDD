import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).default(""),
  service: z.string().max(120).default(""),
  budget: z.string().max(120).default(""),
  message: z.string().min(10).max(2000),
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
