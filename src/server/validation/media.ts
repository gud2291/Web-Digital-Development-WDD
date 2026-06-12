import { z } from "zod";

export const createMediaSchema = z.object({
  filename: z.string().min(1),
  url: z.string().url(),
  publicId: z.string().min(1),
  mimeType: z.string().default(""),
  size: z.number().int().min(0).default(0),
  width: z.number().int().min(0).default(0),
  height: z.number().int().min(0).default(0),
  uploadedBy: z.string().default(""),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
