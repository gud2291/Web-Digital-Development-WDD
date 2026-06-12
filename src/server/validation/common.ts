import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes only");

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
