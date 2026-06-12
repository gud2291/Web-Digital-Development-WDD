import { NextResponse } from "next/server";
import { chatbotMessageSchema } from "@/server/validation/chatbot-message";
import { generateSmartReply } from "@/server/ai/smart-reply";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { handle, getClientIp, apiError } from "@/server/utils/apiError";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);

    // §11.1: 5 messages / 30 seconds / IP.
    const rl = await checkRateLimit(`chatbot:${ip}`, { limit: 5, window: "30 s" });
    if (!rl.success) {
      return apiError("Slow down a bit — try again in 30 sec", 429);
    }

    const body = await req.json();
    const data = chatbotMessageSchema.parse(body);

    try {
      const reply = await generateSmartReply(data.message, data.history);
      return NextResponse.json({
        reply,
        sessionId: data.sessionId,
      });
    } catch (err) {
      logger.error({ err }, "smart-reply failed");
      return apiError(
        "I'm having trouble right now — please try again in a moment, or use the contact form.",
        502
      );
    }
  });
}
