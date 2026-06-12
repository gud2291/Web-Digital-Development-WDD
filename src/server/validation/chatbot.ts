import { z } from "zod";

export const createChatbotSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(1),
  category: z.string().default("general"),
});

export const updateChatbotSchema = createChatbotSchema.partial();

export type CreateChatbotInput = z.infer<typeof createChatbotSchema>;
export type UpdateChatbotInput = z.infer<typeof updateChatbotSchema>;
