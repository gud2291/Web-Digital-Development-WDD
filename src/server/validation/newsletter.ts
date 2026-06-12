import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email("Enter a valid email"),
  source: z.string().max(40).optional().default("footer"),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
