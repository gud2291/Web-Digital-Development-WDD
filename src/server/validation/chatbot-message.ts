import { z } from "zod";

const chatMsgSchema = z.object({
  role: z.enum(["user", "bot"]),
  text: z.string().max(2000),
});

export const chatbotMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(1500, "Message too long"),
  sessionId: z.string().min(8).max(64),
  history: z.array(chatMsgSchema).max(20).default([]),
});

export type ChatbotMessageInput = z.infer<typeof chatbotMessageSchema>;
export type ChatMsg = z.infer<typeof chatMsgSchema>;

export const chatbotEscalateSchema = z.object({
  sessionId: z.string().min(8).max(64),
  history: z.array(chatMsgSchema).max(40).default([]),
  name: z.string().max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
});

export type ChatbotEscalateInput = z.infer<typeof chatbotEscalateSchema>;
